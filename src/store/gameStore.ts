import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, UserProgress } from '../types';

interface GameStore {
  settings: Settings;
  progress: UserProgress;
  updateSettings: (settings: Partial<Settings>) => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  completeTutorial: (tutorialId: string) => void;
  solvePuzzle: (puzzleId: string, rating: number) => void;
  recordGame: (won: boolean) => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  boardTheme: 'classic',
  pieceStyle: 'standard',
  soundEnabled: true,
  showLegalMoves: true,
  showCoordinates: true,
  autoQueen: true,
  premoveEnabled: true,
};

const defaultProgress: UserProgress = {
  tutorialsCompleted: [],
  puzzlesSolved: [],
  puzzleRating: 1200,
  gamesPlayed: 0,
  gamesWon: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      progress: defaultProgress,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateProgress: (newProgress) =>
        set((state) => ({
          progress: { ...state.progress, ...newProgress },
        })),

      completeTutorial: (tutorialId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            tutorialsCompleted: state.progress.tutorialsCompleted.includes(tutorialId)
              ? state.progress.tutorialsCompleted
              : [...state.progress.tutorialsCompleted, tutorialId],
          },
        })),

      solvePuzzle: (puzzleId, puzzleRating) =>
        set((state) => {
          const alreadySolved = state.progress.puzzlesSolved.includes(puzzleId);
          const ratingChange = alreadySolved ? 0 : Math.round((puzzleRating - state.progress.puzzleRating) / 10);
          return {
            progress: {
              ...state.progress,
              puzzlesSolved: alreadySolved
                ? state.progress.puzzlesSolved
                : [...state.progress.puzzlesSolved, puzzleId],
              puzzleRating: state.progress.puzzleRating + ratingChange,
            },
          };
        }),

      recordGame: (won) =>
        set((state) => ({
          progress: {
            ...state.progress,
            gamesPlayed: state.progress.gamesPlayed + 1,
            gamesWon: won ? state.progress.gamesWon + 1 : state.progress.gamesWon,
          },
        })),
    }),
    {
      name: 'chess-app-storage',
    }
  )
);
