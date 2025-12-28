import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useRatingStore } from '../store/ratingStore';
import { useSpacedRepetitionStore } from '../store/spacedRepetitionStore';
import {
  Settings as SettingsIcon,
  ChevronLeft,
  Volume2,
  VolumeX,
  Eye,
  Palette,
  Trash2,
} from 'lucide-react';

const boardThemes = [
  { value: 'classic', label: 'Classic', colors: ['#f0d9b5', '#b58863'] },
  { value: 'blue', label: 'Blue', colors: ['#dee3e6', '#8ca2ad'] },
  { value: 'green', label: 'Green', colors: ['#ffffdd', '#86a666'] },
  { value: 'purple', label: 'Purple', colors: ['#e8e0f0', '#9b7bb8'] },
];

export function Settings() {
  const { settings, updateSettings, progress, updateProgress } = useGameStore();
  const { resetRating } = useRatingStore();
  const { clearReviews } = useSpacedRepetitionStore();

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      updateProgress({
        tutorialsCompleted: [],
        puzzlesSolved: [],
        puzzleRating: 1200,
        gamesPlayed: 0,
        gamesWon: 0,
      });
      resetRating();
      clearReviews();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <SettingsIcon className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Sound
            </h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Enable sound effects</span>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Board Theme */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette size={20} />
              Board Theme
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {boardThemes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ boardTheme: theme.value as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.boardTheme === theme.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors[0] }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.colors[1] }}
                    />
                  </div>
                  <span className="text-sm text-white">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye size={20} />
              Display
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Show legal move hints</span>
                <button
                  onClick={() => updateSettings({ showLegalMoves: !settings.showLegalMoves })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.showLegalMoves ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.showLegalMoves ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Show board coordinates</span>
                <button
                  onClick={() => updateSettings({ showCoordinates: !settings.showCoordinates })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.showCoordinates ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.showCoordinates ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Auto-promote to Queen</span>
                <button
                  onClick={() => updateSettings({ autoQueen: !settings.autoQueen })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.autoQueen ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoQueen ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{progress.gamesPlayed}</div>
                <div className="text-sm text-slate-400">Games Played</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{progress.gamesWon}</div>
                <div className="text-sm text-slate-400">Games Won</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{progress.puzzlesSolved.length}</div>
                <div className="text-sm text-slate-400">Puzzles Solved</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{progress.tutorialsCompleted.length}</div>
                <div className="text-sm text-slate-400">Tutorials Done</div>
              </div>
            </div>

            <button
              onClick={resetProgress}
              className="btn btn-danger w-full flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Reset All Progress
            </button>
          </div>

          {/* About */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">About</h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p><strong className="text-white">Chess 2025</strong> - A modern chess application</p>
              <p>Built with React, TypeScript, and Tailwind CSS</p>
              <p>Chess engine powered by Stockfish</p>
              <p>Multiplayer via WebRTC (PeerJS)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
