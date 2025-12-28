import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { getRandomPuzzleByDifficulty, difficultyLevels, getPuzzlesByDifficulty } from '../data/puzzles';
import type { PuzzleDifficulty } from '../data/puzzles';
import { useGameStore } from '../store/gameStore';
import { useRatingStore } from '../store/ratingStore';
import { useSpacedRepetitionStore } from '../store/spacedRepetitionStore';
import { getRatingDescription, getRatingColor, formatRatingChange, getNextMilestone } from '../utils/rating';
import type { RatingChange } from '../utils/rating';
import {
  ChevronLeft,
  Puzzle,
  Lightbulb,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Flame,
  Star,
  RefreshCw,
  Brain,
} from 'lucide-react';
import type { Puzzle as PuzzleType, Arrow } from '../types';

export function Puzzles() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<PuzzleDifficulty | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType | null>(null);
  const [game, setGame] = useState<Chess | null>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [moveIndex, setMoveIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(0); // 0 = no hint, 1 = piece highlight, 2 = full arrow
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [solutionArrows, setSolutionArrows] = useState<Arrow[]>([]);
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [lastRatingChange, setLastRatingChange] = useState<RatingChange | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { progress, solvePuzzle, settings } = useGameStore();
  const {
    rating,
    peakRating,
    puzzlesSolved,
    puzzlesAttempted,
    currentStreak,
    bestStreak,
    recordPuzzleAttempt,
    getAccuracy,
    getTrendDirection,
  } = useRatingStore();
  const {
    recordAttempt: recordSpacedRepetition,
    getDueCount,
    getReviewStats,
  } = useSpacedRepetitionStore();

  const clearOpponentTimeout = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }
  }, []);

  const startPuzzle = useCallback((puzzle: PuzzleType) => {
    clearOpponentTimeout();
    const newGame = new Chess(puzzle.fen);
    setGame(newGame);
    setCurrentPuzzle(puzzle);
    setMoveIndex(0);
    setSolved(false);
    setFailed(false);
    setHintLevel(0);
    setLastMove(undefined);
    setSolutionArrows([]);
    setLastRatingChange(null);
    setUsedHint(false);
    setIsWaitingForOpponent(false);

    // Determine player color (opposite of who moves first in the puzzle)
    setPlayerColor(newGame.turn() === 'w' ? 'b' : 'w');

    // Make the first move (the "opponent's" move that sets up the puzzle)
    // Actually in most puzzles, the player moves first
    // Let's check: if it's white to move and there's a solution starting with white,
    // then the player is white
    const firstMoveColor = newGame.turn();
    setPlayerColor(firstMoveColor);
  }, [clearOpponentTimeout]);

  const startRandomPuzzle = useCallback(() => {
    if (!selectedDifficulty) return;
    const puzzle = getRandomPuzzleByDifficulty(selectedDifficulty, progress.puzzlesSolved);
    if (puzzle) {
      startPuzzle(puzzle);
      setPuzzleCount(prev => prev + 1);
    }
  }, [selectedDifficulty, progress.puzzlesSolved, startPuzzle]);

  const selectDifficulty = (difficulty: PuzzleDifficulty) => {
    setSelectedDifficulty(difficulty);
    setPuzzleCount(0);
    const puzzle = getRandomPuzzleByDifficulty(difficulty, progress.puzzlesSolved);
    if (puzzle) {
      startPuzzle(puzzle);
      setPuzzleCount(1);
    }
  };

  const goBackToLevels = () => {
    setSelectedDifficulty(null);
    setCurrentPuzzle(null);
    setGame(null);
    setPuzzleCount(0);
    setIsWaitingForOpponent(false);
  };

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      if (!game || !currentPuzzle || solved || failed || isWaitingForOpponent) return false;

      const expectedMove = currentPuzzle.moves[moveIndex];
      const attemptedMove = `${from}${to}`;
      const expectedPromotion = expectedMove.length > 4 ? expectedMove[4] : undefined;

      // First, verify the move is legal by trying it
      const testGame = new Chess(game.fen());
      const legalMove = testGame.move({
        from,
        to,
        promotion: (promotion || expectedPromotion || 'q') as any
      });

      if (!legalMove) {
        // Not a legal move at all
        return false;
      }

      // Check if this is the correct move (matches expected solution)
      const isCorrectMove =
        attemptedMove === expectedMove.slice(0, 4) &&
        (!expectedPromotion || promotion === expectedPromotion || (!promotion && expectedPromotion === 'q'));

      if (isCorrectMove) {
        // Make the move on the actual game
        game.move({ from, to, promotion: (promotion || expectedPromotion || 'q') as any });
        setLastMove({ from, to });

        if (moveIndex + 1 >= currentPuzzle.moves.length) {
          // Puzzle solved!
          setSolved(true);
          setIsWaitingForOpponent(false);
          solvePuzzle(currentPuzzle.id, currentPuzzle.rating);
          // Record rating change
          const result = usedHint ? 'hint' : 'correct';
          const ratingChange = recordPuzzleAttempt(
            currentPuzzle.id,
            currentPuzzle.rating,
            currentPuzzle.themes,
            result
          );
          setLastRatingChange(ratingChange);
          // Record for spaced repetition
          recordSpacedRepetition(
            currentPuzzle.id,
            currentPuzzle.rating,
            currentPuzzle.themes,
            result
          );
          setGame(new Chess(game.fen()));
        } else {
          // Make the opponent's response after a short delay
          const newMoveIndex = moveIndex + 1;
          setMoveIndex(newMoveIndex);
          setGame(new Chess(game.fen()));
          setIsWaitingForOpponent(true);

          clearOpponentTimeout();
          opponentTimeoutRef.current = setTimeout(() => {
            const opponentMove = currentPuzzle.moves[newMoveIndex];
            if (opponentMove) {
              const from2 = opponentMove.slice(0, 2) as Square;
              const to2 = opponentMove.slice(2, 4) as Square;
              const promo = opponentMove[4];
              game.move({ from: from2, to: to2, promotion: promo as any });
              setLastMove({ from: from2, to: to2 });
              setMoveIndex(newMoveIndex + 1);
              setGame(new Chess(game.fen())); // Force re-render
            }
            setIsWaitingForOpponent(false);
          }, 400);
        }

        return true;
      }

      // Legal move but wrong - mark as failed
      setFailed(true);
      setIsWaitingForOpponent(false);
      // Record failed attempt
      const ratingChange = recordPuzzleAttempt(
        currentPuzzle.id,
        currentPuzzle.rating,
        currentPuzzle.themes,
        'incorrect'
      );
      setLastRatingChange(ratingChange);
      // Record for spaced repetition (failed puzzles will come back sooner)
      recordSpacedRepetition(
        currentPuzzle.id,
        currentPuzzle.rating,
        currentPuzzle.themes,
        'incorrect'
      );
      return false;
    },
    [game, currentPuzzle, moveIndex, solved, failed, isWaitingForOpponent, solvePuzzle, usedHint, recordPuzzleAttempt, recordSpacedRepetition, clearOpponentTimeout]
  );

  const handleRetry = () => {
    if (currentPuzzle) {
      startPuzzle(currentPuzzle);
    }
  };

  useEffect(() => {
    return () => {
      clearOpponentTimeout();
    };
  }, [clearOpponentTimeout]);

  const getLegalMoves = useCallback(
    (square: Square): Square[] => {
      if (!game) return [];
      const moves = game.moves({ square, verbose: true });
      return moves.map((m) => m.to as Square);
    },
    [game]
  );

  // Get hint data based on current hint level
  const getHintData = useCallback((): { highlightSquares: Square[]; arrows: Arrow[] } => {
    if (!currentPuzzle || hintLevel < 1) {
      return { highlightSquares: [], arrows: [] };
    }

    const expectedMove = currentPuzzle.moves[moveIndex];
    if (!expectedMove) return { highlightSquares: [], arrows: [] };

    const fromSquare = expectedMove.slice(0, 2) as Square;
    const toSquare = expectedMove.slice(2, 4) as Square;

    if (hintLevel === 1) {
      // Level 1: Highlight the piece to move
      return { highlightSquares: [fromSquare], arrows: [] };
    }

    if (hintLevel >= 2) {
      // Level 2: Show full move with arrow
      return {
        highlightSquares: [fromSquare],
        arrows: [{ from: fromSquare, to: toSquare, color: 'rgba(0, 200, 100, 0.8)' }],
      };
    }

    return { highlightSquares: [], arrows: [] };
  }, [currentPuzzle, moveIndex, hintLevel]);

  const { highlightSquares: hintSquares, arrows: hintArrows } = getHintData();

  const showNextHint = () => {
    setHintLevel((prev) => Math.min(prev + 1, 2));
    setUsedHint(true);
  };

  const showSolution = () => {
    if (!currentPuzzle) return;

    // Create arrows for all solution moves
    const arrows: Arrow[] = [];
    const colors = ['rgba(0, 200, 100, 0.9)', 'rgba(100, 100, 255, 0.7)', 'rgba(255, 200, 0, 0.7)', 'rgba(200, 100, 255, 0.7)'];

    currentPuzzle.moves.forEach((moveStr, index) => {
      const from = moveStr.slice(0, 2) as Square;
      const to = moveStr.slice(2, 4) as Square;
      arrows.push({
        from,
        to,
        color: colors[index % colors.length],
      });
    });

    setSolutionArrows(arrows);
    setSolved(true);
  };

  // Helper to format a move string to readable notation
  const formatMove = (moveStr: string): string => {
    const from = moveStr.slice(0, 2);
    const to = moveStr.slice(2, 4);
    const promotion = moveStr[4];
    if (promotion) {
      const pieceNames: Record<string, string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };
      return `${from} → ${to} (promote to ${pieceNames[promotion] || 'Queen'})`;
    }
    return `${from} → ${to}`;
  };

  // Get explanation for the puzzle theme
  const getThemeExplanation = (theme: string): string => {
    const explanations: Record<string, string> = {
      mate: 'This is a checkmate puzzle - the goal is to trap the enemy king with no escape.',
      mateIn1: 'Mate in 1 - find the single move that delivers checkmate!',
      mateIn2: 'Mate in 2 - force checkmate in exactly two moves, considering the opponent\'s best defense.',
      backRankMate: 'Back rank mate exploits a king trapped behind its own pawns on the first/eighth rank.',
      fork: 'A fork attacks two or more pieces simultaneously, winning material.',
      knightFork: 'Knights are excellent forking pieces due to their unique L-shaped movement.',
      pin: 'A pin immobilizes a piece because moving it would expose a more valuable piece behind it.',
      skewer: 'A skewer is like a reverse pin - the more valuable piece is attacked and must move, exposing the piece behind.',
      discoveredAttack: 'Moving one piece reveals an attack from another piece behind it.',
      sacrifice: 'Sometimes giving up material leads to a greater advantage or checkmate.',
      deflection: 'Deflection forces a defending piece away from a critical square or duty.',
      short: 'A short tactical sequence requiring precise calculation.',
      opening: 'An opening tactic that can catch opponents off guard in the first moves.',
      center: 'Central control is crucial - pieces in the center control more squares.',
      attack: 'Creating threats forces your opponent to respond defensively.',
      capture: 'Winning material through captures is a fundamental chess skill.',
      pawnBreak: 'Pawn breaks open up the position and create new opportunities.',
      gambit: 'A gambit sacrifices material (usually a pawn) for rapid development or attack.',
      prophylaxis: 'Prophylactic moves prevent your opponent\'s plans before they happen.',
      positional: 'Positional play focuses on piece placement and long-term advantages.',
      exchange: 'Exchanging pieces at the right moment can simplify to a winning position.',
      threat: 'Creating threats puts pressure on your opponent and limits their options.',
      check: 'Giving check can win time or force the king into a worse position.',
      smotheredMate: 'A smothered mate occurs when the king is surrounded by its own pieces and cannot escape a knight check.',
      pawnStorm: 'Pushing pawns toward the enemy king can create devastating attacks.',
      development: 'Developing pieces quickly and efficiently gives you more options.',
    };
    return explanations[theme] || `This puzzle features a ${theme} theme.`;
  };

  // Difficulty Selection Screen
  if (!selectedDifficulty || !currentPuzzle || !game) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/learn"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Puzzle className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Solve Puzzles</h1>
                <p className="text-slate-400">Choose your difficulty level</p>
              </div>
            </div>
          </div>

          {/* Review Mode - Show if there are due puzzles */}
          {getDueCount() > 0 && (
            <div className="mb-6">
              <div className="card p-5 border-2 border-purple-500/50 bg-gradient-to-r from-purple-900/20 to-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <Brain size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <RefreshCw size={18} className="text-purple-400" />
                        Review Mode
                      </h3>
                      <span className="text-sm font-bold text-purple-400">
                        {getDueCount()} puzzles due
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      Strengthen your skills by reviewing puzzles you've struggled with
                    </p>
                    {/* Review stats */}
                    {(() => {
                      const stats = getReviewStats();
                      return (
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-slate-500">
                            <span className="text-green-400 font-semibold">{stats.mastered}</span> mastered
                          </span>
                          <span className="text-slate-500">
                            <span className="text-yellow-400 font-semibold">{stats.learning}</span> learning
                          </span>
                          <span className="text-slate-500">
                            <span className="text-purple-400 font-semibold">{stats.total}</span> tracked
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Difficulty Levels */}
          <div className="space-y-4">
            {difficultyLevels.map((level) => {
              const puzzlesInLevel = getPuzzlesByDifficulty(level.value);
              const solvedInLevel = puzzlesInLevel.filter(p => progress.puzzlesSolved.includes(p.id)).length;

              return (
                <button
                  key={level.value}
                  onClick={() => selectDifficulty(level.value)}
                  className="card p-5 w-full text-left hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center flex-shrink-0`}>
                      <Target size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {level.label}
                        </h3>
                        <span className="text-sm text-slate-400">
                          {solvedInLevel}/{puzzlesInLevel.length} solved
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{level.description}</p>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${level.color} transition-all`}
                          style={{ width: `${puzzlesInLevel.length > 0 ? (solvedInLevel / puzzlesInLevel.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="card p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-yellow-500" />
                <span className="text-lg font-semibold text-white">Your Progress</span>
              </div>
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame size={18} />
                  <span className="font-bold">{currentStreak}</span>
                </div>
              )}
            </div>

            {/* Rating display */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getRatingColor(rating)}`}>{rating}</div>
                  <div className={`text-sm ${getRatingColor(rating)}`}>{getRatingDescription(rating)}</div>
                </div>
                <div className="text-right">
                  {getTrendDirection() === 'up' && (
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp size={20} />
                      <span className="text-sm">Improving</span>
                    </div>
                  )}
                  {getTrendDirection() === 'down' && (
                    <div className="flex items-center gap-1 text-red-400">
                      <TrendingDown size={20} />
                      <span className="text-sm">Struggling</span>
                    </div>
                  )}
                  {getTrendDirection() === 'stable' && (
                    <div className="text-slate-400 text-sm">Stable</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">Peak: {peakRating}</div>
                </div>
              </div>
              {/* Progress to next milestone */}
              {(() => {
                const next = getNextMilestone(rating);
                const progress = ((rating - (next.rating - 200)) / 200) * 100;
                return (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Next: {next.title}</span>
                      <span>{next.rating - rating} points to go</span>
                    </div>
                    <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{puzzlesSolved}</div>
                <div className="text-xs text-slate-400">Solved</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{puzzlesAttempted}</div>
                <div className="text-xs text-slate-400">Attempted</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{getAccuracy().toFixed(0)}%</div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                  <Star size={16} className="text-yellow-400" />
                  {bestStreak}
                </div>
                <div className="text-xs text-slate-400">Best Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = difficultyLevels.find(l => l.value === selectedDifficulty);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBackToLevels}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Levels
          </button>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentLevel?.color || ''} text-white text-sm font-medium`}>
              {currentLevel?.label}
            </div>
            <div className="text-sm text-slate-400">
              Puzzle #{puzzleCount}
            </div>
            <div className="text-sm text-slate-400">
              Rating: <span className="text-white font-semibold">{currentPuzzle.rating}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Board */}
          <div className="flex-shrink-0 relative">
            <ChessBoard
              fen={game.fen()}
              playerColor={playerColor}
              onMove={handleMove}
              disabled={solved || failed || isWaitingForOpponent}
              showCoordinates={settings.showCoordinates}
              showLegalMoves={settings.showLegalMoves}
              boardTheme={settings.boardTheme}
              autoQueen={settings.autoQueen}
              premoveEnabled={settings.premoveEnabled}
              soundEnabled={settings.soundEnabled}
              lastMove={lastMove}
              getLegalMoves={getLegalMoves}
              highlightSquares={hintSquares}
              arrows={solutionArrows.length > 0 ? solutionArrows : hintArrows}
            />

            {/* Status overlay */}
            {(solved || failed) && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg ${
                  solved ? 'border-4 border-green-500' : 'border-4 border-red-500'
                }`}
              >
                <div className="text-center">
                  {solved ? (
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-2" />
                  ) : (
                    <XCircle size={64} className="text-red-500 mx-auto mb-2" />
                  )}
                  <div className="text-xl font-bold text-white">
                    {solved ? 'Correct!' : 'Incorrect'}
                  </div>
                  {/* Rating change display */}
                  {lastRatingChange && (
                    <div className={`text-2xl font-bold mt-2 ${
                      lastRatingChange.change > 0 ? 'text-green-400' :
                      lastRatingChange.change < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {formatRatingChange(lastRatingChange.change)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-4">
            {/* Puzzle info */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                  <Puzzle size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {playerColor === 'w' ? 'White' : 'Black'} to play
                  </h2>
                  <p className="text-sm text-slate-400">Find the best move</p>
                </div>
              </div>

              {currentPuzzle.description && (
                <p className="text-slate-300 mb-4">{currentPuzzle.description}</p>
              )}

              {/* Themes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentPuzzle.themes.map((theme) => (
                  <span
                    key={theme}
                    className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
                  >
                    {theme}
                  </span>
                ))}
              </div>

              {/* Hints */}
              {hintLevel >= 1 && !solved && !failed && (
                <div className="space-y-2 mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
                    <p className="text-yellow-200 text-sm">
                      <span className="font-semibold">Theme:</span> Look for a {currentPuzzle.themes[0] || 'tactical'} opportunity!
                    </p>
                  </div>
                  {hintLevel >= 1 && (
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/50">
                      <p className="text-blue-200 text-sm">
                        <span className="font-semibold">Piece:</span> The highlighted square shows which piece to move.
                      </p>
                    </div>
                  )}
                  {hintLevel >= 2 && (
                    <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50">
                      <p className="text-green-200 text-sm">
                        <span className="font-semibold">Move:</span> Follow the arrow to see the best move!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="card p-6 space-y-3">
              {!solved && !failed && (
                <>
                  <button
                    onClick={showNextHint}
                    disabled={hintLevel >= 2}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Lightbulb size={18} />
                    {hintLevel === 0 && 'Show Piece to Move'}
                    {hintLevel === 1 && 'Show Full Move'}
                    {hintLevel >= 2 && 'All Hints Used'}
                  </button>
                  <button
                    onClick={showSolution}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    Show Solution
                  </button>
                </>
              )}

              {(solved || failed) && (
                <>
                  <button
                    onClick={handleRetry}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Try Again
                  </button>
                  <button
                    onClick={startRandomPuzzle}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Next Puzzle
                    <ArrowRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Solution Explanation - shows after solved or failed */}
            {(solved || failed) && (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Solution Explained</h3>
                    <p className="text-sm text-slate-400">Why these moves work</p>
                  </div>
                </div>

                {/* Theme explanation */}
                <div className="mb-4 p-3 rounded-lg bg-slate-700/50">
                  <p className="text-slate-300 text-sm">
                    <span className="font-semibold text-blue-400">Theme: </span>
                    {getThemeExplanation(currentPuzzle.themes[0])}
                  </p>
                </div>

                {/* Move-by-move breakdown */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Winning Sequence:</p>
                  {currentPuzzle.moves.map((move, index) => {
                    const isPlayerMove = index % 2 === 0;
                    const moveNumber = Math.floor(index / 2) + 1;
                    const colors = ['bg-green-500/20 border-green-500/50', 'bg-blue-500/20 border-blue-500/50', 'bg-yellow-500/20 border-yellow-500/50', 'bg-purple-500/20 border-purple-500/50'];
                    const textColors = ['text-green-300', 'text-blue-300', 'text-yellow-300', 'text-purple-300'];

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${colors[index % colors.length]}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${textColors[index % textColors.length]}`}>
                            {isPlayerMove ? `${moveNumber}.` : `${moveNumber}...`}
                          </span>
                          <span className={`font-mono ${textColors[index % textColors.length]}`}>
                            {formatMove(move)}
                          </span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {isPlayerMove ? '(Your move)' : '(Opponent)'}
                          </span>
                        </div>
                        {index === 0 && (
                          <p className="text-sm text-slate-400 mt-2">
                            {currentPuzzle.description || 'This is the key move that starts the winning combination.'}
                          </p>
                        )}
                        {index === currentPuzzle.moves.length - 1 && currentPuzzle.moves.length > 1 && (
                          <p className="text-sm text-slate-400 mt-2">
                            {currentPuzzle.themes.includes('mate') || currentPuzzle.themes.includes('mateIn1') || currentPuzzle.themes.includes('mateIn2')
                              ? 'Checkmate! The king has no escape.'
                              : 'This completes the tactical sequence, winning material or achieving the goal.'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional tip */}
                {currentPuzzle.themes.length > 1 && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-sm text-yellow-200">
                      <span className="font-semibold">Tip: </span>
                      {getThemeExplanation(currentPuzzle.themes[1])}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Trophy size={20} className="text-yellow-500" />
                  <span className="font-semibold text-white">Your Progress</span>
                </div>
                {currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame size={16} />
                    <span className="font-bold text-sm">{currentStreak} streak</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className={`text-xl font-bold ${getRatingColor(rating)}`}>
                    {rating}
                  </div>
                  <div className="text-xs text-slate-400">Rating</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-xl font-bold text-white">
                    {puzzlesSolved}
                  </div>
                  <div className="text-xs text-slate-400">Solved</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-xl font-bold text-white">
                    {getAccuracy().toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-400">Accuracy</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-xl font-bold text-white">
                    {bestStreak}
                  </div>
                  <div className="text-xs text-slate-400">Best Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
