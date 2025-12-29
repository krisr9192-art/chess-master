import type { Square, Move, Color, PieceSymbol } from 'chess.js';

export type { Square, Move, Color, PieceSymbol };

export type GameMode = 'ai' | 'friend' | 'puzzle' | 'analysis' | 'tutorial';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
export type PlayerColor = 'white' | 'black' | 'random';

export interface GameState {
  fen: string;
  pgn: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  moveHistory: MoveInfo[];
  capturedPieces: CapturedPieces;
}

export interface MoveInfo {
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  color: Color;
}

export interface CapturedPieces {
  white: PieceSymbol[];
  black: PieceSymbol[];
}

export interface AIConfig {
  difficulty: Difficulty;
  depth: number;
  moveTime: number;
  skill: number;
}

export const AI_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: { difficulty: 'easy', depth: 2, moveTime: 500, skill: 3 },
  medium: { difficulty: 'medium', depth: 8, moveTime: 1000, skill: 10 },
  hard: { difficulty: 'hard', depth: 15, moveTime: 2000, skill: 17 },
  expert: { difficulty: 'expert', depth: 20, moveTime: 3000, skill: 20 },
};

export interface MultiplayerMessage {
  type: 'move' | 'chat' | 'rematch' | 'resign' | 'draw-offer' | 'draw-accept' | 'draw-decline' | 'sync';
  payload: unknown;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'opponent';
  timestamp: number;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  description?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: TutorialCategory;
  steps: TutorialStep[];
  completed?: boolean;
}

export type TutorialCategory = 'basics' | 'pieces' | 'tactics' | 'openings' | 'endgames' | 'checkmates' | 'strategy';

export interface TutorialStep {
  instruction: string;
  fen: string;
  highlightSquares?: Square[];
  arrows?: Arrow[];
  correctMove?: { from: Square; to: Square };
  explanation?: string;
}

export interface Arrow {
  from: Square;
  to: Square;
  color?: string;
}

export interface EngineEvaluation {
  depth: number;
  score: number; // in centipawns, positive = white advantage
  mate?: number; // moves to mate, positive = white mates
  bestMove: string;
  pv: string[]; // principal variation
}

export interface Settings {
  theme: 'dark' | 'light';
  boardTheme: 'classic' | 'blue' | 'green' | 'purple';
  pieceStyle: 'standard' | 'neo' | 'alpha';
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  autoQueen: boolean;
  premoveEnabled: boolean;
}

export interface UserProgress {
  tutorialsCompleted: string[];
  puzzlesSolved: string[];
  puzzleRating: number;
  gamesPlayed: number;
  gamesWon: number;
}
