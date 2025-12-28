import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Puzzle, CheckCircle } from 'lucide-react';
import { tutorials, tutorialCategories } from '../data/tutorials';
import { useGameStore } from '../store/gameStore';
import { useRatingStore } from '../store/ratingStore';

export function Learn() {
  const { progress } = useGameStore();
  const { rating } = useRatingStore();

  const getTutorialProgress = (category: string) => {
    const categoryTutorials = tutorials.filter((t) => t.category === category);
    const completed = categoryTutorials.filter((t) =>
      progress.tutorialsCompleted.includes(t.id)
    ).length;
    return { completed, total: categoryTutorials.length };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Learn Chess</h1>
          <p className="text-slate-400">
            Master chess from the basics to advanced tactics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {progress.tutorialsCompleted.length}
            </div>
            <div className="text-sm text-slate-400">Lessons Complete</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {progress.puzzlesSolved.length}
            </div>
            <div className="text-sm text-slate-400">Puzzles Solved</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {rating}
            </div>
            <div className="text-sm text-slate-400">Puzzle Rating</div>
          </div>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link
            to="/tutorials"
            className="mode-card flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Interactive Tutorials</h3>
              <p className="text-slate-400 text-sm mb-3">
                Step-by-step lessons covering rules, tactics, openings, and endgames.
              </p>
              <div className="text-sm text-blue-400">
                {progress.tutorialsCompleted.length} / {tutorials.length} completed
              </div>
            </div>
          </Link>

          <Link
            to="/puzzles"
            className="mode-card flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center flex-shrink-0">
              <Puzzle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Chess Puzzles</h3>
              <p className="text-slate-400 text-sm mb-3">
                Train your tactical vision with puzzles of varying difficulty.
              </p>
              <div className="text-sm text-orange-400">
                Rating: {rating}
              </div>
            </div>
          </Link>
        </div>

        {/* Tutorial Categories */}
        <h2 className="text-xl font-bold text-white mb-4">Tutorial Categories</h2>
        <div className="space-y-3">
          {tutorialCategories.map(({ value, label, description }) => {
            const { completed, total } = getTutorialProgress(value);
            const percentComplete = total > 0 ? (completed / total) * 100 : 0;

            return (
              <Link
                key={value}
                to={`/tutorials?category=${value}`}
                className="card p-4 flex items-center gap-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white">{label}</h3>
                    <span className="text-sm text-slate-400">
                      {completed} / {total}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{description}</p>
                  {/* Progress bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>
                {percentComplete === 100 && (
                  <CheckCircle className="text-green-500" size={24} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
