import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, update, push, onDisconnect } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ChatMessage, Color } from '../types';

interface UseMultiplayerOptions {
  onMove?: (from: string, to: string, promotion?: string) => void;
  onChat?: (message: ChatMessage) => void;
  onRematchRequest?: () => void;
  onOpponentResign?: () => void;
  onDrawOffer?: () => void;
  onDrawAccepted?: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

interface UseMultiplayerReturn {
  peerId: string | null;
  isHost: boolean;
  isConnected: boolean;
  opponentConnected: boolean;
  playerColor: Color;
  chatMessages: ChatMessage[];
  createGame: () => Promise<string>;
  joinGame: (gameId: string) => Promise<boolean>;
  sendMove: (from: string, to: string, promotion?: string) => void;
  sendChat: (message: string) => void;
  requestRematch: () => void;
  resign: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  disconnect: () => void;
}

function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useFirebaseMultiplayer(options: UseMultiplayerOptions = {}): UseMultiplayerReturn {
  const {
    onMove,
    onChat,
    onRematchRequest,
    onOpponentResign,
    onDrawOffer,
    onDrawAccepted,
    onConnectionChange,
  } = options;

  const [gameId, setGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const unsubscribeRef = useRef<(() => void)[]>([]);
  const lastMoveRef = useRef<string | null>(null);
  const lastActionRef = useRef<string | null>(null);

  // Clean up listeners
  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach(unsub => unsub());
    unsubscribeRef.current = [];
  }, []);

  // Create a new game as host
  const createGame = useCallback(async (): Promise<string> => {
    const code = generateGameCode();
    const gameRef = ref(database, `games/${code}`);

    try {
      await set(gameRef, {
        host: true,
        hostConnected: true,
        guestConnected: false,
        moves: [],
        actions: null,
        chat: [],
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Firebase write error:', error);
      throw error;
    }

    // Set up disconnect handler
    const hostConnectedRef = ref(database, `games/${code}/hostConnected`);
    onDisconnect(hostConnectedRef).set(false);

    setGameId(code);
    setIsHost(true);
    setPlayerColor('w');
    setIsConnected(true);

    // Listen for guest connection
    const guestRef = ref(database, `games/${code}/guestConnected`);
    const unsubGuest = onValue(guestRef, (snapshot) => {
      const connected = snapshot.val();
      setOpponentConnected(connected === true);
      onConnectionChange?.(connected === true);
    });
    unsubscribeRef.current.push(unsubGuest);

    // Listen for moves from guest
    const movesRef = ref(database, `games/${code}/moves`);
    const unsubMoves = onValue(movesRef, (snapshot) => {
      const moves = snapshot.val();
      if (moves && Array.isArray(moves)) {
        const lastMove = moves[moves.length - 1];
        if (lastMove && lastMove.player === 'guest' && lastMove.id !== lastMoveRef.current) {
          lastMoveRef.current = lastMove.id;
          onMove?.(lastMove.from, lastMove.to, lastMove.promotion);
        }
      }
    });
    unsubscribeRef.current.push(unsubMoves);

    // Listen for actions (resign, draw, rematch)
    const actionsRef = ref(database, `games/${code}/actions`);
    const unsubActions = onValue(actionsRef, (snapshot) => {
      const action = snapshot.val();
      if (action && action.from === 'guest' && action.id !== lastActionRef.current) {
        lastActionRef.current = action.id;
        if (action.type === 'resign') onOpponentResign?.();
        if (action.type === 'draw-offer') onDrawOffer?.();
        if (action.type === 'draw-accept') onDrawAccepted?.();
        if (action.type === 'rematch') onRematchRequest?.();
      }
    });
    unsubscribeRef.current.push(unsubActions);

    // Listen for chat
    const chatRef = ref(database, `games/${code}/chat`);
    const unsubChat = onValue(chatRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        const msgArray = Object.values(messages) as ChatMessage[];
        setChatMessages(msgArray.sort((a, b) => a.timestamp - b.timestamp));
        const lastMsg = msgArray[msgArray.length - 1];
        if (lastMsg && lastMsg.sender === 'opponent') {
          onChat?.(lastMsg);
        }
      }
    });
    unsubscribeRef.current.push(unsubChat);

    return code;
  }, [onMove, onConnectionChange, onOpponentResign, onDrawOffer, onDrawAccepted, onRematchRequest, onChat]);

