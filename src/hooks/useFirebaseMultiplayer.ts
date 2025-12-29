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
  const processedMoveCountRef = useRef<number>(0);
  const lastActionIdRef = useRef<string | null>(null);
  const isHostRef = useRef<boolean>(false);
  const gameIdRef = useRef<string | null>(null);

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

  // Keep refs in sync with state
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach(unsub => unsub());
    unsubscribeRef.current = [];
  }, []);

  // Set up listeners for a game
  const setupGameListeners = useCallback((code: string, amHost: boolean) => {
    // Listen for opponent connection
    const opponentConnRef = ref(database, `games/${code}/${amHost ? 'guestConnected' : 'hostConnected'}`);
    const unsubOpponent = onValue(opponentConnRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setOpponentConnected(connected);
      onConnectionChangeRef.current?.(connected);
    });
    unsubscribeRef.current.push(unsubOpponent);

    // Listen for moves
    const movesRef = ref(database, `games/${code}/moves`);
    const unsubMoves = onValue(movesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('[Firebase] Moves update received:', data, 'amHost:', amHost);
      if (!data) return;

      // Convert object to array and sort by timestamp
      const movesObj = data as Record<string, { from: string; to: string; promotion?: string; player: string; timestamp: number }>;
      const moves = Object.values(movesObj).sort((a, b) => a.timestamp - b.timestamp);
      console.log('[Firebase] Processed moves array:', moves, 'length:', moves.length);
      if (moves.length === 0) return;

      // Process only new moves from opponent
      const opponentRole = amHost ? 'guest' : 'host';
      console.log('[Firebase] Looking for moves from:', opponentRole, 'starting at index:', processedMoveCountRef.current);

      for (let i = processedMoveCountRef.current; i < moves.length; i++) {
        const move = moves[i];
        console.log('[Firebase] Processing move at index', i, ':', move);
        if (move && move.player === opponentRole) {
          console.log('[Firebase] Calling onMove for opponent move:', move.from, '->', move.to);
          onMoveRef.current?.(move.from, move.to, move.promotion);
        }
        processedMoveCountRef.current = i + 1;
      }
    });
    unsubscribeRef.current.push(unsubMoves);

    // Listen for actions
    const actionsRef = ref(database, `games/${code}/actions`);
    const unsubActions = onValue(actionsRef, (snapshot) => {
      const action = snapshot.val();
      if (!action) return;

      const opponentRole = amHost ? 'guest' : 'host';
      if (action.from === opponentRole && action.id !== lastActionIdRef.current) {
        lastActionIdRef.current = action.id;
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
    const gameRef = ref(database, `games/${code}`);

    await set(gameRef, {
      hostConnected: true,
      guestConnected: false,
      moves: [],
      actions: null,
      chat: {},
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      createdAt: Date.now(),
    });

    // Set up disconnect handler
    const hostConnectedRef = ref(database, `games/${code}/hostConnected`);
    onDisconnect(hostConnectedRef).set(false);

    // Reset move counter
    processedMoveCountRef.current = 0;
    lastActionIdRef.current = null;

    // Update refs IMMEDIATELY (don't wait for useEffect)
    gameIdRef.current = code;
    isHostRef.current = true;

    setGameId(code);
    setIsHost(true);
    setPlayerColor('w');
    setIsConnected(true);

    setupGameListeners(code, true);

    return code;
  }, [setupGameListeners]);

  // Join an existing game
  const joinGame = useCallback(async (code: string): Promise<boolean> => {
    try {
      const gameRef = ref(database, `games/${code}`);
      const snapshot = await get(gameRef);
      const game = snapshot.val();

      if (!game || !game.hostConnected) {
        return false;
      }

      // Mark guest as connected
      const guestConnectedRef = ref(database, `games/${code}/guestConnected`);
      await set(guestConnectedRef, true);
      onDisconnect(guestConnectedRef).set(false);

      // Get current move count to know where to start processing
      const movesData = game.moves;
      const moves = movesData ? (Array.isArray(movesData) ? movesData : Object.values(movesData)) : [];
      processedMoveCountRef.current = moves.length;
      lastActionIdRef.current = null;

      // Update refs IMMEDIATELY (don't wait for useEffect)
      gameIdRef.current = code;
      isHostRef.current = false;

      setGameId(code);
      setIsHost(false);
      setPlayerColor('b');
      setIsConnected(true);
      setOpponentConnected(true);

      setupGameListeners(code, false);

      // Load the current game state (FEN) if there are moves
      if (game.fen && moves.length > 0) {
        // Small delay to ensure state is set
        setTimeout(() => {
          onGameStateLoadedRef.current?.(game.fen);
        }, 100);
      }

      return true;
    } catch (error) {
      console.error('Failed to join game:', error);
      return false;
    }
  }, [setupGameListeners]);

  // Send a move - using get() to avoid race conditions
  const sendMove = useCallback(async (from: string, to: string, promotion?: string, fen?: string) => {
    const currentGameId = gameIdRef.current;
    const currentIsHost = isHostRef.current;

    console.log('[Firebase] sendMove called:', { from, to, promotion, gameId: currentGameId, isHost: currentIsHost });

    if (!currentGameId) {
      console.log('[Firebase] sendMove aborted - no gameId');
      return;
    }

    try {
      const movesRef = ref(database, `games/${currentGameId}/moves`);
      const snapshot = await get(movesRef);
      const data = snapshot.val();
      // Firebase sometimes converts arrays to objects - handle both
      const moves = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      console.log('[Firebase] Current moves before adding:', moves);

      const newMove = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        from,
        to,
        promotion,
        player: currentIsHost ? 'host' : 'guest',
        timestamp: Date.now(),
      };

      console.log('[Firebase] Sending new move:', newMove);
      await set(movesRef, [...moves, newMove]);
      console.log('[Firebase] Move sent successfully');

      // Also save the current FEN for game persistence
      if (fen) {
        const fenRef = ref(database, `games/${currentGameId}/fen`);
        await set(fenRef, fen);
      }
    } catch (error) {
      console.error('Failed to send move:', error);
    }
  }, []);

  // Send action (resign, draw, rematch)
  const sendAction = useCallback(async (type: string) => {
    const currentGameId = gameIdRef.current;
    const currentIsHost = isHostRef.current;

    if (!currentGameId) return;

    const actionsRef = ref(database, `games/${currentGameId}/actions`);
    await set(actionsRef, {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      from: currentIsHost ? 'host' : 'guest',
      timestamp: Date.now(),
    });
  }, []);

  // Send chat message
  const sendChat = useCallback(async (text: string) => {
    const currentGameId = gameIdRef.current;
    if (!currentGameId) return;

    const chatRef = ref(database, `games/${currentGameId}/chat`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      id: newMsgRef.key,
      text,
      sender: 'me',
      timestamp: Date.now(),
    });
  }, []);

  const requestRematch = useCallback(() => sendAction('rematch'), [sendAction]);
  const resign = useCallback(() => sendAction('resign'), [sendAction]);
  const offerDraw = useCallback(() => sendAction('draw-offer'), [sendAction]);
  const acceptDraw = useCallback(() => sendAction('draw-accept'), [sendAction]);
  const declineDraw = useCallback(() => sendAction('draw-decline'), [sendAction]);

  // Disconnect from game
  const disconnect = useCallback(() => {
    cleanup();
    const currentGameId = gameIdRef.current;
    const currentIsHost = isHostRef.current;

    if (currentGameId) {
      const connectedRef = ref(database, `games/${currentGameId}/${currentIsHost ? 'hostConnected' : 'guestConnected'}`);
      set(connectedRef, false);
    }

    processedMoveCountRef.current = 0;
    lastActionIdRef.current = null;
    setGameId(null);
    setIsConnected(false);
    setOpponentConnected(false);
    setChatMessages([]);
  }, [cleanup]);

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
