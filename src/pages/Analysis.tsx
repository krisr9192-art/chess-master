import { useState, useCallback } from 'react';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { MoveHistory } from '../components/Board/MoveHistory';
import { EvaluationBar } from '../components/Board/EvaluationBar';
import { GameControls } from '../components/Board/GameControls';
import { useChessGame } from '../hooks/useChessGame';
import { Modal } from '../components/UI/Modal';
import { useGameStore } from '../store/gameStore';
import {
  BarChart3,
  Upload,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';

export function Analysis() {
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);
  const { settings } = useGameStore();

  const {
    game,
    gameState,
    makeMove,
    undoMove,
    resetGame,
    loadFen,
    loadPgn,
    getLegalMoves,
  } = useChessGame();

  // Simple evaluation based on material
  const calculateEvaluation = (): number => {
    const fen = game.fen();
    const pieceValues: Record<string, number> = {
      p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
    };
    let score = 0;

    for (const char of fen.split(' ')[0]) {
      const lower = char.toLowerCase();
      if (pieceValues[lower] !== undefined) {
        score += char === lower ? -pieceValues[lower] : pieceValues[lower];
      }
    }

    return score;
  };

  const evaluation = calculateEvaluation();

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      const success = makeMove(from, to, promotion as any);
      if (success) {
        setLastMove({ from, to });
      }
      return success;
    },
    [makeMove]
  );

  const handleImport = () => {
    const text = importText.trim();
    if (!text) return;

    // Try to load as PGN first, then as FEN
    if (text.includes('[') || text.includes('1.')) {
      const success = loadPgn(text);
      if (success) {
        setShowImport(false);
        setImportText('');
        return;
      }
    }

    // Try as FEN
    const success = loadFen(text);
    if (success) {
      setShowImport(false);
      setImportText('');
    } else {
      alert('Invalid PGN or FEN format');
    }
  };

  const copyPgn = () => {
    navigator.clipboard.writeText(gameState.pgn || game.fen());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSuggestedMove = (): string => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return 'No moves available';

    // Simple heuristic: prioritize captures and checks
    const scoredMoves = moves.map((move) => {
      let score = Math.random() * 5;
      if (move.captured) {
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
        score += (pieceValues[move.captured] || 0) * 10;
      }

      game.move(move);
      if (game.isCheckmate()) score += 100;
      else if (game.isCheck()) score += 5;
      game.undo();

      if (['d4', 'd5', 'e4', 'e5'].includes(move.to)) score += 2;

      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move.san;
  };

  // Find king square for check highlight
  const findKingSquare = (): Square | undefined => {
    if (!gameState.isCheck) return undefined;
    const board = game.board();
    const kingColor = game.turn();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.type === 'k' && piece.color === kingColor) {
          const file = String.fromCharCode(97 + j);
          const rank = 8 - i;
          return `${file}${rank}` as Square;
        }
      }
    }
    return undefined;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Board</h1>
              <p className="text-sm text-slate-400">Analyze positions and games</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={copyPgn}
              className="btn btn-secondary flex items-center gap-2"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              Copy
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Board with eval */}
          <div className="flex-shrink-0 flex gap-3">
            <EvaluationBar score={evaluation} />
            <ChessBoard
              fen={gameState.fen}
              playerColor={boardFlipped ? 'b' : 'w'}
              onMove={handleMove}
              showCoordinates={settings.showCoordinates}
              showLegalMoves={settings.showLegalMoves}
              boardTheme={settings.boardTheme}
              autoQueen={settings.autoQueen}
              premoveEnabled={settings.premoveEnabled}
              soundEnabled={settings.soundEnabled}
              lastMove={lastMove}
              isCheck={gameState.isCheck}
              kingSquare={findKingSquare()}
              getLegalMoves={getLegalMoves}
            />
          </div>

          {/* Right - Controls and info */}
          <div className="flex-1 space-y-4">
            {/* Status */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Turn:</span>
                <span className="font-semibold text-white">
                  {gameState.turn === 'w' ? 'White' : 'Black'} to move
                </span>
              </div>

              {gameState.isCheck && !gameState.isCheckmate && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 mb-3">
                  <span className="text-red-200 font-medium">Check!</span>
                </div>
              )}

              {gameState.isCheckmate && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 mb-3">
                  <span className="text-green-200 font-medium">
                    Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} wins!
                  </span>
                </div>
              )}

              {gameState.isStalemate && (
                <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 mb-3">
                  <span className="text-yellow-200 font-medium">Stalemate!</span>
                </div>
              )}

              {gameState.isDraw && !gameState.isStalemate && (
                <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 mb-3">
                  <span className="text-yellow-200 font-medium">Draw!</span>
                </div>
              )}

              {/* Suggested move */}
              <button
                onClick={() => setShowHint(!showHint)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Lightbulb size={16} />
                {showHint ? 'Hide Suggestion' : 'Show Best Move'}
              </button>

              {showHint && !gameState.isGameOver && (
                <div className="mt-3 p-3 rounded-lg bg-blue-500/20 border border-blue-500/50">
                  <span className="text-blue-200">
                    Suggested: <span className="font-mono font-bold">{getSuggestedMove()}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <GameControls
              onUndo={undoMove}
              onReset={() => {
                resetGame();
                setLastMove(undefined);
              }}
              onFlipBoard={() => setBoardFlipped(!boardFlipped)}
              canUndo={gameState.moveHistory.length > 0}
              showNavigation={true}
              showResign={false}
              showDraw={false}
            />

            {/* Move history */}
            <MoveHistory moves={gameState.moveHistory} />

            {/* FEN display */}
            <div className="card p-4">
              <div className="text-xs text-slate-400 mb-2">FEN</div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-900 p-2 rounded">
                {gameState.fen}
              </div>
            </div>

            {/* Evaluation info */}
            <div className="card p-4">
              <div className="text-xs text-slate-400 mb-2">Evaluation</div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-2xl font-bold ${
                    evaluation > 50
                      ? 'text-green-400'
                      : evaluation < -50
                        ? 'text-red-400'
                        : 'text-slate-300'
                  }`}
                >
                  {evaluation >= 0 ? '+' : ''}{(evaluation / 100).toFixed(1)}
                </div>
                <div className="text-sm text-slate-400">
                  {evaluation > 200
                    ? 'White is winning'
                    : evaluation > 50
                      ? 'White is better'
                      : evaluation < -200
                        ? 'Black is winning'
                        : evaluation < -50
                          ? 'Black is better'
                          : 'Equal position'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="Import Position">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Paste PGN or FEN
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="e.g., rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              className="input h-32 resize-none font-mono text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowImport(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleImport} className="btn btn-primary flex-1">
              Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
