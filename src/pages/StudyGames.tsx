import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { masterGames } from '../data/masterGames';
import type { MasterGame } from '../data/masterGames';
import { useGameStore } from '../store/gameStore';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  Star,
  Calendar,
  Users,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

type Phase = 'select' | 'study';

export function StudyGames() {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedGame, setSelectedGame] = useState<MasterGame | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [currentMove, setCurrentMove] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [guessMode, setGuessMode] = useState(false);
  const [waitingForGuess, setWaitingForGuess] = useState(false);
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null);
  const { settings } = useGameStore();
  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpponentTimeout = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }
  }, []);

  // Initialize game when a master game is selected
  useEffect(() => {
    if (selectedGame) {
      clearOpponentTimeout();
      const newGame = new Chess();
      setGame(newGame);
      setCurrentMove(0);
      setLastMove(undefined);
      setGuessResult(null);
      setWaitingForGuess(guessMode);
    }
  }, [selectedGame, guessMode, clearOpponentTimeout]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !selectedGame || !game) return;

    const timer = setInterval(() => {
      if (currentMove < selectedGame.moves.length) {
        makeNextMove();
      } else {
        setIsPlaying(false);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [isPlaying, currentMove, selectedGame]);

  const makeNextMove = useCallback(() => {
    if (!selectedGame || !game || currentMove >= selectedGame.moves.length) return;

    const moveData = selectedGame.moves[currentMove];
    const move = game.move(moveData.move);

    if (move) {
      setLastMove({ from: move.from as Square, to: move.to as Square });
      setGame(new Chess(game.fen()));
      setCurrentMove(prev => prev + 1);
      setGuessResult(null);

      // In guess mode, wait for white's moves (assuming we're guessing as white)
      if (guessMode && currentMove + 1 < selectedGame.moves.length) {
        const nextMoveIndex = currentMove + 1;
        const isWhiteToMove = nextMoveIndex % 2 === 0;
        setWaitingForGuess(isWhiteToMove);
      }
    }
  }, [selectedGame, game, currentMove, guessMode]);

  const makePreviousMove = useCallback(() => {
    if (!selectedGame || currentMove <= 0) return;

    const newGame = new Chess();
    for (let i = 0; i < currentMove - 1; i++) {
      newGame.move(selectedGame.moves[i].move);
    }

    if (currentMove > 1) {
      const lastMoveData = selectedGame.moves[currentMove - 2];
      const tempGame = new Chess();
      for (let i = 0; i < currentMove - 2; i++) {
        tempGame.move(selectedGame.moves[i].move);
      }
      const move = tempGame.move(lastMoveData.move);
      if (move) {
        setLastMove({ from: move.from as Square, to: move.to as Square });
      }
    } else {
      setLastMove(undefined);
    }

    setGame(newGame);
    setCurrentMove(prev => prev - 1);
    setGuessResult(null);
    setWaitingForGuess(guessMode && (currentMove - 1) % 2 === 0);
  }, [selectedGame, currentMove, guessMode]);

  const goToMove = (moveIndex: number) => {
    if (!selectedGame) return;

    const newGame = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      newGame.move(selectedGame.moves[i].move);
    }

    if (moveIndex > 0) {
      const lastMoveData = selectedGame.moves[moveIndex - 1];
      const tempGame = new Chess();
      for (let i = 0; i < moveIndex - 1; i++) {
        tempGame.move(selectedGame.moves[i].move);
      }
      const move = tempGame.move(lastMoveData.move);
      if (move) {
        setLastMove({ from: move.from as Square, to: move.to as Square });
      }
    } else {
      setLastMove(undefined);
    }

    setGame(newGame);
    setCurrentMove(moveIndex);
    setGuessResult(null);
    setWaitingForGuess(guessMode && moveIndex % 2 === 0 && moveIndex < selectedGame.moves.length);
  };

  const goToStart = () => goToMove(0);
  const goToEnd = () => selectedGame && goToMove(selectedGame.moves.length);

  const handleGuessMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (!selectedGame || !game || !waitingForGuess) return false;

      const expectedMove = selectedGame.moves[currentMove];
      if (!expectedMove) return false;

      // Try to make the move
      const testGame = new Chess(game.fen());
      const move = testGame.move({ from, to, promotion: 'q' });

      if (!move) return false;

      // Check if it matches the expected move
      if (move.san === expectedMove.move) {
        setGuessResult('correct');
        setLastMove({ from, to });
        setGame(testGame);
        setCurrentMove(prev => prev + 1);
        setWaitingForGuess(false);

        // After a brief delay, make the opponent's response
        clearOpponentTimeout();
        opponentTimeoutRef.current = setTimeout(() => {
          if (currentMove + 1 < selectedGame.moves.length) {
            const opponentMove = selectedGame.moves[currentMove + 1];
            const newGame = new Chess(testGame.fen());
            const oppMove = newGame.move(opponentMove.move);
            if (oppMove) {
              setLastMove({ from: oppMove.from as Square, to: oppMove.to as Square });
              setGame(new Chess(newGame.fen()));
              setCurrentMove(prev => prev + 1);
              setWaitingForGuess(true);
            }
          }
        }, 800);

        return true;
      } else {
        setGuessResult('wrong');
        return false;
      }
    },
    [selectedGame, game, currentMove, waitingForGuess, clearOpponentTimeout]
  );

  useEffect(() => {
    return () => {
      clearOpponentTimeout();
    };
  }, [clearOpponentTimeout]);

  const getLegalMoves = useCallback(
    (square: Square): Square[] => {
      if (!game || !waitingForGuess) return [];
      const moves = game.moves({ square, verbose: true });
      return moves.map((m) => m.to as Square);
    },
    [game, waitingForGuess]
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'from-green-500 to-green-700';
      case 'intermediate': return 'from-yellow-500 to-yellow-700';
      case 'advanced': return 'from-red-500 to-red-700';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const selectGame = (gameData: MasterGame) => {
    setSelectedGame(gameData);
    setPhase('study');
  };

  // Game Selection Phase
  if (phase === 'select') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/learn"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Master Game Study</h1>
                <p className="text-slate-400">Learn from the greatest games ever played</p>
              </div>
            </div>
          </div>

          {/* Games List */}
          <div className="space-y-4">
            {masterGames.map((gameData) => (
              <button
                key={gameData.id}
                onClick={() => selectGame(gameData)}
                className="card p-5 w-full text-left hover:border-amber-500 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getDifficultyColor(gameData.difficulty)} flex items-center justify-center flex-shrink-0`}>
                    <Trophy size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {gameData.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(gameData.difficulty)} text-white`}>
                          {gameData.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {gameData.white} vs {gameData.black}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {gameData.year}
                      </span>
                      <span className={gameData.result === '1-0' ? 'text-white' : gameData.result === '0-1' ? 'text-slate-300' : 'text-slate-400'}>
                        {gameData.result}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm mb-3">{gameData.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {gameData.themes.map((theme) => (
                        <span
                          key={theme}
                          className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Study Phase
  if (phase === 'study' && selectedGame && game) {
    const currentMoveData = currentMove > 0 ? selectedGame.moves[currentMove - 1] : null;
    const isKeyMove = currentMoveData?.isKeyMove;

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setPhase('select')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              Back to Games
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{selectedGame.title}</h1>
              <p className="text-sm text-slate-400">
                {selectedGame.white} vs {selectedGame.black}, {selectedGame.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuessMode(!guessMode)}
                className={`btn ${guessMode ? 'btn-primary' : 'btn-secondary'} text-sm`}
              >
                <Zap size={16} />
                Guess Mode
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Board */}
            <div className="flex-shrink-0">
              <ChessBoard
                fen={game.fen()}
                playerColor="w"
                onMove={guessMode && waitingForGuess ? handleGuessMove : () => false}
                disabled={!guessMode || !waitingForGuess}
                showCoordinates={settings.showCoordinates}
                showLegalMoves={settings.showLegalMoves}
                boardTheme={settings.boardTheme}
                autoQueen={settings.autoQueen}
                premoveEnabled={settings.premoveEnabled}
                soundEnabled={settings.soundEnabled}
                lastMove={lastMove}
                getLegalMoves={getLegalMoves}
              />

              {/* Guess Result Overlay */}
              {guessMode && guessResult && (
                <div className={`mt-2 p-3 rounded-lg text-center ${
                  guessResult === 'correct' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {guessResult === 'correct' ? 'Correct!' : 'Try again or click Next to see the move'}
                </div>
              )}

              {/* Controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={goToStart}
                  className="btn btn-secondary p-2"
                  disabled={currentMove === 0}
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={makePreviousMove}
                  className="btn btn-secondary p-2"
                  disabled={currentMove === 0}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn btn-primary p-2"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={makeNextMove}
                  className="btn btn-secondary p-2"
                  disabled={currentMove >= selectedGame.moves.length}
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={goToEnd}
                  className="btn btn-secondary p-2"
                  disabled={currentMove >= selectedGame.moves.length}
                >
                  <SkipForward size={20} />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(currentMove / selectedGame.moves.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400">
                  {currentMove}/{selectedGame.moves.length}
                </span>
              </div>
            </div>

            {/* Side Panel */}
            <div className="flex-1 space-y-4">
              {/* Current Comment */}
              {showComments && currentMoveData?.comment && (
                <div className={`card p-4 ${isKeyMove ? 'border-amber-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isKeyMove && <Star size={16} className="text-amber-400" />}
                    <span className="font-semibold text-white">
                      Move {currentMove}: {currentMoveData.move}
                    </span>
                  </div>
                  <p className="text-slate-300">{currentMoveData.comment}</p>
                </div>
              )}

              {/* Toggle Comments */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                {showComments ? <EyeOff size={18} /> : <Eye size={18} />}
                {showComments ? 'Hide Comments' : 'Show Comments'}
              </button>

              {/* Move List */}
              <div className="card p-4">
                <h3 className="font-semibold text-white mb-3">Moves</h3>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {selectedGame.moves.reduce<React.ReactElement[]>((acc, move, index) => {
                    const moveNumber = Math.floor(index / 2) + 1;
                    const isWhite = index % 2 === 0;
                    const isCurrentMove = index === currentMove - 1;
                    const isKey = move.isKeyMove;

                    if (isWhite) {
                      acc.push(
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-slate-500 w-8">{moveNumber}.</span>
                          <button
                            onClick={() => goToMove(index + 1)}
                            className={`px-2 py-1 rounded text-sm transition-colors ${
                              isCurrentMove
                                ? 'bg-amber-500 text-white'
                                : isKey
                                ? 'text-amber-300 hover:bg-slate-700'
                                : 'text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {move.move}
                          </button>
                          {index + 1 < selectedGame.moves.length && (
                            <button
                              onClick={() => goToMove(index + 2)}
                              className={`px-2 py-1 rounded text-sm transition-colors ${
                                index + 1 === currentMove - 1
                                  ? 'bg-amber-500 text-white'
                                  : selectedGame.moves[index + 1].isKeyMove
                                  ? 'text-amber-300 hover:bg-slate-700'
                                  : 'text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {selectedGame.moves[index + 1].move}
                            </button>
                          )}
                        </div>
                      );
                    }
                    return acc;
                  }, [])}
                </div>
              </div>

              {/* Game Info */}
              <div className="card p-4">
                <h3 className="font-semibold text-white mb-2">About This Game</h3>
                <p className="text-slate-400 text-sm">{selectedGame.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGame.themes.map((theme) => (
                    <span
                      key={theme}
                      className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
