import { useState, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square, Move, PieceSymbol, Color } from 'chess.js';
import type { GameState, MoveInfo, CapturedPieces } from '../types';

interface UseChessGameOptions {
  initialFen?: string;
  onMove?: (move: MoveInfo) => void;
  onGameEnd?: (result: 'checkmate' | 'stalemate' | 'draw') => void;
}

interface UseChessGameReturn {
  game: Chess;
  gameState: GameState;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  undoMove: () => boolean;
  resetGame: (fen?: string) => void;
  getLegalMoves: (square: Square) => Square[];
  isLegalMove: (from: Square, to: Square) => boolean;
  loadPgn: (pgn: string) => boolean;
  loadFen: (fen: string) => boolean;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function getCapturedPieces(moveHistory: Move[]): CapturedPieces {
  const captured: CapturedPieces = { white: [], black: [] };

  for (const move of moveHistory) {
    if (move.captured) {
      // The captured piece belongs to the opposite color of who made the move
      if (move.color === 'w') {
        captured.black.push(move.captured);
      } else {
        captured.white.push(move.captured);
      }
    }
  }

  // Sort by value
  captured.white.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
  captured.black.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);

  return captured;
}

function createMoveInfo(move: Move): MoveInfo {
  return {
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured,
    promotion: move.promotion,
    san: move.san,
    color: move.color,
  };
}

export function useChessGame(options: UseChessGameOptions = {}): UseChessGameReturn {
  const { initialFen, onMove, onGameEnd } = options;

  const [game] = useState(() => new Chess(initialFen));
  const [, setUpdateCounter] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateCounter((c) => c + 1);
  }, []);

  const gameState = useMemo((): GameState => {
    const history = game.history({ verbose: true });
    const moveHistory = history.map(createMoveInfo);

    return {
      fen: game.fen(),
      pgn: game.pgn(),
      turn: game.turn(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      isGameOver: game.isGameOver(),
      moveHistory,
      capturedPieces: getCapturedPieces(history),
    };
  }, [game, game.fen()]);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      try {
        const move = game.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (move) {
          forceUpdate();
          onMove?.(createMoveInfo(move));

          if (game.isCheckmate()) {
            onGameEnd?.('checkmate');
          } else if (game.isStalemate()) {
            onGameEnd?.('stalemate');
          } else if (game.isDraw()) {
            onGameEnd?.('draw');
          }

          return true;
        }
      } catch {
        // Invalid move
      }
      return false;
    },
    [game, forceUpdate, onMove, onGameEnd]
  );

  const undoMove = useCallback((): boolean => {
    const move = game.undo();
    if (move) {
      forceUpdate();
      return true;
    }
    return false;
  }, [game, forceUpdate]);

  const resetGame = useCallback(
    (fen?: string): void => {
      if (fen) {
        game.load(fen);
      } else {
        game.reset();
      }
      forceUpdate();
    },
    [game, forceUpdate]
  );

  const getLegalMoves = useCallback(
    (square: Square): Square[] => {
      const moves = game.moves({ square, verbose: true });
      return moves.map((m) => m.to);
    },
    [game]
  );

  const isLegalMove = useCallback(
    (from: Square, to: Square): boolean => {
      const moves = game.moves({ square: from, verbose: true });
      return moves.some((m) => m.to === to);
    },
    [game]
  );

  const loadPgn = useCallback(
    (pgn: string): boolean => {
      try {
        game.loadPgn(pgn);
        forceUpdate();
        return true;
      } catch {
        return false;
      }
    },
    [game, forceUpdate]
  );

  const loadFen = useCallback(
    (fen: string): boolean => {
      try {
        game.load(fen);
        forceUpdate();
        return true;
      } catch {
        return false;
      }
    },
    [game, forceUpdate]
  );

  return {
    game,
    gameState,
    makeMove,
    undoMove,
    resetGame,
    getLegalMoves,
    isLegalMove,
    loadPgn,
    loadFen,
  };
}

// Utility function to get piece at a square
export function getPieceAt(game: Chess, square: Square) {
  return game.get(square);
}

// Utility function to check if it's the player's turn
export function isPlayerTurn(game: Chess, playerColor: Color): boolean {
  return game.turn() === playerColor;
}
