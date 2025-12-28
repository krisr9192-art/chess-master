import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateNewRating, type RatingChange } from '../utils/rating';

interface RatingHistoryEntry {
  date: string;
  rating: number;
  puzzleId: string;
  puzzleRating: number;
  result: 'correct' | 'incorrect' | 'hint';
  change: number;
}

interface ThemePerformance {
  attempts: number;
  correct: number;
  accuracy: number;
}

interface RatingState {
  // Core rating data
  rating: number;
  peakRating: number;
  puzzlesSolved: number;
  puzzlesAttempted: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string | null;

  // Rating history for charts
  ratingHistory: RatingHistoryEntry[];

  // Performance by theme
  themePerformance: Record<string, ThemePerformance>;

  // Recent results for trend analysis
  recentResults: ('correct' | 'incorrect' | 'hint')[];

  // Actions
  recordPuzzleAttempt: (
    puzzleId: string,
    puzzleRating: number,
    puzzleThemes: string[],
    result: 'correct' | 'incorrect' | 'hint'
  ) => RatingChange;
  resetRating: () => void;
  getAccuracy: () => number;
  getTrendDirection: () => 'up' | 'down' | 'stable';
  getThemeWeaknesses: () => string[];
  getThemeStrengths: () => string[];
}

const INITIAL_RATING = 1200;
const MAX_HISTORY_ENTRIES = 1000;
const MAX_RECENT_RESULTS = 20;

export const useRatingStore = create<RatingState>()(
  persist(
    (set, get) => ({
      rating: INITIAL_RATING,
      peakRating: INITIAL_RATING,
      puzzlesSolved: 0,
      puzzlesAttempted: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayed: null,
      ratingHistory: [],
      themePerformance: {},
      recentResults: [],

      recordPuzzleAttempt: (puzzleId, puzzleRating, puzzleThemes, result) => {
        const state = get();
        const ratingChange = calculateNewRating(
          state.rating,
          puzzleRating,
          result,
          state.puzzlesAttempted
        );

        const today = new Date().toISOString().split('T')[0];
        const historyEntry: RatingHistoryEntry = {
          date: today,
          rating: ratingChange.newRating,
          puzzleId,
          puzzleRating,
          result,
          change: ratingChange.change,
        };

        // Update theme performance
        const newThemePerformance = { ...state.themePerformance };
        puzzleThemes.forEach((theme) => {
          if (!newThemePerformance[theme]) {
            newThemePerformance[theme] = { attempts: 0, correct: 0, accuracy: 0 };
          }
          newThemePerformance[theme].attempts += 1;
          if (result === 'correct') {
            newThemePerformance[theme].correct += 1;
          }
          newThemePerformance[theme].accuracy =
            (newThemePerformance[theme].correct / newThemePerformance[theme].attempts) * 100;
        });

        // Update streak
        let newStreak = state.currentStreak;
        if (result === 'correct') {
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        // Update recent results
        const newRecentResults = [...state.recentResults, result].slice(-MAX_RECENT_RESULTS);

        set({
          rating: ratingChange.newRating,
          peakRating: Math.max(state.peakRating, ratingChange.newRating),
          puzzlesSolved: result === 'correct' ? state.puzzlesSolved + 1 : state.puzzlesSolved,
          puzzlesAttempted: state.puzzlesAttempted + 1,
          currentStreak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          lastPlayed: today,
          ratingHistory: [...state.ratingHistory, historyEntry].slice(-MAX_HISTORY_ENTRIES),
          themePerformance: newThemePerformance,
          recentResults: newRecentResults,
        });

        return ratingChange;
      },

      resetRating: () => {
        set({
          rating: INITIAL_RATING,
          peakRating: INITIAL_RATING,
          puzzlesSolved: 0,
          puzzlesAttempted: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastPlayed: null,
          ratingHistory: [],
          themePerformance: {},
          recentResults: [],
        });
      },

      getAccuracy: () => {
        const state = get();
        if (state.puzzlesAttempted === 0) return 0;
        return (state.puzzlesSolved / state.puzzlesAttempted) * 100;
      },

      getTrendDirection: () => {
        const state = get();
        if (state.recentResults.length < 5) return 'stable';

        const recentCorrect = state.recentResults
          .slice(-10)
          .filter((r) => r === 'correct').length;
        const olderCorrect = state.recentResults
          .slice(-20, -10)
          .filter((r) => r === 'correct').length;

        if (state.recentResults.length < 10) {
          // Not enough history, use just recent performance
          if (recentCorrect >= 7) return 'up';
          if (recentCorrect <= 3) return 'down';
          return 'stable';
        }

        if (recentCorrect > olderCorrect + 2) return 'up';
        if (recentCorrect < olderCorrect - 2) return 'down';
        return 'stable';
      },

      getThemeWeaknesses: () => {
        const state = get();
        const themes = Object.entries(state.themePerformance)
          .filter(([, perf]) => perf.attempts >= 5) // Minimum sample size
          .sort((a, b) => a[1].accuracy - b[1].accuracy)
          .slice(0, 3)
          .filter(([, perf]) => perf.accuracy < 60) // Only themes below 60% accuracy
          .map(([theme]) => theme);
        return themes;
      },

      getThemeStrengths: () => {
        const state = get();
        const themes = Object.entries(state.themePerformance)
          .filter(([, perf]) => perf.attempts >= 5) // Minimum sample size
          .sort((a, b) => b[1].accuracy - a[1].accuracy)
          .slice(0, 3)
          .filter(([, perf]) => perf.accuracy >= 70) // Only themes above 70% accuracy
          .map(([theme]) => theme);
        return themes;
      },
    }),
    {
      name: 'chess-rating-storage',
    }
  )
);
