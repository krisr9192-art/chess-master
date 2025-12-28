import { useState, useCallback, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, PieceSymbol } from 'chess.js';
import type { Square as ChessboardSquare } from 'react-chessboard/dist/chessboard/types';
import type { Color, Arrow, Settings } from '../../types';
import { playMoveSound, playCaptureSound } from '../../utils/sound';

const BOARD_THEMES: Record<Settings['boardTheme'], { light: string; dark: string }> = {
  classic: { light: '#f0d9b5', dark: '#b58863' },
  blue: { light: '#dee3e6', dark: '#8ca2ad' },
  green: { light: '#ffffdd', dark: '#86a666' },
  purple: { light: '#e8e0f0', dark: '#9b7bb8' },
};

function getFenPieceAt(fen: string, square: Square): string | null {
  const board = fen.split(' ')[0];
  const rows = board.split('/');
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - Number(square[1]);

  let col = 0;
  for (const char of rows[rank]) {
    if (/\d/.test(char)) {
      col += Number(char);
      continue;
    }
    if (col === file) {
      return char;
    }
    col += 1;
  }
  return null;
}

function isPromotionMove(fen: string, from: Square, to: Square): boolean {
  const piece = getFenPieceAt(fen, from);
  if (!piece || piece.toLowerCase() !== 'p') return false;
  return (piece === 'P' && to[1] === '8') || (piece === 'p' && to[1] === '1');
}

interface ChessBoardProps {
  fen: string;
  playerColor?: Color;
  onMove?: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  disabled?: boolean;
  showCoordinates?: boolean;
  showLegalMoves?: boolean;
  boardTheme?: Settings['boardTheme'];
  autoQueen?: boolean;
  premoveEnabled?: boolean;
  soundEnabled?: boolean;
  highlightSquares?: Square[];
  arrows?: Arrow[];
  lastMove?: { from: Square; to: Square };
  isCheck?: boolean;
  kingSquare?: Square;
  boardWidth?: number;
  getLegalMoves?: (square: Square) => Square[];
}

