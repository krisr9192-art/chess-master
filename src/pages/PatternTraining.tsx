import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { ChessBoard } from '../components/Board/ChessBoard';
import { patterns } from '../data/patterns';
import type { ChessPattern, PatternExample } from '../data/patterns';
import { useGameStore } from '../store/gameStore';
import {
  ChevronLeft,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightbulb,
  Trophy,
  BookOpen,
  Zap,
  Star,
  RotateCcw,
} from 'lucide-react';

type Phase = 'select' | 'learn' | 'practice';

interface PatternProgress {
  attempted: number;
  correct: number;
  mastered: boolean;
}

export function PatternTraining() {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedPattern, setSelectedPattern] = useState<ChessPattern | null>(null);
  const [currentExample, setCurrentExample] = useState<PatternExample | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | undefined>();
  const [patternProgress, setPatternProgress] = useState<Record<string, PatternProgress>>({});
  const [score, setScore] = useState(0);
  const { settings } = useGameStore();
  const opponentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const clearOpponentTimeout = useCallback(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
      opponentTimeoutRef.current = null;
    }
  }, []);

  const startPattern = (pattern: ChessPattern) => {
    setSelectedPattern(pattern);
    setPhase('learn');
    setExampleIndex(0);
    setSolved(false);
    setFailed(false);
  };

  const startPractice = () => {
    if (!selectedPattern) return;
    setPhase('practice');
    setExampleIndex(0);
    loadExample(selectedPattern.examples[0]);
  };

  const loadExample = (example: PatternExample) => {
    clearOpponentTimeout();
    const newGame = new Chess(example.fen);
    setGame(newGame);
    setCurrentExample(example);
    setMoveIndex(0);
    setSolved(false);
    setFailed(false);
    setShowHint(false);
    setLastMove(undefined);
    setIsWaitingForOpponent(false);
  };

  const nextExample = () => {
    if (!selectedPattern) return;
    const nextIndex = exampleIndex + 1;
    if (nextIndex < selectedPattern.examples.length) {
      setExampleIndex(nextIndex);
      loadExample(selectedPattern.examples[nextIndex]);
    } else {
      // Pattern complete
      setPhase('select');
      setSelectedPattern(null);
    }
  };

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      if (!game || !currentExample || solved || failed || isWaitingForOpponent) return false;

      const expectedMove = currentExample.solution[moveIndex];
      const attemptedMove = `${from}${to}`;
      const expectedPromotion = expectedMove.length > 4 ? expectedMove[4] : undefined;

      // Check if move matches expected
      const isCorrect =
        attemptedMove === expectedMove.slice(0, 4) &&
        (!expectedPromotion || promotion === expectedPromotion || (!promotion && expectedPromotion === 'q'));

      if (isCorrect) {
        const move = game.move({ from, to, promotion: promotion as any });
        if (!move) return false;

        setLastMove({ from, to });
        setGame(new Chess(game.fen()));

        if (moveIndex + 1 >= currentExample.solution.length) {
          // Pattern solved!
          setSolved(true);
          setScore(prev => prev + 1);
          setIsWaitingForOpponent(false);

          // Update pattern progress
          if (selectedPattern) {
            setPatternProgress(prev => {
              const current = prev[selectedPattern.id] || { attempted: 0, correct: 0, mastered: false };
              const newCorrect = current.correct + 1;
              return {
                ...prev,
                [selectedPattern.id]: {
                  attempted: current.attempted + 1,
                  correct: newCorrect,
                  mastered: newCorrect >= 8,
                },
              };
            });
          }
        } else {
          // Make opponent's response if there is one
          const nextMoveIndex = moveIndex + 1;
          setMoveIndex(nextMoveIndex);
          setIsWaitingForOpponent(true);

          clearOpponentTimeout();
          opponentTimeoutRef.current = setTimeout(() => {
            if (nextMoveIndex < currentExample.solution.length) {
              const opponentMove = currentExample.solution[nextMoveIndex];
              const from2 = opponentMove.slice(0, 2) as Square;
              const to2 = opponentMove.slice(2, 4) as Square;
              game.move({ from: from2, to: to2 });
              setLastMove({ from: from2, to: to2 });
              setMoveIndex(nextMoveIndex + 1);
              setGame(new Chess(game.fen()));
            }
            setIsWaitingForOpponent(false);
          }, 300);
        }

        return true;
      }

      // Wrong move
      const testGame = new Chess(game.fen());
      const legalMove = testGame.move({ from, to, promotion: promotion as any });
      if (legalMove) {
        setFailed(true);
        setIsWaitingForOpponent(false);
        if (selectedPattern) {
          setPatternProgress(prev => {
            const current = prev[selectedPattern.id] || { attempted: 0, correct: 0, mastered: false };
            return {
              ...prev,
              [selectedPattern.id]: {
                ...current,
                attempted: current.attempted + 1,
              },
            };
          });
        }
      }
      return false;
    },
    [game, currentExample, moveIndex, solved, failed, isWaitingForOpponent, selectedPattern, clearOpponentTimeout]
  );

  const getLegalMoves = useCallback(
    (square: Square): Square[] => {
      if (!game) return [];
      const moves = game.moves({ square, verbose: true });
      return moves.map((m) => m.to as Square);
    },
    [game]
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return 'from-green-500 to-green-700';
      case 'intermediate':
        return 'from-yellow-500 to-yellow-700';
      case 'advanced':
        return 'from-red-500 to-red-700';
      default:
        return 'from-blue-500 to-blue-700';
    }
  };

  const getProgressPercent = (patternId: string) => {
    const prog = patternProgress[patternId];
    if (!prog) return 0;
    return Math.min(100, (prog.correct / 10) * 100);
  };

  useEffect(() => {
    return () => {
      clearOpponentTimeout();
    };
  }, [clearOpponentTimeout]);

  // Pattern Selection Screen
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Pattern Training</h1>
                <p className="text-slate-400">Master essential tactical patterns</p>
              </div>
            </div>
          </div>

          {/* Score */}
          {score > 0 && (
            <div className="card p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-yellow-500" />
                <span className="text-white font-semibold">Session Score</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
            </div>
          )}

          {/* Patterns Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {patterns.map((pattern) => {
              const progress = patternProgress[pattern.id];
              const progressPercent = getProgressPercent(pattern.id);

              return (
                <button
                  key={pattern.id}
                  onClick={() => startPattern(pattern)}
                  className="card p-5 text-left hover:border-purple-500 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDifficultyColor(pattern.difficulty)} flex items-center justify-center flex-shrink-0`}>
                      <Target size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                          {pattern.name}
                        </h3>
                        {progress?.mastered && (
                          <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{pattern.description}</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(pattern.difficulty)} text-white`}>
                          {pattern.difficulty}
                        </span>
                        <span className="text-xs text-slate-500">
                          {pattern.examples.length} examples
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      {progress && (
                        <div className="text-xs text-slate-500 mt-1">
                          {progress.correct}/{progress.attempted} correct
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Learning Phase
  if (phase === 'learn' && selectedPattern) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setPhase('select')}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedPattern.name}</h1>
              <p className="text-slate-400">{selectedPattern.description}</p>
            </div>
          </div>

          {/* Pattern Explanation */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={24} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white">How It Works</h2>
            </div>
            <p className="text-slate-300 mb-4">{selectedPattern.explanation}</p>

            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Key Features
            </h3>
            <ul className="space-y-2">
              {selectedPattern.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <Zap size={14} className="text-yellow-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Start Practice Button */}
          <button
            onClick={startPractice}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Target size={20} />
            Start Practice ({selectedPattern.examples.length} positions)
          </button>
        </div>
      </div>
    );
  }

  // Practice Phase
  if (phase === 'practice' && selectedPattern && currentExample && game) {
    const playerColor = game.turn();

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setPhase('select')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{selectedPattern.name}</h1>
              <p className="text-sm text-slate-400">
                Position {exampleIndex + 1} of {selectedPattern.examples.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              <span className="text-white font-bold">{score}</span>
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
                      {solved ? 'Pattern Found!' : 'Try Again'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-4">
              {/* Instructions */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {playerColor === 'w' ? 'White' : 'Black'} to move
                    </h2>
                    <p className="text-sm text-slate-400">Find the {selectedPattern.name} pattern</p>
                  </div>
                </div>

                {/* Hint */}
                {showHint && (
                  <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb size={16} className="text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-200">Hint</span>
                    </div>
                    <p className="text-yellow-100 text-sm">{currentExample.hint}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="card p-6 space-y-3">
                {!solved && !failed && (
                  <>
                    <button
                      onClick={() => setShowHint(true)}
                      disabled={showHint}
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <Lightbulb size={18} />
                      {showHint ? 'Hint Shown' : 'Show Hint'}
                    </button>
                  </>
                )}

                {(solved || failed) && (
                  <>
                    {failed && (
                      <button
                        onClick={() => loadExample(currentExample)}
                        className="btn btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} />
                        Try Again
                      </button>
                    )}
                    <button
                      onClick={nextExample}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {exampleIndex + 1 < selectedPattern.examples.length ? (
                        <>
                          Next Position
                          <ArrowRight size={18} />
                        </>
                      ) : (
                        <>
                          Complete Training
                          <Trophy size={18} />
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Progress */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target size={20} className="text-purple-400" />
                  <span className="font-semibold text-white">Progress</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${((exampleIndex + (solved ? 1 : 0)) / selectedPattern.examples.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400">
                  {exampleIndex + (solved ? 1 : 0)} of {selectedPattern.examples.length} positions completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
