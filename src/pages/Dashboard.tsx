import { Link } from 'react-router-dom';
import { useRatingStore } from '../store/ratingStore';
import { useSpacedRepetitionStore } from '../store/spacedRepetitionStore';
import { getRatingDescription, getRatingColor, getNextMilestone } from '../utils/rating';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Flame,
  Star,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Brain,
} from 'lucide-react';

export function Dashboard() {
  const {
    rating,
    peakRating,
    puzzlesSolved,
    puzzlesAttempted,
    currentStreak,
    bestStreak,
    ratingHistory,
    themePerformance,
    getAccuracy,
    getTrendDirection,
    getThemeWeaknesses,
    getThemeStrengths,
  } = useRatingStore();

  const { getReviewStats } = useSpacedRepetitionStore();
  const reviewStats = getReviewStats();

  const accuracy = getAccuracy();
  const trend = getTrendDirection();
  const weaknesses = getThemeWeaknesses();
  const strengths = getThemeStrengths();
  const nextMilestone = getNextMilestone(rating);

  // Get recent rating changes for mini chart
  const recentHistory = ratingHistory.slice(-30);
  const minRating = recentHistory.length > 0 ? Math.min(...recentHistory.map(h => h.rating)) - 50 : rating - 100;
  const maxRating = recentHistory.length > 0 ? Math.max(...recentHistory.map(h => h.rating)) + 50 : rating + 100;
  const ratingRange = maxRating - minRating || 1;

  // Calculate stats by theme
  const themeStats = Object.entries(themePerformance)
    .filter(([, perf]) => perf.attempts >= 3)
    .sort((a, b) => b[1].attempts - a[1].attempts)
    .slice(0, 10);

  // Format theme name for display
  const formatThemeName = (theme: string): string => {
    return theme
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Progress Dashboard</h1>
              <p className="text-slate-400">Track your chess improvement journey</p>
            </div>
          </div>
        </div>

        {/* Main Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Rating Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                <span className="font-semibold text-white">Rating</span>
              </div>
              {trend === 'up' && <TrendingUp size={20} className="text-green-400" />}
              {trend === 'down' && <TrendingDown size={20} className="text-red-400" />}
            </div>
            <div className={`text-5xl font-bold ${getRatingColor(rating)}`}>{rating}</div>
            <div className={`text-sm ${getRatingColor(rating)} mt-1`}>{getRatingDescription(rating)}</div>
            <div className="text-xs text-slate-500 mt-2">Peak: {peakRating}</div>

            {/* Progress to next milestone */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Next: {nextMilestone.title}</span>
                <span>{nextMilestone.rating - rating} pts to go</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((rating - (nextMilestone.rating - 200)) / 200) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Puzzles Stats */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-blue-500" />
              <span className="font-semibold text-white">Puzzle Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-white">{puzzlesSolved}</div>
                <div className="text-xs text-slate-400">Solved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{puzzlesAttempted}</div>
                <div className="text-xs text-slate-400">Attempted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{accuracy.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{reviewStats.total}</div>
                <div className="text-xs text-slate-400">Tracked</div>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-orange-500" />
              <span className="font-semibold text-white">Streaks</span>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <Zap size={24} className="text-orange-400" />
                  <span className="text-4xl font-bold text-white">{currentStreak}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Current Streak</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Star size={24} className="text-yellow-400" />
                  <span className="text-4xl font-bold text-white">{bestStreak}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Best Streak</div>
              </div>
            </div>
            {currentStreak > 0 && currentStreak >= bestStreak && (
              <div className="mt-4 p-2 rounded-lg bg-orange-500/20 border border-orange-500/50">
                <p className="text-xs text-orange-200 text-center">
                  You're on your best streak ever! Keep it up!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rating History Chart */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-blue-500" />
            <span className="font-semibold text-white">Rating History</span>
            <span className="text-xs text-slate-500 ml-auto">Last 30 puzzles</span>
          </div>

          {recentHistory.length > 0 ? (
            <div className="relative h-48">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
                <span>{Math.round(maxRating)}</span>
                <span>{Math.round((maxRating + minRating) / 2)}</span>
                <span>{Math.round(minRating)}</span>
              </div>

              {/* Chart area */}
              <div className="ml-14 h-full flex items-end gap-1">
                {recentHistory.map((entry, index) => {
                  const height = ((entry.rating - minRating) / ratingRange) * 100;
                  const isUp = index > 0 && entry.rating > recentHistory[index - 1].rating;
                  const isDown = index > 0 && entry.rating < recentHistory[index - 1].rating;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col justify-end group relative"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          isUp ? 'bg-green-500' : isDown ? 'bg-red-500' : 'bg-blue-500'
                        } hover:opacity-80`}
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs whitespace-nowrap">
                          <div className="text-white font-semibold">{entry.rating}</div>
                          <div className={entry.change > 0 ? 'text-green-400' : entry.change < 0 ? 'text-red-400' : 'text-slate-400'}>
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">
              <p>Complete puzzles to see your rating history</p>
            </div>
          )}
        </div>

        {/* Theme Performance and Strengths/Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Theme Performance */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={20} className="text-purple-500" />
              <span className="font-semibold text-white">Performance by Theme</span>
            </div>

            {themeStats.length > 0 ? (
              <div className="space-y-3">
                {themeStats.map(([theme, perf]) => (
                  <div key={theme}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{formatThemeName(theme)}</span>
                      <span className="text-slate-400">
                        {perf.correct}/{perf.attempts} ({perf.accuracy.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          perf.accuracy >= 70 ? 'bg-green-500' :
                          perf.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${perf.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                <p>Complete more puzzles to see theme performance</p>
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-cyan-500" />
              <span className="font-semibold text-white">Insights</span>
            </div>

            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-sm font-medium text-green-400">Strengths</span>
                </div>
                {strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {strengths.map(theme => (
                      <span
                        key={theme}
                        className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm"
                      >
                        {formatThemeName(theme)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Solve more puzzles to identify your strengths
                  </p>
                )}
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">Areas to Improve</span>
                </div>
                {weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.map(theme => (
                      <span
                        key={theme}
                        className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm"
                      >
                        {formatThemeName(theme)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No significant weaknesses identified yet
                  </p>
                )}
              </div>

              {/* Review Stats */}
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Spaced Repetition</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-400">{reviewStats.mastered}</div>
                    <div className="text-xs text-slate-500">Mastered</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-400">{reviewStats.learning}</div>
                    <div className="text-xs text-slate-500">Learning</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-400">{reviewStats.due}</div>
                    <div className="text-xs text-slate-500">Due Now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-green-500" />
            <span className="font-semibold text-white">Recent Activity</span>
          </div>

          {ratingHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ratingHistory.slice(-10).reverse().map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30"
                >
                  <div className="flex items-center gap-3">
                    {entry.result === 'correct' ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : entry.result === 'hint' ? (
                      <Star size={18} className="text-yellow-400" />
                    ) : (
                      <AlertTriangle size={18} className="text-red-400" />
                    )}
                    <div>
                      <div className="text-sm text-white">Puzzle #{entry.puzzleId.slice(-6)}</div>
                      <div className="text-xs text-slate-500">Rating {entry.puzzleRating}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      entry.change > 0 ? 'text-green-400' :
                      entry.change < 0 ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </div>
                    <div className="text-xs text-slate-500">{entry.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500">
              <p>No activity yet. Start solving puzzles!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
