/**
 * ELO Rating System Utilities
 *
 * Standard ELO calculation for chess puzzle ratings.
 * K-factor varies based on player experience level.
 */

export interface RatingChange {
  oldRating: number;
  newRating: number;
  change: number;
  puzzleRating: number;
  result: 'correct' | 'incorrect' | 'hint';
}

/**
 * Calculate the expected score based on rating difference.
 * Uses the standard ELO formula: E = 1 / (1 + 10^((Rb - Ra) / 400))
 */
export function calculateExpectedScore(playerRating: number, puzzleRating: number): number {
  return 1 / (1 + Math.pow(10, (puzzleRating - playerRating) / 400));
}

/**
 * Get K-factor based on player's rating and experience.
 * - New players (< 30 games): K = 40 (fast adjustment)
 * - Intermediate (< 100 games): K = 32
 * - Experienced (>= 100 games): K = 24
 * - High rated (>= 2000): K = 16 (more stable)
 */
export function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;
  if (gamesPlayed < 100) return 32;
  if (rating >= 2000) return 16;
  return 24;
}

/**
 * Calculate new rating after solving a puzzle.
 *
 * @param playerRating - Current player rating
 * @param puzzleRating - Rating of the puzzle
 * @param result - Whether the puzzle was solved correctly
 * @param gamesPlayed - Total puzzles attempted (for K-factor)
 * @returns The new rating and change details
 */
export function calculateNewRating(
  playerRating: number,
  puzzleRating: number,
  result: 'correct' | 'incorrect' | 'hint',
  gamesPlayed: number
): RatingChange {
  const K = getKFactor(playerRating, gamesPlayed);
  const expectedScore = calculateExpectedScore(playerRating, puzzleRating);

  // Score: 1 for correct, 0 for incorrect, 0.3 for hint (partial credit)
  let actualScore: number;
  switch (result) {
    case 'correct':
      actualScore = 1;
      break;
    case 'hint':
      actualScore = 0.3;
      break;
    case 'incorrect':
      actualScore = 0;
      break;
  }

  const ratingChange = Math.round(K * (actualScore - expectedScore));
  const newRating = Math.max(100, playerRating + ratingChange); // Minimum rating of 100

  return {
    oldRating: playerRating,
    newRating,
    change: newRating - playerRating,
    puzzleRating,
    result,
  };
}

/**
 * Get a rating description based on the rating value.
 */
export function getRatingDescription(rating: number): string {
  if (rating < 600) return 'Beginner';
  if (rating < 800) return 'Novice';
  if (rating < 1000) return 'Intermediate';
  if (rating < 1200) return 'Club Player';
  if (rating < 1400) return 'Strong Club';
  if (rating < 1600) return 'Tournament Player';
  if (rating < 1800) return 'Expert';
  if (rating < 2000) return 'Candidate Master';
  if (rating < 2200) return 'Master';
  if (rating < 2400) return 'International Master';
  return 'Grandmaster';
}

/**
 * Get a color class for rating display.
 */
export function getRatingColor(rating: number): string {
  if (rating < 800) return 'text-gray-400';
  if (rating < 1000) return 'text-green-400';
  if (rating < 1200) return 'text-blue-400';
  if (rating < 1400) return 'text-purple-400';
  if (rating < 1600) return 'text-yellow-400';
  if (rating < 1800) return 'text-orange-400';
  if (rating < 2000) return 'text-red-400';
  if (rating < 2200) return 'text-pink-400';
  return 'text-amber-300';
}

/**
 * Calculate rating needed for next level.
 */
export function getNextMilestone(rating: number): { rating: number; title: string } {
  const milestones = [
    { rating: 600, title: 'Novice' },
    { rating: 800, title: 'Intermediate' },
    { rating: 1000, title: 'Club Player' },
    { rating: 1200, title: 'Strong Club' },
    { rating: 1400, title: 'Tournament Player' },
    { rating: 1600, title: 'Expert' },
    { rating: 1800, title: 'Candidate Master' },
    { rating: 2000, title: 'Master' },
    { rating: 2200, title: 'International Master' },
    { rating: 2400, title: 'Grandmaster' },
  ];

  for (const milestone of milestones) {
    if (rating < milestone.rating) {
      return milestone;
    }
  }

  return { rating: 2500, title: 'Super Grandmaster' };
}

/**
 * Format rating change with + or - prefix.
 */
export function formatRatingChange(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '0';
}

/**
 * Estimate puzzle difficulty category based on rating.
 */
export function getPuzzleDifficultyLabel(rating: number): string {
  if (rating < 700) return 'Easy';
  if (rating < 1000) return 'Medium';
  if (rating < 1300) return 'Hard';
  if (rating < 1600) return 'Very Hard';
  return 'Expert';
}
