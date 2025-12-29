import { useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { MultiplayerMessage, ChatMessage, Color } from '../types';

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
  joinGame: (hostId: string) => Promise<boolean>;
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

export function useMultiplayer(options: UseMultiplayerOptions = {}): UseMultiplayerReturn {
  const {
    onMove,
    onChat,
    onRematchRequest,
    onOpponentResign,
    onDrawOffer,
    onDrawAccepted,
    onConnectionChange,
  } = options;

  const [peerId, setPeerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: MultiplayerMessage) => {
      switch (message.type) {
        case 'move': {
          const { from, to, promotion } = message.payload as {
            from: string;
            to: string;
            promotion?: string;
          };
          onMove?.(from, to, promotion);
          break;
        }
        case 'chat': {
          const chatMessage: ChatMessage = {
            id: crypto.randomUUID(),
            text: message.payload as string,
            sender: 'opponent',
            timestamp: message.timestamp,
          };
          setChatMessages((prev) => [...prev, chatMessage]);
          onChat?.(chatMessage);
          break;
        }
        case 'rematch':
          onRematchRequest?.();
          break;
        case 'resign':
          onOpponentResign?.();
          break;
        case 'draw-offer':
          onDrawOffer?.();
          break;
        case 'draw-accept':
          onDrawAccepted?.();
          break;
        default:
          break;
      }
    },
    [onMove, onChat, onRematchRequest, onOpponentResign, onDrawOffer, onDrawAccepted]
  );

  // Set up connection event handlers
  const setupConnection = useCallback(
    (conn: DataConnection) => {
      connectionRef.current = conn;

      conn.on('open', () => {
        setOpponentConnected(true);
        onConnectionChange?.(true);
      });

      conn.on('data', (data) => {
        handleMessage(data as MultiplayerMessage);
      });

      conn.on('close', () => {
        setOpponentConnected(false);
        onConnectionChange?.(false);
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setOpponentConnected(false);
        onConnectionChange?.(false);
      });
    },
    [handleMessage, onConnectionChange]
  );

  // Create a new game as host
  const createGame = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const gameCode = generateGameCode();

      const peer = new Peer(gameCode, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        setPeerId(id);
        setIsHost(true);
        setPlayerColor('w'); // Host plays white
        setIsConnected(true);
        resolve(id);
      });

      peer.on('connection', (conn) => {
        setupConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });
    });
  }, [setupConnection]);

  // Join an existing game
  const joinGame = useCallback(
    async (hostId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const peer = new Peer(guestId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          setPeerId(id);
          setIsHost(false);
          setPlayerColor('b'); // Guest plays black
          setIsConnected(true);

          const conn = peer.connect(hostId, {
            reliable: true,
          });

          setupConnection(conn);

          conn.on('open', () => {
            resolve(true);
          });

          conn.on('error', () => {
            resolve(false);
          });
        });

        peer.on('error', () => {
          resolve(false);
        });
      });
    },
    [setupConnection]
  );

  // Send a move to opponent
  const sendMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (connectionRef.current?.open) {
        const message: MultiplayerMessage = {
          type: 'move',
          payload: { from, to, promotion },
          timestamp: Date.now(),
        };
        connectionRef.current.send(message);
      }
    },
    []
  );

  // Send a chat message
  const sendChat = useCallback((text: string) => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'chat',
        payload: text,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);

      // Add to local messages
      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text,
        sender: 'me',
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, chatMessage]);
    }
  }, []);

  // Request a rematch
  const requestRematch = useCallback(() => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'rematch',
        payload: null,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);
    }
  }, []);

  // Resign the game
  const resign = useCallback(() => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'resign',
        payload: null,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);
    }
  }, []);

  // Offer a draw
  const offerDraw = useCallback(() => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'draw-offer',
        payload: null,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);
    }
  }, []);

  // Accept a draw
  const acceptDraw = useCallback(() => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'draw-accept',
        payload: null,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);
    }
  }, []);

  // Decline a draw
  const declineDraw = useCallback(() => {
    if (connectionRef.current?.open) {
      const message: MultiplayerMessage = {
        type: 'draw-decline',
        payload: null,
        timestamp: Date.now(),
      };
      connectionRef.current.send(message);
    }
  }, []);

  // Disconnect from the game
  const disconnect = useCallback(() => {
    connectionRef.current?.close();
    peerRef.current?.destroy();
    setIsConnected(false);
    setOpponentConnected(false);
    setPeerId(null);
    setChatMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    peerId,
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