export function ChessBoard({
  fen,
  playerColor = 'w',
  onMove,
  disabled = false,
  showCoordinates = true,
  showLegalMoves = true,
  boardTheme = 'classic',
  autoQueen = true,
  premoveEnabled = true,
  soundEnabled = true,
  highlightSquares = [],
  arrows = [],
  lastMove,
  isCheck = false,
  kingSquare,
  boardWidth = 560,
  getLegalMoves,
}: ChessBoardProps) {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, { background: string }>>({});
  const [moveTargets, setMoveTargets] = useState<Square[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const theme = BOARD_THEMES[boardTheme] ?? BOARD_THEMES.classic;

  useEffect(() => {
    setPendingPromotion(null);
  }, [fen]);

  // Calculate custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight squares from props
    highlightSquares.forEach((sq) => {
      styles[sq] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    });

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Check highlight
    if (isCheck && kingSquare) {
      styles[kingSquare] = {
        ...styles[kingSquare],
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        boxShadow: 'inset 0 0 10px 2px rgba(255, 0, 0, 0.6)',
      };
    }

    // Move from square
    if (moveFrom) {
      styles[moveFrom] = {
        ...styles[moveFrom],
        backgroundColor: 'rgba(130, 151, 105, 0.8)',
      };
    }

    return styles;
  }, [highlightSquares, lastMove, isCheck, kingSquare, moveFrom]);

  // Combine with option squares
  const allSquareStyles = useMemo(() => {
    return { ...customSquareStyles, ...optionSquares };
  }, [customSquareStyles, optionSquares]);

  // Convert arrows prop to react-chessboard format
  const customArrows = useMemo(() => {
    return arrows.map((arrow) => [
      arrow.from as ChessboardSquare,
      arrow.to as ChessboardSquare,
      arrow.color || 'rgba(0, 128, 0, 0.8)',
    ] as [ChessboardSquare, ChessboardSquare, string]);
  }, [arrows]);

  // Helper to show legal move highlights
  const showLegalMoveHighlights = useCallback(
    (square: Square) => {
      if (!getLegalMoves) return;

      const moves = getLegalMoves(square);
      if (moves.length === 0) {
        setMoveFrom(null);
        setMoveTargets([]);
        setOptionSquares({});
        return;
      }

      setMoveTargets(moves);
      if (!showLegalMoves) {
        setMoveFrom(square);
        setOptionSquares({});
        return;
      }

      const highlights: Record<string, { background: string }> = {};
      moves.forEach((targetSquare) => {
        // Check if target square has a piece (capture) by parsing FEN
        const fenParts = fen.split(' ')[0];
        const rows = fenParts.split('/');
        const file = targetSquare.charCodeAt(0) - 97; // a=0, b=1, etc.
        const rank = 8 - parseInt(targetSquare[1]); // 8=0, 7=1, etc.

        let col = 0;
        let hasPiece = false;
        for (const char of rows[rank]) {
          if (col === file) {
            hasPiece = !/\d/.test(char);
            break;
          }
          if (/\d/.test(char)) {
            col += parseInt(char);
          } else {
            col++;
          }
          if (col > file) break;
        }

        highlights[targetSquare] = {
          background: hasPiece
            ? 'radial-gradient(circle, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.25) 55%, rgba(0, 0, 0, 0.25) 100%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 20%, transparent 20%)',
        };
      });

      setMoveFrom(square);
      setOptionSquares(highlights);
    },
    [getLegalMoves, fen, showLegalMoves]
  );

  const playMoveAudio = useCallback(
    (to: Square) => {
      if (!soundEnabled) return;
      const capture = getFenPieceAt(fen, to);
      if (capture) {
        playCaptureSound();
        return;
      }
      playMoveSound();
    },
    [soundEnabled, fen]
  );

  // Handle piece click for move hints
  const onSquareClick = useCallback(
    (square: ChessboardSquare) => {
      if (disabled || pendingPromotion) return;

      const sq = square as Square;

      // If clicking on a move option, make the move
      if (moveFrom && moveTargets.includes(sq)) {
        const needsPromotion = isPromotionMove(fen, moveFrom, sq);
        if (needsPromotion && !autoQueen) {
          setPendingPromotion({ from: moveFrom, to: sq });
          return;
        }

        const promotion = needsPromotion ? 'q' : undefined;
        const didMove = onMove?.(moveFrom, sq, promotion) ?? false;
        if (didMove) {
          playMoveAudio(sq);
        }
        setMoveFrom(null);
        setMoveTargets([]);
        setOptionSquares({});
        return;
      }

      // If clicking on a different piece, show its legal moves
      if (getLegalMoves) {
        const moves = getLegalMoves(sq);
        if (moves.length > 0) {
          showLegalMoveHighlights(sq);
          return;
        }
      }

      // Reset if clicking elsewhere
      setMoveFrom(null);
      setMoveTargets([]);
      setOptionSquares({});
    },
    [disabled, pendingPromotion, moveFrom, moveTargets, onMove, autoQueen, fen, getLegalMoves, showLegalMoveHighlights, playMoveAudio]
  );

  // Handle piece drag start
  const onPieceDragBegin = useCallback(
    (_piece: string, sourceSquare: ChessboardSquare) => {
      if (disabled || pendingPromotion) return false;
      showLegalMoveHighlights(sourceSquare as Square);
      return true;
    },
    [disabled, pendingPromotion, showLegalMoveHighlights]
  );

  // Handle piece drop
  const onPieceDrop = useCallback(
    (sourceSquare: ChessboardSquare, targetSquare: ChessboardSquare, piece: string): boolean => {
      if (disabled || pendingPromotion) return false;

      const from = sourceSquare as Square;
      const to = targetSquare as Square;

      const needsPromotion = isPromotionMove(fen, from, to);
      const promotion = needsPromotion ? piece[1]?.toLowerCase() : undefined;
      const result = onMove?.(from, to, promotion as PieceSymbol | undefined) ?? false;
      if (result) {
        playMoveAudio(to);
      }
      setMoveFrom(null);
      setMoveTargets([]);
      setOptionSquares({});
      return result;
    },
    [disabled, pendingPromotion, onMove, fen, playMoveAudio]
  );

  const handlePromotionSelect = useCallback(
    (piece: PieceSymbol) => {
      if (!pendingPromotion) return;
      const didMove = onMove?.(pendingPromotion.from, pendingPromotion.to, piece) ?? false;
      if (didMove) {
        playMoveAudio(pendingPromotion.to);
        setMoveFrom(null);
        setMoveTargets([]);
        setOptionSquares({});
      }
      setPendingPromotion(null);
    },
    [pendingPromotion, onMove, playMoveAudio]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setMoveFrom(null);
    setMoveTargets([]);
    setOptionSquares({});
  }, []);

  return (
    <div className="relative">
      <Chessboard
        position={fen}
        boardWidth={boardWidth}
        onPieceDrop={onPieceDrop}
        onPieceDragBegin={onPieceDragBegin}
        onSquareClick={onSquareClick}
        boardOrientation={playerColor === 'w' ? 'white' : 'black'}
        customSquareStyles={allSquareStyles}
        customArrows={customArrows}
        showBoardNotation={showCoordinates}
        arePremovesAllowed={premoveEnabled}
        autoPromoteToQueen={autoQueen}
        animationDuration={200}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
        customDarkSquareStyle={{
          backgroundColor: theme.dark,
        }}
        customLightSquareStyle={{
          backgroundColor: theme.light,
        }}
      />

      {pendingPromotion && !autoQueen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
          <div className="card p-4 space-y-3">
            <div className="text-sm font-semibold text-white text-center">Choose promotion</div>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotionSelect(piece)}
                  className="btn btn-secondary text-sm uppercase"
                >
                  {piece}
                </button>
              ))}
            </div>
            <button onClick={cancelPromotion} className="btn btn-danger w-full text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
