import { Link } from 'react-router-dom';
import { Bot, Users, GraduationCap, Puzzle, BarChart3, Trophy, Zap, Target, TrendingUp, Brain, BookOpen, Calendar } from 'lucide-react';
import { useRatingStore } from '../store/ratingStore';
import { useGameStore } from '../store/gameStore';
import { getRatingColor } from '../utils/rating';

const gameModes = [
  {
    path: '/play-ai',
    title: 'Play vs Computer',
    description: 'Challenge our AI powered by Stockfish engine. Choose from 4 difficulty levels.',
    icon: Bot,
    gradient: 'from-blue-600 to-blue-800',
    features: ['4 Difficulty Levels', 'Instant Analysis', 'Take Back Moves'],
  },
  {
    path: '/play-friend',
    title: 'Play with Friends',
    description: 'Play online with friends anywhere in the world. Share a link and start playing!',
    icon: Users,
    gradient: 'from-green-600 to-green-800',
    features: ['Online Multiplayer', 'Share Link', 'Real-time Play'],
  },
  {
    path: '/learn',
    title: 'Learn Chess',
    description: 'Master chess with interactive tutorials covering rules, tactics, and strategy.',
    icon: GraduationCap,
    gradient: 'from-purple-600 to-purple-800',
    features: ['Interactive Lessons', 'Step-by-Step', 'Progress Tracking'],
  },
  {
    path: '/puzzles',
    title: 'Solve Puzzles',
    description: 'Sharpen your tactical skills with chess puzzles of varying difficulty.',
    icon: Puzzle,
    gradient: 'from-orange-600 to-orange-800',
    features: ['1000+ Puzzles', 'Hints Available', 'Rating System'],
  },
  {
    path: '/analysis',
    title: 'Analysis Board',
    description: 'Analyze your games with engine evaluation and explore different lines.',
    icon: BarChart3,
    gradient: 'from-cyan-600 to-cyan-800',
    features: ['Engine Evaluation', 'Move Suggestions', 'Import PGN'],
  },
  {
    path: '/dashboard',
    title: 'Progress Dashboard',
    description: 'Track your improvement with detailed analytics, rating history, and insights.',
    icon: TrendingUp,
    gradient: 'from-indigo-600 to-indigo-800',
    features: ['Rating History', 'Theme Analysis', 'Strengths & Weaknesses'],
  },
  {
    path: '/patterns',
    title: 'Pattern Training',
    description: 'Master essential checkmate patterns and tactical motifs used by masters.',
    icon: Brain,
    gradient: 'from-pink-600 to-pink-800',
    features: ['10+ Patterns', 'Visual Learning', 'Practice Drills'],
  },
  {
    path: '/study',
    title: 'Master Games',
    description: 'Study famous games from chess history with move-by-move annotations.',
    icon: BookOpen,
    gradient: 'from-amber-600 to-amber-800',
    features: ['Famous Games', 'Annotations', 'Guess the Move'],
  },
  {
    path: '/training',
    title: 'Training Plans',
    description: 'Follow structured training programs designed to reach your chess goals.',
    icon: Calendar,
    gradient: 'from-teal-600 to-teal-800',
    features: ['4 Skill Levels', 'Daily Tasks', 'Track Progress'],
  },
];

export function Home() {
  const { rating, puzzlesSolved } = useRatingStore();
  const { progress } = useGameStore();

  const stats = [
    { icon: Trophy, label: 'Games Played', value: progress.gamesPlayed.toString(), color: 'text-yellow-400' },
    { icon: Target, label: 'Puzzles Solved', value: puzzlesSolved.toString(), color: 'text-green-400' },
    { icon: Zap, label: 'Puzzle Rating', value: rating.toString(), color: getRatingColor(rating) },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Chess 2025
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Play, learn, and master chess with our modern chess platform.
            Challenge the AI, play with friends, or improve your skills with puzzles and tutorials.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-6 mb-12">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <Link
              key={label}
              to="/dashboard"
              className="card px-6 py-4 flex items-center gap-3 hover:border-blue-500 transition-colors"
            >
              <Icon className={color} size={24} />
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Game Modes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map(({ path, title, description, icon: Icon, gradient, features }) => (
            <Link
              key={path}
              to={path}
              className="group mode-card block"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {description}
              </p>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Built with React, TypeScript, and Stockfish Engine</p>
          <p className="mt-1">No account required. All progress saved locally.</p>
        </div>
      </div>
    </div>
  );
}
