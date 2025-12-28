/**
 * Structured Training Plans
 *
 * Progressive curriculum for chess improvement from beginner to master level.
 */

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  type: 'puzzles' | 'patterns' | 'study' | 'practice' | 'lesson';
  link?: string; // Route to navigate to
  requiredCount?: number; // Number to complete
  themes?: string[]; // Specific puzzle themes
}

export interface TrainingDay {
  day: number;
  title: string;
  focus: string;
  tasks: TrainingTask[];
  estimatedMinutes: number;
}

export interface TrainingPlan {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  title: string;
  description: string;
  ratingRange: { min: number; max: number };
  durationWeeks: number;
  goals: string[];
  days: TrainingDay[];
}

export const trainingPlans: TrainingPlan[] = [
  // BEGINNER PLAN (0-1000)
  {
    id: 'beginner',
    level: 'beginner',
    title: 'Chess Foundations',
    description: 'Build a solid foundation with piece movement, basic tactics, and checkmate patterns.',
    ratingRange: { min: 0, max: 1000 },
    durationWeeks: 4,
    goals: [
      'Master all piece movements',
      'Learn basic checkmate patterns',
      'Understand piece values',
      'Recognize simple forks and pins',
      'Learn opening principles',
    ],
    days: [
      {
        day: 1,
        title: 'Piece Movement Mastery',
        focus: 'Understanding how each piece moves and captures',
        estimatedMinutes: 30,
        tasks: [
          { id: 'b1-1', title: 'Piece Movement Tutorial', description: 'Review how each piece moves', type: 'lesson', link: '/tutorials' },
          { id: 'b1-2', title: 'Beginner Puzzles', description: 'Solve 10 easy puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 10, themes: ['mateIn1'] },
        ],
      },
      {
        day: 2,
        title: 'Back Rank Mate',
        focus: 'Learn the most common checkmate pattern',
        estimatedMinutes: 25,
        tasks: [
          { id: 'b2-1', title: 'Back Rank Pattern', description: 'Study the back rank mate pattern', type: 'patterns', link: '/patterns' },
          { id: 'b2-2', title: 'Back Rank Puzzles', description: 'Practice 10 back rank puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 10, themes: ['backRankMate'] },
        ],
      },
      {
        day: 3,
        title: 'Forks',
        focus: 'Attack two pieces at once',
        estimatedMinutes: 30,
        tasks: [
          { id: 'b3-1', title: 'Fork Pattern', description: 'Learn about knight and other forks', type: 'patterns', link: '/patterns' },
          { id: 'b3-2', title: 'Fork Puzzles', description: 'Solve 15 fork puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15, themes: ['fork'] },
        ],
      },
      {
        day: 4,
        title: 'Pins',
        focus: 'Immobilize enemy pieces',
        estimatedMinutes: 30,
        tasks: [
          { id: 'b4-1', title: 'Pin Pattern', description: 'Study the pin pattern', type: 'patterns', link: '/patterns' },
          { id: 'b4-2', title: 'Pin Puzzles', description: 'Solve 15 pin puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15, themes: ['pin'] },
        ],
      },
      {
        day: 5,
        title: 'Mate in 1',
        focus: 'Find checkmate in one move',
        estimatedMinutes: 25,
        tasks: [
          { id: 'b5-1', title: 'Mate in 1 Puzzles', description: 'Solve 20 mate in 1 puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 20, themes: ['mateIn1'] },
        ],
      },
      {
        day: 6,
        title: 'Opening Principles',
        focus: 'Learn the fundamentals of the opening',
        estimatedMinutes: 35,
        tasks: [
          { id: 'b6-1', title: 'Opening Tutorial', description: 'Study opening principles', type: 'lesson', link: '/tutorials' },
          { id: 'b6-2', title: 'Practice Game', description: 'Play a game applying opening principles', type: 'practice', link: '/play-ai' },
        ],
      },
      {
        day: 7,
        title: 'Review Day',
        focus: 'Consolidate the weeks learning',
        estimatedMinutes: 30,
        tasks: [
          { id: 'b7-1', title: 'Mixed Puzzles', description: 'Solve 15 mixed puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15 },
          { id: 'b7-2', title: 'Master Game', description: 'Study the Opera Game', type: 'study', link: '/study' },
        ],
      },
    ],
  },

  // INTERMEDIATE PLAN (1000-1400)
  {
    id: 'intermediate',
    level: 'intermediate',
    title: 'Tactical Foundations',
    description: 'Develop tactical vision with combinations, basic endgames, and pattern recognition.',
    ratingRange: { min: 1000, max: 1400 },
    durationWeeks: 6,
    goals: [
      'Master two-move combinations',
      'Learn basic pawn endgames',
      'Recognize discovered attacks',
      'Understand skewers and deflection',
      'Study 5 master games',
    ],
    days: [
      {
        day: 1,
        title: 'Discovered Attacks',
        focus: 'Uncover hidden threats',
        estimatedMinutes: 35,
        tasks: [
          { id: 'i1-1', title: 'Discovered Attack Pattern', description: 'Study discovered attacks', type: 'patterns', link: '/patterns' },
          { id: 'i1-2', title: 'Discovery Puzzles', description: 'Solve 15 discovered attack puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15, themes: ['discoveredAttack'] },
        ],
      },
      {
        day: 2,
        title: 'Skewers',
        focus: 'The reverse pin',
        estimatedMinutes: 30,
        tasks: [
          { id: 'i2-1', title: 'Skewer Pattern', description: 'Learn the skewer pattern', type: 'patterns', link: '/patterns' },
          { id: 'i2-2', title: 'Skewer Puzzles', description: 'Solve 15 skewer puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15, themes: ['skewer'] },
        ],
      },
      {
        day: 3,
        title: 'Mate in 2',
        focus: 'Calculate two moves ahead',
        estimatedMinutes: 40,
        tasks: [
          { id: 'i3-1', title: 'Mate in 2 Puzzles', description: 'Solve 20 mate in 2 puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 20, themes: ['mateIn2'] },
        ],
      },
      {
        day: 4,
        title: 'King and Pawn Endgames',
        focus: 'Essential endgame knowledge',
        estimatedMinutes: 35,
        tasks: [
          { id: 'i4-1', title: 'Endgame Study', description: 'Study the King and Pawn endgame', type: 'study', link: '/study' },
          { id: 'i4-2', title: 'Endgame Puzzles', description: 'Solve 10 endgame puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 10, themes: ['endgame'] },
        ],
      },
      {
        day: 5,
        title: 'Combination Practice',
        focus: 'Put tactics together',
        estimatedMinutes: 40,
        tasks: [
          { id: 'i5-1', title: 'Mixed Tactics', description: 'Solve 25 varied tactical puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 25 },
        ],
      },
      {
        day: 6,
        title: 'Master Game Study',
        focus: 'Learn from the masters',
        estimatedMinutes: 45,
        tasks: [
          { id: 'i6-1', title: 'Immortal Game', description: 'Study the Immortal Game', type: 'study', link: '/study' },
          { id: 'i6-2', title: 'Themed Practice', description: 'Play against AI focusing on tactics', type: 'practice', link: '/play-ai' },
        ],
      },
      {
        day: 7,
        title: 'Review and Play',
        focus: 'Apply your knowledge',
        estimatedMinutes: 50,
        tasks: [
          { id: 'i7-1', title: 'Review Puzzles', description: 'Review puzzles from spaced repetition', type: 'puzzles', link: '/puzzles' },
          { id: 'i7-2', title: 'Rated Game', description: 'Play a serious game against AI', type: 'practice', link: '/play-ai' },
        ],
      },
    ],
  },

  // ADVANCED PLAN (1400-1800)
  {
    id: 'advanced',
    level: 'advanced',
    title: 'Strategic Mastery',
    description: 'Develop strategic understanding, complex tactics, and complete endgame knowledge.',
    ratingRange: { min: 1400, max: 1800 },
    durationWeeks: 8,
    goals: [
      'Master complex combinations',
      'Learn all basic endgames',
      'Understand positional concepts',
      'Develop calculation depth',
      'Build opening repertoire',
    ],
    days: [
      {
        day: 1,
        title: 'Complex Tactics',
        focus: 'Multi-move combinations',
        estimatedMinutes: 45,
        tasks: [
          { id: 'a1-1', title: 'Hard Puzzles', description: 'Solve 20 hard rated puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 20 },
          { id: 'a1-2', title: 'Pattern Review', description: 'Review smothered mate pattern', type: 'patterns', link: '/patterns' },
        ],
      },
      {
        day: 2,
        title: 'Anastasias Mate',
        focus: 'Advanced mating patterns',
        estimatedMinutes: 40,
        tasks: [
          { id: 'a2-1', title: 'Anastasias Pattern', description: 'Study Anastasias Mate', type: 'patterns', link: '/patterns' },
          { id: 'a2-2', title: 'Pattern Practice', description: 'Practice the pattern', type: 'puzzles', link: '/puzzles', requiredCount: 15 },
        ],
      },
      {
        day: 3,
        title: 'Master Game Analysis',
        focus: 'Learn from Kasparov',
        estimatedMinutes: 50,
        tasks: [
          { id: 'a3-1', title: 'Kasparovs Immortal', description: 'Study Kasparov vs Topalov 1999', type: 'study', link: '/study' },
          { id: 'a3-2', title: 'Analysis Mode', description: 'Analyze critical positions', type: 'practice', link: '/analysis' },
        ],
      },
      {
        day: 4,
        title: 'Rook Endgames',
        focus: 'The most common endgame',
        estimatedMinutes: 45,
        tasks: [
          { id: 'a4-1', title: 'Rook Endgame Study', description: 'Study basic rook endgame principles', type: 'lesson', link: '/tutorials' },
          { id: 'a4-2', title: 'Endgame Puzzles', description: 'Practice rook endgames', type: 'puzzles', link: '/puzzles', requiredCount: 15, themes: ['endgame'] },
        ],
      },
      {
        day: 5,
        title: 'Calculation Training',
        focus: 'Deep calculation practice',
        estimatedMinutes: 50,
        tasks: [
          { id: 'a5-1', title: 'Calculation Puzzles', description: 'Solve 25 puzzles without moving pieces', type: 'puzzles', link: '/puzzles', requiredCount: 25 },
        ],
      },
      {
        day: 6,
        title: 'Greek Gift Sacrifice',
        focus: 'Classic attacking pattern',
        estimatedMinutes: 45,
        tasks: [
          { id: 'a6-1', title: 'Greek Gift Pattern', description: 'Master the Bxh7+ sacrifice', type: 'patterns', link: '/patterns' },
          { id: 'a6-2', title: 'Attack Practice', description: 'Practice attacking positions', type: 'puzzles', link: '/puzzles', requiredCount: 15 },
        ],
      },
      {
        day: 7,
        title: 'Complete Review',
        focus: 'Weekly consolidation',
        estimatedMinutes: 60,
        tasks: [
          { id: 'a7-1', title: 'Spaced Review', description: 'Review failed puzzles', type: 'puzzles', link: '/puzzles' },
          { id: 'a7-2', title: 'Serious Game', description: 'Play a rated game', type: 'practice', link: '/play-ai' },
          { id: 'a7-3', title: 'Analyze', description: 'Analyze your game', type: 'practice', link: '/analysis' },
        ],
      },
    ],
  },

  // EXPERT PLAN (1800-2200)
  {
    id: 'expert',
    level: 'expert',
    title: 'Master Preparation',
    description: 'Refined training for achieving master-level play with deep study and serious practice.',
    ratingRange: { min: 1800, max: 2200 },
    durationWeeks: 12,
    goals: [
      'Achieve calculation depth of 5+ moves',
      'Master all checkmate patterns',
      'Develop complete opening repertoire',
      'Perfect endgame technique',
      'Study 20+ master games',
    ],
    days: [
      {
        day: 1,
        title: 'Deep Calculation',
        focus: 'Calculate without moving pieces',
        estimatedMinutes: 60,
        tasks: [
          { id: 'e1-1', title: 'Blindfold Puzzles', description: 'Solve 20 puzzles visualizing only', type: 'puzzles', link: '/puzzles', requiredCount: 20 },
          { id: 'e1-2', title: 'Very Hard Puzzles', description: 'Solve 10 expert-rated puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 10 },
        ],
      },
      {
        day: 2,
        title: 'Fischer Study',
        focus: 'Learn from Bobby Fischer',
        estimatedMinutes: 55,
        tasks: [
          { id: 'e2-1', title: 'Game of the Century', description: 'Deep study of Fischer vs Byrne', type: 'study', link: '/study' },
          { id: 'e2-2', title: 'Combination Practice', description: 'Practice Fischer-style tactics', type: 'puzzles', link: '/puzzles', requiredCount: 15 },
        ],
      },
      {
        day: 3,
        title: 'All Patterns',
        focus: 'Pattern recognition speed',
        estimatedMinutes: 50,
        tasks: [
          { id: 'e3-1', title: 'Timed Patterns', description: 'Complete all patterns quickly', type: 'patterns', link: '/patterns' },
          { id: 'e3-2', title: 'Pattern Puzzles', description: 'Apply patterns in puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 25 },
        ],
      },
      {
        day: 4,
        title: 'Complex Endgames',
        focus: 'Queen vs Rook, minor piece endgames',
        estimatedMinutes: 55,
        tasks: [
          { id: 'e4-1', title: 'Endgame Mastery', description: 'Study complex endgame positions', type: 'lesson', link: '/tutorials' },
          { id: 'e4-2', title: 'Endgame Practice', description: 'Practice endgame technique', type: 'puzzles', link: '/puzzles', requiredCount: 20, themes: ['endgame'] },
        ],
      },
      {
        day: 5,
        title: 'Opening Preparation',
        focus: 'Deep opening study',
        estimatedMinutes: 60,
        tasks: [
          { id: 'e5-1', title: 'Opening Analysis', description: 'Analyze opening lines with engine', type: 'practice', link: '/analysis' },
          { id: 'e5-2', title: 'Practice Games', description: 'Test opening preparation', type: 'practice', link: '/play-ai' },
        ],
      },
      {
        day: 6,
        title: 'Positional Play',
        focus: 'Strategic understanding',
        estimatedMinutes: 55,
        tasks: [
          { id: 'e6-1', title: 'Positional Study', description: 'Study a positional master game', type: 'study', link: '/study' },
          { id: 'e6-2', title: 'Strategic Puzzles', description: 'Solve positional puzzles', type: 'puzzles', link: '/puzzles', requiredCount: 15 },
        ],
      },
      {
        day: 7,
        title: 'Tournament Simulation',
        focus: 'Serious practice',
        estimatedMinutes: 90,
        tasks: [
          { id: 'e7-1', title: 'Serious Game', description: 'Play a full game at highest difficulty', type: 'practice', link: '/play-ai' },
          { id: 'e7-2', title: 'Deep Analysis', description: 'Thoroughly analyze the game', type: 'practice', link: '/analysis' },
          { id: 'e7-3', title: 'Weakness Review', description: 'Review weak areas in dashboard', type: 'lesson', link: '/dashboard' },
        ],
      },
    ],
  },
];

export function getPlanForRating(rating: number): TrainingPlan {
  if (rating < 1000) return trainingPlans.find(p => p.id === 'beginner')!;
  if (rating < 1400) return trainingPlans.find(p => p.id === 'intermediate')!;
  if (rating < 1800) return trainingPlans.find(p => p.id === 'advanced')!;
  return trainingPlans.find(p => p.id === 'expert')!;
}

export function getPlanById(id: string): TrainingPlan | undefined {
  return trainingPlans.find(p => p.id === id);
}