  // Join an existing game
  const joinGame = useCallback(async (code: string): Promise<boolean> => {
    try {
      const gameRef = ref(database, `games/${code}`);

      return new Promise((resolve) => {
        const unsubCheck = onValue(gameRef, async (snapshot) => {
          unsubCheck(); // Unsubscribe immediately after first check

          const game = snapshot.val();
          if (!game || !game.host) {
            resolve(false);
            return;
          }

          // Mark guest as connected
          await update(ref(database, `games/${code}`), {
            guestConnected: true,
          });

          // Set up disconnect handler
          const guestConnectedRef = ref(database, `games/${code}/guestConnected`);
          onDisconnect(guestConnectedRef).set(false);

          setGameId(code);
          setIsHost(false);
          setPlayerColor('b');
          setIsConnected(true);
          setOpponentConnected(true);

          // Listen for host connection
          const hostRef = ref(database, `games/${code}/hostConnected`);
          const unsubHost = onValue(hostRef, (snapshot) => {
            const connected = snapshot.val();
            setOpponentConnected(connected === true);
            onConnectionChange?.(connected === true);
          });
          unsubscribeRef.current.push(unsubHost);

          // Listen for moves from host
          const movesRef = ref(database, `games/${code}/moves`);
          const unsubMoves = onValue(movesRef, (snapshot) => {
            const moves = snapshot.val();
            if (moves && Array.isArray(moves)) {
              const lastMove = moves[moves.length - 1];
              if (lastMove && lastMove.player === 'host' && lastMove.id !== lastMoveRef.current) {
                lastMoveRef.current = lastMove.id;
                onMove?.(lastMove.from, lastMove.to, lastMove.promotion);
              }
            }
          });
          unsubscribeRef.current.push(unsubMoves);

          // Listen for actions
          const actionsRef = ref(database, `games/${code}/actions`);
          const unsubActions = onValue(actionsRef, (snapshot) => {
            const action = snapshot.val();
            if (action && action.from === 'host' && action.id !== lastActionRef.current) {
              lastActionRef.current = action.id;
              if (action.type === 'resign') onOpponentResign?.();
              if (action.type === 'draw-offer') onDrawOffer?.();
              if (action.type === 'draw-accept') onDrawAccepted?.();
              if (action.type === 'rematch') onRematchRequest?.();
            }
          });
          unsubscribeRef.current.push(unsubActions);

          // Listen for chat
          const chatRef = ref(database, `games/${code}/chat`);
          const unsubChat = onValue(chatRef, (snapshot) => {
            const messages = snapshot.val();
            if (messages) {
              const msgArray = Object.values(messages) as ChatMessage[];
              setChatMessages(msgArray.sort((a, b) => a.timestamp - b.timestamp));
            }
          });
          unsubscribeRef.current.push(unsubChat);

          resolve(true);
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Failed to join game:', error);
      return false;
    }
  }, [onMove, onConnectionChange, onOpponentResign, onDrawOffer, onDrawAccepted, onRematchRequest]);

  // Send a move
  const sendMove = useCallback(async (from: string, to: string, promotion?: string) => {
    if (!gameId) return;

    const movesRef = ref(database, `games/${gameId}/moves`);
    const moveId = `${Date.now()}-${Math.random()}`;

    onValue(movesRef, async (snapshot) => {
      const moves = snapshot.val() || [];
      await set(movesRef, [
        ...moves,
        {
          id: moveId,
          from,
          to,
          promotion,
          player: isHost ? 'host' : 'guest',
          timestamp: Date.now(),
        },
      ]);
    }, { onlyOnce: true });
  }, [gameId, isHost]);

  // Send action (resign, draw, rematch)
  const sendAction = useCallback(async (type: string) => {
    if (!gameId) return;

    const actionsRef = ref(database, `games/${gameId}/actions`);
    await set(actionsRef, {
      id: `${Date.now()}-${Math.random()}`,
      type,
      from: isHost ? 'host' : 'guest',
      timestamp: Date.now(),
    });
  }, [gameId, isHost]);

  // Send chat message
  const sendChat = useCallback(async (text: string) => {
    if (!gameId) return;

    const chatRef = ref(database, `games/${gameId}/chat`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      id: newMsgRef.key,
      text,
      sender: 'me',
      timestamp: Date.now(),
    });
  }, [gameId]);

  const requestRematch = useCallback(() => sendAction('rematch'), [sendAction]);
  const resign = useCallback(() => sendAction('resign'), [sendAction]);
  const offerDraw = useCallback(() => sendAction('draw-offer'), [sendAction]);
  const acceptDraw = useCallback(() => sendAction('draw-accept'), [sendAction]);
  const declineDraw = useCallback(() => sendAction('draw-decline'), [sendAction]);

  // Disconnect from game
  const disconnect = useCallback(() => {
    cleanup();
    if (gameId) {
      const connectedRef = ref(database, `games/${gameId}/${isHost ? 'hostConnected' : 'guestConnected'}`);
      set(connectedRef, false);
    }
    setGameId(null);
    setIsConnected(false);
    setOpponentConnected(false);
    setChatMessages([]);
  }, [gameId, isHost, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    peerId: gameId,
    isHost,
    isConnected,
    opponentConnected,
    playerColor,
    chatMessages,
    createGame,
    joinGame,
    sendMove,
    sendChat,
    requestRematch,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    disconnect,
  };
}
