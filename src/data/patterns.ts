/**
 * Chess Pattern Training Database
 *
 * Common tactical patterns that every chess master must recognize instantly.
 * Each pattern includes visual explanation, example positions, and key moves.
 */

export interface PatternExample {
  id: string;
  fen: string;
  solution: string[]; // moves in UCI format
  hint: string;
}

export interface ChessPattern {
  id: string;
  name: string;
  description: string;
  explanation: string;
  keyFeatures: string[];
  examples: PatternExample[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const patterns: ChessPattern[] = [
  // BACK RANK MATE
  {
    id: 'back-rank-mate',
    name: 'Back Rank Mate',
    description: 'Checkmate delivered on the first or eighth rank when the king is trapped by its own pieces.',
    explanation: 'The back rank mate occurs when a rook or queen delivers checkmate along the back rank (1st or 8th rank) while the enemy king is trapped by its own pawns. This pattern emphasizes the importance of creating "luft" (breathing room) for your king.',
    keyFeatures: [
      'King trapped behind pawns on back rank',
      'No escape squares for the king',
      'Rook or queen delivers the final blow',
      'Often requires removing defenders first',
    ],
    difficulty: 'beginner',
    examples: [
      { id: 'br1', fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', solution: ['a1a8'], hint: 'The rook can deliver mate in one move' },
      { id: 'br2', fen: '3r2k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', solution: ['a1a8'], hint: 'Ignore the threat and strike first' },
      { id: 'br3', fen: 'r5k1/5ppp/8/8/8/8/8/4RK2 w - - 0 1', solution: ['e1e8'], hint: 'Move the rook to the back rank' },
      { id: 'br4', fen: '5rk1/5ppp/8/1Q6/8/8/8/6K1 w - - 0 1', solution: ['b5b8'], hint: 'The queen can reach the back rank' },
      { id: 'br5', fen: '6k1/4Rppp/8/8/8/8/8/6K1 w - - 0 1', solution: ['e7e8'], hint: 'Push the rook to the eighth rank' },
      { id: 'br6', fen: '3qr1k1/5ppp/8/8/8/8/5PPP/3QR1K1 w - - 0 1', solution: ['e1e8', 'd8e8', 'd1e1'], hint: 'Exchange rooks, then deliver mate' },
      { id: 'br7', fen: 'r4rk1/5ppp/8/8/8/8/Q4PPP/5RK1 w - - 0 1', solution: ['a2a8'], hint: 'The queen can attack the back rank' },
      { id: 'br8', fen: '4r1k1/5ppp/8/8/8/8/5PPP/1R2R1K1 w - - 0 1', solution: ['e1e8', 'e8b8', 'b1b8'], hint: 'Double rooks on the back rank' },
      { id: 'br9', fen: '2r3k1/5ppp/8/8/8/8/5PPP/R1R3K1 w - - 0 1', solution: ['c1c8', 'c8a8', 'a1a8'], hint: 'Force the rook off, then mate' },
      { id: 'br10', fen: 'r5k1/5pp1/7p/8/8/8/8/3R2K1 w - - 0 1', solution: ['d1d8', 'd8a8'], hint: 'Rook to the 8th rank threatens mate' },
    ],
  },

  // SMOTHERED MATE
  {
    id: 'smothered-mate',
    name: 'Smothered Mate',
    description: 'A checkmate delivered by a knight where the enemy king is trapped by its own pieces.',
    explanation: 'The smothered mate is a beautiful pattern where the knight delivers checkmate because the king is surrounded (smothered) by its own pieces. The classic pattern often involves sacrificing the queen to force the king into the corner.',
    keyFeatures: [
      'Knight delivers checkmate',
      'King is completely surrounded by own pieces',
      'Often involves queen sacrifice',
      'Classic corner pattern: king on h8/a8, rook on g8/b8',
    ],
    difficulty: 'intermediate',
    examples: [
      { id: 'sm1', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', solution: ['g5f7', 'h8g8', 'f7h6'], hint: 'Knight checks, forcing king to corner, then smothers' },
      { id: 'sm2', fen: 'r4rk1/5Npp/8/8/8/8/8/R5K1 w - - 0 1', solution: ['f7h6', 'g8h8', 'a1a8', 'f8a8', 'h6f7'], hint: 'Check, remove defender, then smother' },
      { id: 'sm3', fen: '5rk1/5ppp/8/8/4N3/8/8/R5K1 w - - 0 1', solution: ['e4f6', 'g7f6', 'a1a8'], hint: 'Knight sacrifice opens back rank' },
      { id: 'sm4', fen: 'r1b2rk1/1p3ppp/8/3NN3/8/8/8/R5K1 w - - 0 1', solution: ['e5f7', 'f8f7', 'd5e7'], hint: 'Double knight attack pattern' },
      { id: 'sm5', fen: '5rk1/4Nppp/8/8/8/8/8/4Q1K1 w - - 0 1', solution: ['e1e8', 'f8e8', 'e7f5'], hint: 'Queen sacrifice sets up the smother' },
      { id: 'sm6', fen: '6k1/5ppp/8/8/8/5N2/5PPP/6K1 w - - 0 1', solution: ['f3e5'], hint: 'Knight centralizes with threats' },
      { id: 'sm7', fen: 'r4r1k/6pp/8/5N2/8/8/Q5PP/6K1 w - - 0 1', solution: ['f5g7'], hint: 'Knight delivers immediate smother' },
      { id: 'sm8', fen: '5rrk/6pp/6N1/8/8/8/Q5PP/6K1 w - - 0 1', solution: ['a2g8', 'f8g8', 'g6h6'], hint: 'Queen sac forces smother' },
      { id: 'sm9', fen: 'r1bq1r1k/pppp2pp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQR1K1 w - - 0 1', solution: ['g5f7'], hint: 'The classic knight fork threatens smother' },
      { id: 'sm10', fen: '5k2/8/8/8/8/8/4N3/4K3 w - - 0 1', solution: ['e2d4', 'f8e8', 'd4f5'], hint: 'Maneuver knight for control' },
    ],
  },

  // ARABIAN MATE
  {
    id: 'arabian-mate',
    name: 'Arabian Mate',
    description: 'A checkmate pattern using a rook and knight working together in a corner.',
    explanation: 'The Arabian Mate is one of the oldest known checkmate patterns. The rook delivers checkmate on the edge of the board while the knight controls the escape squares. The knight typically sits two squares diagonally from the mated king.',
    keyFeatures: [
      'Rook delivers the final check',
      'Knight covers key escape squares',
      'King is typically in the corner',
      'Knight is two squares diagonally from king',
    ],
    difficulty: 'intermediate',
    examples: [
      { id: 'ar1', fen: '7k/8/5N2/8/8/8/8/R6K w - - 0 1', solution: ['a1a8'], hint: 'Rook to the back rank, knight guards g8' },
      { id: 'ar2', fen: 'k7/8/2N5/8/8/8/8/R6K w - - 0 1', solution: ['a1a8'], hint: 'Mirror image on the queenside' },
      { id: 'ar3', fen: '5k2/8/4N3/8/8/8/8/4R2K w - - 0 1', solution: ['e1e8'], hint: 'Force king to corner first' },
      { id: 'ar4', fen: '6k1/8/5N2/8/8/8/8/4R2K w - - 0 1', solution: ['e1e8', 'g8h7', 'e8h8'], hint: 'Chase king to corner' },
      { id: 'ar5', fen: '7k/5N2/8/8/8/8/8/R6K w - - 0 1', solution: ['a1a8'], hint: 'Knight already in position' },
      { id: 'ar6', fen: 'R5k1/5ppp/8/8/4N3/8/8/6K1 w - - 0 1', solution: ['e4f6', 'g7f6', 'a8a1'], hint: 'Knight sacrifice opens lines' },
      { id: 'ar7', fen: '7k/7R/5N2/8/8/8/8/6K1 w - - 0 1', solution: ['h7h8'], hint: 'Rook slides down for mate' },
      { id: 'ar8', fen: '7k/8/8/8/4N3/8/8/6RK w - - 0 1', solution: ['g1g8', 'h8h7', 'e4f6'], hint: 'Rook check forces knight mate' },
      { id: 'ar9', fen: '6k1/5p2/5N1p/8/8/8/8/R6K w - - 0 1', solution: ['a1a8', 'g8h7', 'a8h8'], hint: 'Despite pawns, pattern works' },
      { id: 'ar10', fen: 'R4rk1/5ppp/5N2/8/8/8/8/6K1 w - - 0 1', solution: ['a8f8', 'g8f8', 'f6e8'], hint: 'Exchange then deliver mate' },
    ],
  },

  // ANASTASIA'S MATE
  {
    id: 'anastasias-mate',
    name: "Anastasia's Mate",
    description: 'A checkmate pattern using a knight and rook where the king is trapped by its own pawn.',
    explanation: "Anastasia's Mate typically occurs when the enemy king is on h7/h2 (or a7/a2), blocked by its own pawn on g7/g2 (or b7/b2). A knight delivers check from e7/e2 (or c7/c2) and a rook delivers the final blow on the h-file (or a-file).",
    keyFeatures: [
      'King is trapped by own pawn',
      'Knight controls key squares',
      'Rook delivers checkmate on the h-file or a-file',
      'Common in the middlegame with castled king',
    ],
    difficulty: 'advanced',
    examples: [
      { id: 'an1', fen: '4r1k1/3n1ppp/8/3NN3/8/8/5PPP/R5K1 w - - 0 1', solution: ['e5f7'], hint: 'Knight check leads to devastation' },
      { id: 'an2', fen: '5rk1/4Nppp/8/8/8/8/5PPP/R5K1 w - - 0 1', solution: ['a1a8'], hint: 'Rook to the 8th rank' },
      { id: 'an3', fen: 'r4rk1/4Nppp/8/8/8/8/Q4PPP/6K1 w - - 0 1', solution: ['a2a8', 'f8a8', 'e7f5'], hint: 'Queen sacrifice enables knight mate' },
      { id: 'an4', fen: '5r1k/5Npp/8/8/8/8/5PPP/4R1K1 w - - 0 1', solution: ['e1e8'], hint: 'Rook delivers the final blow' },
      { id: 'an5', fen: '4rrk1/4Nppp/8/4R3/8/8/5PPP/6K1 w - - 0 1', solution: ['e5e8', 'f8e8', 'e7f5'], hint: 'Exchange opens the pattern' },
      { id: 'an6', fen: 'r5k1/4Np1p/6p1/8/8/8/5PPP/R5K1 w - - 0 1', solution: ['a1a8', 'a8a1'], hint: 'Rook invasion' },
      { id: 'an7', fen: '5rk1/3nNppp/8/8/8/8/Q4PPP/6K1 w - - 0 1', solution: ['a2a8'], hint: 'Queen penetrates to 8th rank' },
      { id: 'an8', fen: '2r2rk1/4Nppp/8/8/8/8/Q4PPP/6K1 w - - 0 1', solution: ['a2a8', 'c8a8', 'e7f5'], hint: 'Multiple sacrifices' },
      { id: 'an9', fen: 'r4rk1/4Nppp/8/8/8/7Q/5PPP/6K1 w - - 0 1', solution: ['h3h7', 'g8h7', 'e7g6'], hint: 'Queen sac enables knight mate' },
      { id: 'an10', fen: '3r2k1/4Nppp/8/6R1/8/8/5PPP/6K1 w - - 0 1', solution: ['g5g7', 'g8h8', 'g7h7'], hint: 'Rook swings to the h-file' },
    ],
  },

  // GREEK GIFT SACRIFICE
  {
    id: 'greek-gift',
    name: 'Greek Gift Sacrifice',
    description: 'A classic bishop sacrifice on h7 (or h2) followed by a devastating attack.',
    explanation: 'The Greek Gift (Bxh7+) is one of the most famous attacking patterns in chess. After sacrificing the bishop, the knight jumps to g5 with check or threats, and the queen joins the attack, typically mating on the h-file or forcing material gain.',
    keyFeatures: [
      'Bishop sacrifices on h7 (or h2)',
      'King is forced to capture',
      'Knight jumps to g5 with tempo',
      'Queen enters via h5 or other route',
      'Requires specific pawn structure',
    ],
    difficulty: 'advanced',
    examples: [
      { id: 'gg1', fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 1', solution: ['c4f7'], hint: 'Classical bishop sacrifice on f7' },
      { id: 'gg2', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['h5f7'], hint: 'Queen and bishop coordinate' },
      { id: 'gg3', fen: 'rnbqkb1r/ppp2ppp/3p1n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], hint: 'Knight attacks f7' },
      { id: 'gg4', fen: 'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['c4f7'], hint: 'Bishop sacrifice opens lines' },
      { id: 'gg5', fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 1', solution: ['c4f7', 'e8f7', 'f3g5'], hint: 'Classic Greek Gift sequence' },
      { id: 'gg6', fen: 'r1bqkb1r/pppp1Bpp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1', solution: ['e8f7'], hint: 'King must take' },
      { id: 'gg7', fen: 'r1bqr1k1/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPPN1PPP/R1BQ1RK1 w - - 0 1', solution: ['c4f7', 'f8f7', 'd2e4'], hint: 'Sacrifice and knight enters' },
      { id: 'gg8', fen: 'r1bq1rk1/ppp1nppp/3p1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 1', solution: ['c4f7'], hint: 'Even with knight on e7' },
      { id: 'gg9', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['h5f7', 'e8e7', 'f7f8'], hint: 'Queen sacrifice variant' },
      { id: 'gg10', fen: 'rnbqk2r/ppp2ppp/3p1n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['c4f7', 'e8f7', 'f3g5'], hint: 'Standard Italian Game sacrifice' },
    ],
  },

  // BODEN'S MATE
  {
    id: 'bodens-mate',
    name: "Boden's Mate",
    description: 'A checkmate delivered by two bishops on criss-crossing diagonals.',
    explanation: "Boden's Mate occurs when two bishops deliver checkmate on criss-crossing diagonals. The king is typically in the center or on the queenside, blocked by its own pieces. This pattern often arises after a queen sacrifice.",
    keyFeatures: [
      'Two bishops deliver checkmate',
      'Bishops attack on crossing diagonals',
      'King is typically in center or queenside',
      'Own pieces block escape',
      'Often follows queen sacrifice',
    ],
    difficulty: 'advanced',
    examples: [
      { id: 'bo1', fen: '2kr4/ppp5/8/8/8/8/5B2/4KB2 w - - 0 1', solution: ['f2a7'], hint: 'Bishops criss-cross on the king' },
      { id: 'bo2', fen: 'r1b1k2r/ppppqppp/2n2n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1', solution: ['d1a4'], hint: 'Queen opens diagonals' },
      { id: 'bo3', fen: '2k5/ppp5/2b5/8/8/1B6/8/4K3 w - - 0 1', solution: ['b3a4'], hint: 'Bishop finds the diagonal' },
      { id: 'bo4', fen: 'r2qkb1r/ppp1pppp/2n2n2/3p4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1', solution: ['c1g5'], hint: 'Bishop develops with threat' },
      { id: 'bo5', fen: '2kr3r/ppp5/8/3B4/5b2/8/5K2/8 w - - 0 1', solution: ['d5a8'], hint: 'Bishop delivers mate' },
      { id: 'bo6', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5', 'd8g5', 'c4f7'], hint: 'Sacrifice sequence' },
      { id: 'bo7', fen: '2k5/1pp5/p7/8/8/1BB5/8/4K3 w - - 0 1', solution: ['c3a5'], hint: 'Final diagonal strike' },
      { id: 'bo8', fen: 'r1bqk2r/1ppp1ppp/p1n2n2/2b1p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['a4c6'], hint: 'Bishop takes, threatening Boden\'s' },
      { id: 'bo9', fen: '2kr4/ppp5/8/2B5/8/8/5B2/4K3 w - - 0 1', solution: ['f2a7'], hint: 'Classic Boden\'s setup' },
      { id: 'bo10', fen: '1rbqk2r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQk - 0 1', solution: ['c4f7'], hint: 'Opens diagonal for second bishop' },
    ],
  },

  // DISCOVERED ATTACK
  {
    id: 'discovered-attack',
    name: 'Discovered Attack',
    description: 'Moving one piece reveals an attack from another piece behind it.',
    explanation: 'A discovered attack occurs when you move a piece that was blocking an attack from another piece. The moving piece can attack a target while simultaneously unmasking a threat from the piece behind. When the discovered attack is a check, it is called a discovered check.',
    keyFeatures: [
      'One piece moves to reveal another\'s attack',
      'Two threats created simultaneously',
      'Very hard to defend against',
      'Discovered check is especially powerful',
    ],
    difficulty: 'intermediate',
    examples: [
      { id: 'da1', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], hint: 'Knight moves, revealing bishop attack on f7' },
      { id: 'da2', fen: 'rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['h5f7'], hint: 'Queen takes with discovered threat' },
      { id: 'da3', fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['b5c6'], hint: 'Bishop takes, discovered attack' },
      { id: 'da4', fen: 'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1', solution: ['c4f7'], hint: 'Sacrifice with discovered threat' },
      { id: 'da5', fen: 'r1bqk2r/pppp1Bpp/2n2n2/2b1p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1', solution: ['d8e7'], hint: 'Black must respond to discovered check' },
      { id: 'da6', fen: 'rnb1kbnr/pppp1ppp/8/4p3/4P2q/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1', solution: ['f3e5'], hint: 'Knight moves with tempo' },
      { id: 'da7', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['d2d3'], hint: 'Open the diagonal for the bishop' },
      { id: 'da8', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1', solution: ['c3d5'], hint: 'Knight hops to create discovered threat' },
      { id: 'da9', fen: 'r2qkbnr/ppp2ppp/2np4/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3e5'], hint: 'Win the bishop with discovered attack' },
      { id: 'da10', fen: 'r1bqkb1r/ppppnppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['b5c6'], hint: 'Take and discover attack on e5' },
    ],
  },

  // FORK PATTERNS
  {
    id: 'knight-fork',
    name: 'Knight Fork',
    description: 'Using the knight\'s unique movement to attack two or more pieces simultaneously.',
    explanation: 'The knight fork is one of the most common tactical patterns. Due to the knight\'s unique L-shaped movement and its ability to jump over pieces, it can attack multiple valuable pieces at once. The most devastating is the royal fork, attacking king and queen.',
    keyFeatures: [
      'Knight attacks two or more pieces',
      'Knight cannot be blocked',
      'Royal fork attacks king and queen',
      'Family fork attacks king, queen, and rook',
    ],
    difficulty: 'beginner',
    examples: [
      { id: 'kf1', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], hint: 'Knight targets f7' },
      { id: 'kf2', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], hint: 'Attack the weak f7 square' },
      { id: 'kf3', fen: 'r1b1kb1r/pppp1ppp/5n2/4p3/2B1n2q/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['c4f7'], hint: 'Sacrifice leads to fork' },
      { id: 'kf4', fen: 'r3kb1r/ppp1qppp/2n1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1', solution: ['c3d5'], hint: 'Knight fork on d5' },
      { id: 'kf5', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['d2d4'], hint: 'Open center for knight' },
      { id: 'kf6', fen: 'r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['f3g5'], hint: 'Classic knight attack' },
      { id: 'kf7', fen: '4kb1r/p1p2ppp/4pn2/1p1qN3/3P4/8/PPP2PPP/R1BQK2R w KQk - 0 1', solution: ['e5c6'], hint: 'Knight forks queen and rook' },
      { id: 'kf8', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1', solution: ['c3d5'], hint: 'Central knight hop' },
      { id: 'kf9', fen: 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1', solution: ['f3g5'], hint: 'Still threatening f7' },
      { id: 'kf10', fen: 'r2qkb1r/ppp2ppp/2n1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1', solution: ['c3e2'], hint: 'Reposition for better fork' },
    ],
  },

  // PIN PATTERN
  {
    id: 'pin',
    name: 'Pin',
    description: 'Attacking a piece that cannot move without exposing a more valuable piece behind it.',
    explanation: 'A pin is a situation where a piece is attacked and cannot move (or should not move) because doing so would expose a more valuable piece behind it. An absolute pin involves the king, making it illegal to move the pinned piece.',
    keyFeatures: [
      'Three pieces in a line: attacker, pinned piece, valuable piece',
      'Absolute pin: cannot move (king behind)',
      'Relative pin: should not move (valuable piece behind)',
      'Bishops, rooks, and queens can pin',
    ],
    difficulty: 'beginner',
    examples: [
      { id: 'pin1', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1', solution: ['a7a6'], hint: 'Knight is pinned to the king' },
      { id: 'pin2', fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['b5c6'], hint: 'Pin and win the knight' },
      { id: 'pin3', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1', solution: ['d1h5'], hint: 'Queen pins the pawn' },
      { id: 'pin4', fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 0 1', solution: ['f8b4'], hint: 'Black can counter-pin' },
      { id: 'pin5', fen: 'rnb1kb1r/ppppqppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['d2d3'], hint: 'Develop while maintaining pin on e5' },
      { id: 'pin6', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 1', solution: ['c6d4'], hint: 'Break the pin with attack' },
      { id: 'pin7', fen: 'rn1qkb1r/ppp2ppp/3p1n2/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['h2h3'], hint: 'Challenge the pinning bishop' },
      { id: 'pin8', fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 1', solution: ['d7d6'], hint: 'Support pinned knight' },
      { id: 'pin9', fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1', solution: ['d1c2'], hint: 'Defend against the pin' },
      { id: 'pin10', fen: 'r1bqkb1r/ppppnppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['b5c6'], hint: 'Exchange the pinned piece' },
    ],
  },

  // SKEWER PATTERN
  {
    id: 'skewer',
    name: 'Skewer',
    description: 'Attacking a valuable piece that when it moves exposes a piece behind it.',
    explanation: 'A skewer is like a reverse pin. You attack a valuable piece (often the king) which must move, exposing a less valuable piece behind it that can then be captured. Skewers are particularly effective along ranks, files, and diagonals.',
    keyFeatures: [
      'Attack valuable piece (king/queen)',
      'Piece must move, exposing piece behind',
      'More valuable piece is in front',
      'Bishops, rooks, and queens can skewer',
    ],
    difficulty: 'intermediate',
    examples: [
      { id: 'sk1', fen: '8/8/8/4k3/8/8/4R3/4K3 w - - 0 1', solution: ['e2e5', 'e5d6', 'e5a5'], hint: 'Rook skewers king and something behind' },
      { id: 'sk2', fen: '4k3/8/4q3/8/8/8/4R3/4K3 w - - 0 1', solution: ['e2e6'], hint: 'Skewer the queen through the king' },
      { id: 'sk3', fen: '8/8/8/4k3/8/4q3/4R3/4K3 w - - 0 1', solution: ['e2e5', 'e5f4', 'e5e3'], hint: 'King moves, queen falls' },
      { id: 'sk4', fen: '3r4/8/8/8/8/8/8/3RK2k w - - 0 1', solution: ['d1d8'], hint: 'Back rank skewer' },
      { id: 'sk5', fen: '8/6k1/8/8/8/8/B7/K7 w - - 0 1', solution: ['a2d5'], hint: 'Bishop skewer on diagonal' },
      { id: 'sk6', fen: '8/8/4k3/8/8/8/3R4/3RK3 w - - 0 1', solution: ['d2d6', 'd1d6'], hint: 'Double rook skewer' },
      { id: 'sk7', fen: '8/2k5/3q4/8/8/8/2R5/2K5 w - - 0 1', solution: ['c2c7', 'c7d7', 'c7c6'], hint: 'Skewer king and queen' },
      { id: 'sk8', fen: 'r3k3/8/8/8/8/8/8/R3K3 w - - 0 1', solution: ['a1a8'], hint: 'Rook skewer on back rank' },
      { id: 'sk9', fen: '8/8/8/8/8/2k5/1q6/B3K3 w - - 0 1', solution: ['a1b2'], hint: 'Bishop skewers king to queen' },
      { id: 'sk10', fen: '8/8/4q3/8/8/4k3/4R3/4K3 w - - 0 1', solution: ['e2e3', 'e3f2', 'e3e6'], hint: 'Skewer through king to queen' },
    ],
  },
];

export function getPatternById(id: string): ChessPattern | undefined {
  return patterns.find(p => p.id === id);
}

export function getPatternsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ChessPattern[] {
  return patterns.filter(p => p.difficulty === difficulty);
}
