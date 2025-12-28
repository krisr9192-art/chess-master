import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { MoveHistory } from '../components/Board/MoveHistory';
import { CapturedPieces } from '../components/Board/CapturedPieces';
import { GameControls } from '../components/Board/GameControls';
import { EvaluationBar } from '../components/Board/EvaluationBar';
import { Modal } from '../components/UI/Modal';
import { useChessGame } from '../hooks/useChessGame';
import { useGameStore } from '../store/gameStore';
import { Bot, Crown, RotateCw, Loader2 } from 'lucide-react';
import type { Difficulty, Color } from '../types';

const difficulties: { value: Difficulty; label: string; description: string; elo: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Perfect for beginners', elo: '~800' },
  { value: 'medium', label: 'Medium', description: 'Casual player level', elo: '~1400' },
  { value: 'hard', label: 'Hard', description: 'Club player strength', elo: '~1800' },
  { value: 'expert', label: 'Expert', description: 'Master level play', elo: '~2200' },
];

export function PlayAI() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [isThinking, setIsThinking] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [evaluation, setEvaluation] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [boardFlipped, setBoardFlipped] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { recordGame, settings } = useGameStore();

  const handleGameEnd = useCallback((result: 'checkmate' | 'stalemate' | 'draw') => {
    setShowGameOver(true);
    if (result === 'checkmate') {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setGameResult(`Checkmate! ${winner} wins!`);
      recordGame(winner === (playerColor === 'w' ? 'White' : 'Black'));
    } else if (result === 'stalemate') {
      setGameResult('Stalemate! The game is a draw.');
    } else {
      setGameResult('Draw!');
    }
  }, [recordGame, playerColor]);

  const {
    game,
    gameState,
    makeMove,
    undoMove,
    resetGame,
    getLegalMoves,
  } = useChessGame({
    onGameEnd: handleGameEnd,
  });

  const clearAiTimeout = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
  }, []);

  // Simple AI move logic
  const makeAIMove = useCallback(() => {
    if (game.isGameOver()) return;

    clearAiTimeout();
    setIsThinking(true);

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      setIsThinking(false);
      return;
    }

    // Delay based on difficulty
    const delays: Record<Difficulty, number> = {
      easy: 300,
      medium: 600,
      hard: 1000,
      expert: 1500,
    };

    aiTimeoutRef.current = setTimeout(() => {
      // Score moves with simple heuristics
      const scoredMoves = moves.map((move) => {
        let score = Math.random() * 10;

        // Captures are good
        if (move.captured) {
          const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
          score += pieceValues[move.captured] * 10;
        }

        // Check for checks and mates
        game.move(move);
        if (game.isCheckmate()) score += 1000;
        else if (game.isCheck()) score += 5;
        game.undo();

        // Center control
        if (['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(move.to)) {
          score += 2;
        }

        // Adjust randomness based on difficulty
        if (difficulty === 'easy') score = Math.random() * 20;
        else if (difficulty === 'medium') score = score * 0.7 + Math.random() * 10;
        else if (difficulty === 'hard') score = score * 0.9 + Math.random() * 3;
        // expert uses mostly scored moves

        return { move, score };
      });

      scoredMoves.sort((a, b) => b.score - a.score);
      const bestMove = scoredMoves[0].move;

      makeMove(bestMove.from as Square, bestMove.to as Square, bestMove.promotion);
      setLastMove({ from: bestMove.from as Square, to: bestMove.to as Square });
      setIsThinking(false);

      // Update evaluation (simplified)
      const materialScore = calculateMaterial(game);
      setEvaluation(materialScore);
    }, delays[difficulty]);
  }, [game, difficulty, makeMove, clearAiTimeout]);

  // Calculate material balance
  const calculateMaterial = (chess: Chess): number => {
    const fen = chess.fen();
    const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
    let score = 0;

    for (const char of fen.split(' ')[0]) {
      const lower = char.toLowerCase();
      if (pieceValues[lower] !== undefined) {
        score += char === lower ? -pieceValues[lower] : pieceValues[lower];
      }
    }

    return score;
  };

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameStarted && !game.isGameOver() && game.turn() !== playerColor && !isThinking) {
      makeAIMove();
    }
  }, [gameStarted, game.turn(), playerColor, isThinking, makeAIMove, game]);

  useEffect(() => {
    return () => {
      clearAiTimeout();
    };
  }, [clearAiTimeout]);

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      if (game.turn() !== playerColor || isThinking) return false;

      const success = makeMove(from, to, promotion as any);
      if (success) {
        setLastMove({ from, to });
        const materialScore = calculateMaterial(game);
        setEvaluation(materialScore);
      }
      return success;
    },
    [game, playerColor, isThinking, makeMove]
  );

  const handleUndo = useCallback(() => {
    // Undo both player and AI move
    undoMove();
    undoMove();
    setLastMove(undefined);
  }, [undoMove]);

  const handleResign = useCallback(() => {
    setGameResult(`You resigned. ${playerColor === 'w' ? 'Black' : 'White'} wins!`);
    setShowGameOver(true);
    recordGame(false);
  }, [playerColor, recordGame]);

  const handleNewGame = useCallback(() => {
    clearAiTimeout();
    resetGame();
    setShowGameOver(false);
    setLastMove(undefined);
    setEvaluation(0);
    setGameStarted(false);
    setIsThinking(false);
  }, [resetGame, clearAiTimeout]);

  const startGame = useCallback((color: 'w' | 'b' | 'random') => {
    clearAiTimeout();
    const actualColor = color === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : color;
    setPlayerColor(actualColor);
    setBoardFlipped(actualColor === 'b');
    setGameStarted(true);
    resetGame();
    setIsThinking(false);
  }, [resetGame, clearAiTimeout]);

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

  if (!gameStarted) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-4">
              <Bot className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Play vs Computer</h1>
            <p className="text-slate-400">Challenge our AI at various difficulty levels</p>
          </div>

          {/* Difficulty Selection */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Difficulty</h2>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map(({ value, label, description, elo }) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    difficulty === value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-white">{label}</span>
                    <span className="text-xs text-slate-500">{elo}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Choose Your Color</h2>
            <div className="flex gap-3">
              <button
                onClick={() => startGame('w')}
                className="flex-1 btn btn-secondary flex flex-col items-center gap-2 py-4"
              >
                <div className="w-8 h-8 rounded-full bg-white" />
                <span>Play White</span>
              </button>
              <button
                onClick={() => startGame('random')}
                className="flex-1 btn btn-primary flex flex-col items-center gap-2 py-4"
              >
                <RotateCw size={24} />
                <span>Random</span>
              </button>
              <button
                onClick={() => startGame('b')}
                className="flex-1 btn btn-secondary flex flex-col items-center gap-2 py-4"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600" />
                <span>Play Black</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Board */}
          <div className="flex-shrink-0">
            {/* Opponent info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Stockfish AI</div>
                <div className="text-xs text-slate-400 capitalize">{difficulty} Level</div>
              </div>
              {isThinking && (
                <div className="ml-auto flex items-center gap-2 text-blue-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>

            {/* Board with eval bar */}
            <div className="flex gap-3">
              <EvaluationBar score={evaluation} />
              <ChessBoard
                fen={gameState.fen}
                playerColor={boardFlipped ? 'b' : playerColor}
                onMove={handleMove}
                disabled={game.turn() !== playerColor || isThinking || gameState.isGameOver}
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

            {/* Player info */}
            <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <Crown size={20} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">You</div>
                <div className="text-xs text-slate-400">{playerColor === 'w' ? 'White' : 'Black'}</div>
              </div>
            </div>
          </div>

          {/* Right side - Info panels */}
          <div className="flex-1 space-y-4">
            <GameControls
              onUndo={handleUndo}
              onResign={handleResign}
              onReset={handleNewGame}
              onFlipBoard={() => setBoardFlipped(!boardFlipped)}
              canUndo={gameState.moveHistory.length >= 2 && !isThinking}
              isGameOver={gameState.isGameOver}
            />

            <MoveHistory moves={gameState.moveHistory} />

            <CapturedPieces
              whiteCaptured={gameState.capturedPieces.white}
              blackCaptured={gameState.capturedPieces.black}
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal isOpen={showGameOver} onClose={() => setShowGameOver(false)} title="Game Over">
        <div className="text-center py-4">
          <p className="text-xl font-semibold text-white mb-6">{gameResult}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleNewGame} className="btn btn-primary">
              New Game
            </button>
            <button onClick={() => setShowGameOver(false)} className="btn btn-secondary">
              Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
