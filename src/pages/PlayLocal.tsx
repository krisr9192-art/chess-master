import { useState, useCallback } from 'react';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { MoveHistory } from '../components/Board/MoveHistory';
import { CapturedPieces } from '../components/Board/CapturedPieces';
import { Modal } from '../components/UI/Modal';
import { useChessGame } from '../hooks/useChessGame';
import { useGameStore } from '../store/gameStore';
import { Users, RotateCcw, Flag } from 'lucide-react';

export function PlayLocal() {
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [boardFlipped, setBoardFlipped] = useState(false);

  const { settings } = useGameStore();

  const {
    gameState,
    makeMove,
    resetGame,
    game,
    getLegalMoves,
  } = useChessGame();

  // Check for game over
  const checkGameOver = useCallback(() => {
    if (gameState.isGameOver) {
      setShowGameOver(true);
      if (gameState.isCheckmate) {
        const winner = gameState.turn === 'w' ? 'Black' : 'White';
        setGameResult(`Checkmate! ${winner} wins!`);
      } else if (gameState.isStalemate) {
        setGameResult('Stalemate! The game is a draw.');
      } else if (gameState.isDraw) {
        setGameResult('Draw!');
      }
    }
  }, [gameState]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      const success = makeMove(from, to, promotion as 'q' | 'r' | 'b' | 'n');
      if (success) {
        setLastMove({ from, to });
        // Auto-flip board after each move for pass & play
        setBoardFlipped(prev => !prev);
        setTimeout(checkGameOver, 100);
      }
      return success;
    },
    [makeMove, checkGameOver]
  );

  const handleNewGame = () => {
    resetGame();
    setShowGameOver(false);
    setLastMove(undefined);
    setBoardFlipped(false);
  };

  const handleResign = () => {
    const loser = gameState.turn === 'w' ? 'White' : 'Black';
    const winner = gameState.turn === 'w' ? 'Black' : 'White';
    setGameResult(`${loser} resigns. ${winner} wins!`);
    setShowGameOver(true);
  };

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

  const currentPlayer = gameState.turn === 'w' ? 'White' : 'Black';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 mb-3">
            <Users className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">Pass & Play</h1>
          <p className="text-slate-400 text-sm">Take turns on the same device</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Board */}
          <div className="flex-shrink-0">
            {/* Current turn indicator */}
            <div className={`flex items-center justify-center gap-3 mb-4 p-4 rounded-lg ${
              gameState.turn === 'w' ? 'bg-white/10' : 'bg-slate-800'
            }`}>
              <div className={`w-6 h-6 rounded-full ${
                gameState.turn === 'w' ? 'bg-white' : 'bg-slate-900 border-2 border-slate-600'
              }`} />
              <span className="text-xl font-bold text-white">
                {currentPlayer}'s Turn
              </span>
              {gameState.isCheck && (
                <span className="text-red-400 font-semibold animate-pulse">CHECK!</span>
              )}
            </div>

            {/* Board */}
            <ChessBoard
              fen={gameState.fen}
              playerColor={boardFlipped ? 'b' : 'w'}
              onMove={handleMove}
              disabled={gameState.isGameOver}
              showCoordinates={settings.showCoordinates}
              showLegalMoves={settings.showLegalMoves}
              boardTheme={settings.boardTheme}
              autoQueen={settings.autoQueen}
              premoveEnabled={false}
              soundEnabled={settings.soundEnabled}
              lastMove={lastMove}
              isCheck={gameState.isCheck}
              kingSquare={findKingSquare()}
              getLegalMoves={getLegalMoves}
            />

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setBoardFlipped(prev => !prev)}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Flip Board
              </button>
              <button
                onClick={handleResign}
                disabled={gameState.isGameOver}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Flag size={18} />
                Resign
              </button>
              <button
                onClick={handleNewGame}
                className="btn btn-primary flex-1"
              >
                New Game
              </button>
            </div>
          </div>

          {/* Right side - Info panels */}
          <div className="flex-1 space-y-4">
            <MoveHistory moves={gameState.moveHistory} />
            <CapturedPieces
              whiteCaptured={gameState.capturedPieces.white}
              blackCaptured={gameState.capturedPieces.black}
            />

            {/* Instructions */}
            <div className="card p-4">
              <h3 className="font-semibold text-white mb-2">How to Play</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• White moves first</li>
                <li>• Pass the device after each move</li>
                <li>• Board auto-flips for each player</li>
                <li>• Tap "Flip Board" to manually rotate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={showGameOver} onClose={() => setShowGameOver(false)} title="Game Over">
        <div className="text-center py-4">
          <p className="text-xl font-semibold text-white mb-6">{gameResult}</p>
          <button onClick={handleNewGame} className="btn btn-primary">
            Play Again
          </button>
        </div>
      </Modal>
    </div>
  );
}
