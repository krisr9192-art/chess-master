import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, get, push, onDisconnect } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ChatMessage, Color } from '../types';

interface UseMultiplayerOptions {
  onMove?: (from: string, to: string, promotion?: string) => void;
  onRematchRequest?: () => void;
  onOpponentResign?: () => void;
  onDrawOffer?: () => void;
  onDrawAccepted?: () => void;
  onConnectionChange?: (connected: boolean) => void;
  onGameStateLoaded?: (fen: string) => void;
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
  sendMove: (from: string, to: string, promotion?: string, fen?: string) => void;
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
  const [gameId, setGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const unsubscribeRef = useRef<(() => void)[]>([]);
  const lastMoveIdRef = useRef<string | null>(null);
  const lastActionIdRef = useRef<string | null>(null);

  // Store callbacks in refs to avoid stale closures
  const onMoveRef = useRef(options.onMove);
  const onRematchRequestRef = useRef(options.onRematchRequest);
  const onOpponentResignRef = useRef(options.onOpponentResign);
  const onDrawOfferRef = useRef(options.onDrawOffer);
  const onDrawAcceptedRef = useRef(options.onDrawAccepted);
  const onConnectionChangeRef = useRef(options.onConnectionChange);
  const onGameStateLoadedRef = useRef(options.onGameStateLoaded);

  // Update refs when options change
  useEffect(() => {
    onMoveRef.current = options.onMove;
    onRematchRequestRef.current = options.onRematchRequest;
    onOpponentResignRef.current = options.onOpponentResign;
    onDrawOfferRef.current = options.onDrawOffer;
    onDrawAcceptedRef.current = options.onDrawAccepted;
    onConnectionChangeRef.current = options.onConnectionChange;
    onGameStateLoadedRef.current = options.onGameStateLoaded;
  }, [options]);

  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach(unsub => unsub());
    unsubscribeRef.current = [];
  }, []);

  // Set up listeners for a game
  const setupGameListeners = useCallback((code: string, amHost: boolean) => {
    console.log('[Firebase] Setting up listeners for game:', code, 'amHost:', amHost);

    // Listen for opponent connection
    const opponentConnRef = ref(database, `games/${code}/${amHost ? 'guestConnected' : 'hostConnected'}`);
    const unsubOpponent = onValue(opponentConnRef, (snapshot) => {
      const connected = snapshot.val() === true;
      console.log('[Firebase] Opponent connected:', connected);
      setOpponentConnected(connected);
      onConnectionChangeRef.current?.(connected);
    });
    unsubscribeRef.current.push(unsubOpponent);

    // Listen for lastMove - SIMPLE approach: just track the last move made
    const lastMoveRef = ref(database, `games/${code}/lastMove`);
    const unsubLastMove = onValue(lastMoveRef, (snapshot) => {
      const data = snapshot.val();
      console.log('[Firebase] lastMove update:', data, 'amHost:', amHost);

      if (!data) return;

      // Only process if it's from opponent and we haven't processed it yet
      const myRole = amHost ? 'host' : 'guest';
      if (data.player !== myRole && data.id !== lastMoveIdRef.current) {
        console.log('[Firebase] Processing opponent move:', data);
        lastMoveIdRef.current = data.id;
        onMoveRef.current?.(data.from, data.to, data.promotion);
      }
    });
    unsubscribeRef.current.push(unsubLastMove);

    // Listen for actions
    const actionsRef = ref(database, `games/${code}/actions`);
    const unsubActions = onValue(actionsRef, (snapshot) => {
      const action = snapshot.val();
      if (!action) return;

      const myRole = amHost ? 'host' : 'guest';
      if (action.from !== myRole && action.id !== lastActionIdRef.current) {
        lastActionIdRef.current = action.id;
        console.log('[Firebase] Action from opponent:', action.type);
        if (action.type === 'resign') onOpponentResignRef.current?.();
        if (action.type === 'draw-offer') onDrawOfferRef.current?.();
        if (action.type === 'draw-accept') onDrawAcceptedRef.current?.();
        if (action.type === 'rematch') onRematchRequestRef.current?.();
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
  }, []);

  // Create a new game as host
  const createGame = useCallback(async (): Promise<string> => {
    const code = generateGameCode();
    console.log('[Firebase] Creating game:', code);

    const gameRef = ref(database, `games/${code}`);

    await set(gameRef, {
      hostConnected: true,
      guestConnected: false,
      lastMove: null,
      actions: null,
      chat: {},
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      createdAt: Date.now(),
    });

    // Set up disconnect handler
    const hostConnectedRef = ref(database, `games/${code}/hostConnected`);
    onDisconnect(hostConnectedRef).set(false);

    lastMoveIdRef.current = null;
    lastActionIdRef.current = null;

    setGameId(code);
    setIsHost(true);
    setPlayerColor('w');
    setIsConnected(true);

    setupGameListeners(code, true);

    return code;
  }, [setupGameListeners]);

  // Join an existing game
  const joinGame = useCallback(async (code: string): Promise<boolean> => {
    console.log('[Firebase] Joining game:', code);

    try {
      const gameRef = ref(database, `games/${code}`);
      const snapshot = await get(gameRef);
      const game = snapshot.val();

      if (!game || !game.hostConnected) {
        console.log('[Firebase] Game not found or host not connected');
        return false;
      }

      // Mark guest as connected
      const guestConnectedRef = ref(database, `games/${code}/guestConnected`);
      await set(guestConnectedRef, true);
      onDisconnect(guestConnectedRef).set(false);

      // If there's already a lastMove, mark it as processed so we don't replay it
      if (game.lastMove) {
        lastMoveIdRef.current = game.lastMove.id;
      }
      lastActionIdRef.current = null;

      setGameId(code);
      setIsHost(false);
      setPlayerColor('b');
      setIsConnected(true);
      setOpponentConnected(true);

      setupGameListeners(code, false);

      // Load the current game state (FEN) if there's one
      if (game.fen && game.lastMove) {
        setTimeout(() => {
          onGameStateLoadedRef.current?.(game.fen);
        }, 100);
      }

      return true;
    } catch (error) {
      console.error('[Firebase] Failed to join game:', error);
      return false;
    }
  }, [setupGameListeners]);

  // Send a move - now just updates lastMove
  const sendMove = useCallback(async (from: string, to: string, promotion?: string, fen?: string) => {
    if (!gameId) {
      console.log('[Firebase] sendMove: no gameId');
      return;
    }

    const moveId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const myRole = isHost ? 'host' : 'guest';

    console.log('[Firebase] Sending move:', { from, to, promotion, gameId, role: myRole });

    try {
      // Update lastMove
      const lastMoveRef = ref(database, `games/${gameId}/lastMove`);
      await set(lastMoveRef, {
        id: moveId,
        from,
        to,
        promotion: promotion || null,
        player: myRole,
        timestamp: Date.now(),
      });

      // Mark this as processed so we don't echo it back to ourselves
      lastMoveIdRef.current = moveId;

      // Also save FEN
      if (fen) {
        const fenRef = ref(database, `games/${gameId}/fen`);
        await set(fenRef, fen);
      }

      console.log('[Firebase] Move sent successfully');
    } catch (error) {
      console.error('[Firebase] Failed to send move:', error);
    }
  }, [gameId, isHost]);

  // Send action (resign, draw, rematch)
  const sendAction = useCallback(async (type: string) => {
    if (!gameId) return;

    const actionsRef = ref(database, `games/${gameId}/actions`);
    await set(actionsRef, {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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

    lastMoveIdRef.current = null;
    lastActionIdRef.current = null;
    setGameId(null);
    setIsConnected(false);
    setOpponentConnected(false);
    setChatMessages([]);
  }, [cleanup, gameId, isHost]);

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
