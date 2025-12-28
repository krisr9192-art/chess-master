import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the SuperMemo SM-2 algorithm for optimal learning retention.
 * Puzzles that are failed come back sooner; puzzles solved correctly
 * are spaced out further apart.
 */

export interface PuzzleReview {
  puzzleId: string;
  puzzleRating: number;
  themes: string[];
  easeFactor: number; // 1.3 to 2.5 (default 2.5)
  interval: number; // days until next review
  nextReview: number; // timestamp
  repetitions: number; // successful reviews in a row
  lastResult: 'correct' | 'incorrect' | 'hint';
  lastReviewed: number; // timestamp
  timesReviewed: number;
  timesCorrect: number;
}

interface SpacedRepetitionState {
  // All puzzles that have been attempted and need review
  reviewQueue: Record<string, PuzzleReview>;

  // Actions
  recordAttempt: (
    puzzleId: string,
    puzzleRating: number,
    themes: string[],
    result: 'correct' | 'incorrect' | 'hint'
  ) => void;

  // Get puzzles due for review (sorted by priority)
  getDueReviews: () => PuzzleReview[];

  // Get count of puzzles due
  getDueCount: () => number;

  // Get next puzzle to review
  getNextReview: () => PuzzleReview | null;

  // Check if a specific puzzle is due for review
  isPuzzleDue: (puzzleId: string) => boolean;

  // Get stats
  getReviewStats: () => {
    total: number;
    due: number;
    mastered: number; // interval > 21 days
    learning: number; // interval <= 21 days
  };

  // Clear all review data
  clearReviews: () => void;
}

// SM-2 constants
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const FIRST_INTERVAL = 1; // 1 day
const SECOND_INTERVAL = 6; // 6 days

/**
 * Calculate the new interval and ease factor based on performance.
 * Quality ratings:
 * - correct: 5 (perfect response)
 * - hint: 3 (correct with difficulty)
 * - incorrect: 0 (complete failure)
 */
function calculateSM2(
  currentEase: number,
  currentInterval: number,
  repetitions: number,
  result: 'correct' | 'incorrect' | 'hint'
): { newEase: number; newInterval: number; newReps: number } {
  // Map result to quality (0-5 scale)
  let quality: number;
  switch (result) {
    case 'correct':
      quality = 5;
      break;
    case 'hint':
      quality = 3;
      break;
    case 'incorrect':
      quality = 0;
      break;
  }

  // If quality < 3, reset repetitions (failed recall)
  if (quality < 3) {
    return {
      newEase: Math.max(MIN_EASE_FACTOR, currentEase - 0.2),
      newInterval: FIRST_INTERVAL, // Reset to 1 day
      newReps: 0,
    };
  }

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEase = Math.max(
    MIN_EASE_FACTOR,
    currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval
  let newInterval: number;
  const newReps = repetitions + 1;

  if (newReps === 1) {
    newInterval = FIRST_INTERVAL;
  } else if (newReps === 2) {
    newInterval = SECOND_INTERVAL;
  } else {
    newInterval = Math.round(currentInterval * newEase);
  }

  // Reduce interval for hint usage
  if (result === 'hint') {
    newInterval = Math.max(FIRST_INTERVAL, Math.round(newInterval * 0.6));
  }

  return { newEase, newInterval, newReps };
}

export const useSpacedRepetitionStore = create<SpacedRepetitionState>()(
  persist(
    (set, get) => ({
      reviewQueue: {},

      recordAttempt: (puzzleId, puzzleRating, themes, result) => {
        const state = get();
        const now = Date.now();
        const existing = state.reviewQueue[puzzleId];

        if (existing) {
          // Update existing review data
          const { newEase, newInterval, newReps } = calculateSM2(
            existing.easeFactor,
            existing.interval,
            existing.repetitions,
            result
          );

          const nextReview = now + newInterval * 24 * 60 * 60 * 1000; // Convert days to ms

          set({
            reviewQueue: {
              ...state.reviewQueue,
              [puzzleId]: {
                ...existing,
                easeFactor: newEase,
                interval: newInterval,
                nextReview,
                repetitions: newReps,
                lastResult: result,
                lastReviewed: now,
                timesReviewed: existing.timesReviewed + 1,
                timesCorrect: result === 'correct' ? existing.timesCorrect + 1 : existing.timesCorrect,
              },
            },
          });
        } else {
          // First attempt at this puzzle
          const { newEase, newInterval, newReps } = calculateSM2(
            DEFAULT_EASE_FACTOR,
            0,
            0,
            result
          );

          const nextReview = now + newInterval * 24 * 60 * 60 * 1000;

          set({
            reviewQueue: {
              ...state.reviewQueue,
              [puzzleId]: {
                puzzleId,
                puzzleRating,
                themes,
                easeFactor: newEase,
                interval: newInterval,
                nextReview,
                repetitions: newReps,
                lastResult: result,
                lastReviewed: now,
                timesReviewed: 1,
                timesCorrect: result === 'correct' ? 1 : 0,
              },
            },
          });
        }
      },

      getDueReviews: () => {
        const state = get();
        const now = Date.now();

        return Object.values(state.reviewQueue)
          .filter((review) => review.nextReview <= now)
          .sort((a, b) => {
            // Priority order:
            // 1. Failed puzzles first (shorter intervals)
            // 2. Then by how overdue they are
            if (a.lastResult === 'incorrect' && b.lastResult !== 'incorrect') return -1;
            if (b.lastResult === 'incorrect' && a.lastResult !== 'incorrect') return 1;
            return a.nextReview - b.nextReview;
          });
      },

      getDueCount: () => {
        const state = get();
        const now = Date.now();
        return Object.values(state.reviewQueue).filter(
          (review) => review.nextReview <= now
        ).length;
      },

      getNextReview: () => {
        const dueReviews = get().getDueReviews();
        return dueReviews.length > 0 ? dueReviews[0] : null;
      },

      isPuzzleDue: (puzzleId) => {
        const state = get();
        const review = state.reviewQueue[puzzleId];
        if (!review) return false;
        return review.nextReview <= Date.now();
      },

      getReviewStats: () => {
        const state = get();
        const now = Date.now();
        const reviews = Object.values(state.reviewQueue);

        const due = reviews.filter((r) => r.nextReview <= now).length;
        const mastered = reviews.filter((r) => r.interval > 21).length;
        const learning = reviews.filter((r) => r.interval <= 21).length;

        return {
          total: reviews.length,
          due,
          mastered,
          learning,
        };
      },

      clearReviews: () => {
        set({ reviewQueue: {} });
      },
    }),
    {
      name: 'chess-spaced-repetition-storage',
    }
  )
);
