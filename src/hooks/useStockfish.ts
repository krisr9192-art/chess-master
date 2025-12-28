import { useState, useEffect, useCallback, useRef } from 'react';
import type { Difficulty, AIConfig, EngineEvaluation } from '../types';

const STOCKFISH_PATH = '/stockfish/stockfish.js';

interface UseStockfishOptions {
  onBestMove?: (move: string) => void;
  onEvaluation?: (evaluation: EngineEvaluation) => void;
}

interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  evaluation: EngineEvaluation | null;
  getBestMove: (fen: string, difficulty: Difficulty) => void;
  evaluatePosition: (fen: string, depth?: number) => void;
  stopThinking: () => void;
}

const AI_SETTINGS: Record<Difficulty, AIConfig> = {
  easy: { difficulty: 'easy', depth: 2, moveTime: 500, skill: 3 },
  medium: { difficulty: 'medium', depth: 8, moveTime: 1000, skill: 10 },
  hard: { difficulty: 'hard', depth: 15, moveTime: 2000, skill: 17 },
  expert: { difficulty: 'expert', depth: 20, moveTime: 3000, skill: 20 },
};

export function useStockfish(options: UseStockfishOptions = {}): UseStockfishReturn {
  const { onBestMove, onEvaluation } = options;

  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const currentDifficultyRef = useRef<Difficulty>('medium');

  // Initialize Stockfish worker
  useEffect(() => {
    // Create a simple chess engine simulation if Stockfish isn't available
    // In production, you'd load the actual Stockfish WASM
    const initEngine = async () => {
      try {
        // Try to load Stockfish
        const worker = new Worker(STOCKFISH_PATH);
        workerRef.current = worker;

        worker.onmessage = (e) => {
          const message = e.data;

          if (message === 'uciok') {
            worker.postMessage('isready');
          } else if (message === 'readyok') {
            setIsReady(true);
          } else if (typeof message === 'string') {
            // Parse best move
            if (message.startsWith('bestmove')) {
              const parts = message.split(' ');
              const move = parts[1];
              setIsThinking(false);
              onBestMove?.(move);
            }

            // Parse evaluation info
            if (message.includes('info depth')) {
              const depthMatch = message.match(/depth (\d+)/);
              const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
              const pvMatch = message.match(/pv (.+)/);

              if (depthMatch && scoreMatch) {
                const depth = parseInt(depthMatch[1]);
                const scoreType = scoreMatch[1];
                const scoreValue = parseInt(scoreMatch[2]);
                const pv = pvMatch ? pvMatch[1].split(' ') : [];

                const newEval: EngineEvaluation = {
                  depth,
                  score: scoreType === 'cp' ? scoreValue : 0,
                  mate: scoreType === 'mate' ? scoreValue : undefined,
                  bestMove: pv[0] || '',
                  pv,
                };

                setEvaluation(newEval);
                onEvaluation?.(newEval);
              }
            }
          }
        };

        worker.postMessage('uci');
      } catch (error) {
        console.log('Stockfish not available, using fallback engine');
        // Set ready anyway with fallback
        setIsReady(true);
      }
    };

    initEngine();

    return () => {
      workerRef.current?.terminate();
    };
  }, [onBestMove, onEvaluation]);

  const getBestMove = useCallback((fen: string, difficulty: Difficulty) => {
    currentDifficultyRef.current = difficulty;
    setIsThinking(true);

    const config = AI_SETTINGS[difficulty];

    if (workerRef.current) {
      // Configure engine strength
      workerRef.current.postMessage(`setoption name Skill Level value ${config.skill}`);
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${config.depth} movetime ${config.moveTime}`);
    } else {
      // Fallback: Use simple random legal move simulation
      setTimeout(() => {
        setIsThinking(false);
        // This will be handled by the component using a fallback
        onBestMove?.('fallback');
      }, config.moveTime);
    }
  }, [onBestMove]);

  const evaluatePosition = useCallback((fen: string, depth: number = 15) => {
    if (workerRef.current) {
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${depth}`);
    }
  }, []);

  const stopThinking = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage('stop');
    }
    setIsThinking(false);
  }, []);

  return {
    isReady,
    isThinking,
    evaluation,
    getBestMove,
    evaluatePosition,
    stopThinking,
  };
}

// Fallback AI is now handled directly in PlayAI.tsx component
