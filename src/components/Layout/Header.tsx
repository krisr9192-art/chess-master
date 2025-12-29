import { Link, useLocation } from 'react-router-dom';
import { Crown, Bot, GraduationCap, BarChart3, Settings, Puzzle } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Crown },
  { path: '/play-ai', label: 'vs Computer', icon: Bot },
  { path: '/puzzles', label: 'Puzzles', icon: Puzzle },
  { path: '/learn', label: 'Learn', icon: GraduationCap },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Crown className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Chess 2025
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
