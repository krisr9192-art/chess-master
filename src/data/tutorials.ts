import type { Tutorial, TutorialCategory } from '../types';

export const tutorials: Tutorial[] = [
  // BASICS
  {
    id: 'basics-1',
    title: 'The Chessboard',
    description: 'Learn about the 64 squares, files, ranks, and how to read chess coordinates.',
    category: 'basics',
    steps: [
      {
        instruction: 'Welcome to chess! This is the chessboard. It has 64 squares arranged in an 8x8 grid.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        explanation: 'The board alternates between light and dark squares. Each player starts with 16 pieces.',
      },
      {
        instruction: 'Columns are called "files" and are labeled a-h from left to right (from White\'s view).',
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
        highlightSquares: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
        explanation: 'The a-file is highlighted. Files help us describe where pieces are located.',
      },
      {
        instruction: 'Rows are called "ranks" and are numbered 1-8 from bottom to top (from White\'s view).',
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
        highlightSquares: ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
        explanation: 'The 4th rank is highlighted. Ranks help us describe piece positions.',
      },
      {
        instruction: 'Every square has a unique name: file + rank. For example, e4 is in the e-file, 4th rank.',
        fen: '8/8/8/8/4P3/8/8/8 w - - 0 1',
        highlightSquares: ['e4'],
        explanation: 'The pawn is on e4. This notation system is called "algebraic notation".',
      },
    ],
  },
  {
    id: 'basics-2',
    title: 'The Goal of Chess',
    description: 'Understand checkmate, check, and how to win the game.',
    category: 'basics',
    steps: [
      {
        instruction: 'The goal of chess is to checkmate the opponent\'s king. This means attacking the king with no escape.',
        fen: '6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1',
        explanation: 'Checkmate ends the game immediately. The side who delivers checkmate wins!',
      },
      {
        instruction: 'When a king is attacked, it\'s called "check". The player must get out of check immediately.',
        fen: '4k3/8/8/8/8/8/8/4R2K w - - 0 1',
        highlightSquares: ['e8'],
        arrows: [{ from: 'e1', to: 'e8' }],
        explanation: 'The rook attacks the king - this is check. Black must move the king or block the attack.',
      },
      {
        instruction: 'This is checkmate! The king is in check and has no legal moves to escape.',
        fen: '4k3/4R3/4K3/8/8/8/8/8 b - - 0 1',
        highlightSquares: ['e8'],
        explanation: 'The black king cannot move anywhere safe. The rook covers the 7th rank. White wins!',
      },
    ],
  },
  // PIECES
  {
    id: 'pieces-pawn',
    title: 'The Pawn',
    description: 'Learn how pawns move, capture, and promote.',
    category: 'pieces',
    steps: [
      {
        instruction: 'Pawns move forward one square at a time.',
        fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
        arrows: [{ from: 'e2', to: 'e3' }],
        explanation: 'The pawn can move from e2 to e3.',
      },
      {
        instruction: 'From the starting position, pawns can move two squares forward on their first move.',
        fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
        arrows: [{ from: 'e2', to: 'e4' }],
        explanation: 'This is optional - the pawn can still choose to move just one square.',
      },
      {
        instruction: 'Pawns capture diagonally, one square forward.',
        fen: '8/8/8/8/3p4/8/4P3/8 w - - 0 1',
        arrows: [{ from: 'e2', to: 'd3' }],
        correctMove: { from: 'e2', to: 'd4' },
        explanation: 'The white pawn can capture the black pawn by moving diagonally.',
      },
      {
        instruction: 'When a pawn reaches the last rank, it must promote to a queen, rook, bishop, or knight!',
        fen: '8/4P3/8/8/8/8/8/8 w - - 0 1',
        arrows: [{ from: 'e7', to: 'e8' }],
        explanation: 'This is called pawn promotion. Most players choose a queen (the strongest piece).',
      },
    ],
  },
  {
    id: 'pieces-knight',
    title: 'The Knight',
    description: 'Master the unique L-shaped movement of the knight.',
    category: 'pieces',
    steps: [
      {
        instruction: 'The knight moves in an "L" shape: 2 squares in one direction, then 1 square perpendicular.',
        fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
        highlightSquares: ['d6', 'f6', 'g5', 'g3', 'f2', 'd2', 'c3', 'c5'],
        explanation: 'From e4, the knight can move to any of the highlighted squares.',
      },
      {
        instruction: 'Knights are special - they can jump over other pieces!',
        fen: '8/8/8/3ppp2/3pNp2/3ppp2/8/8 w - - 0 1',
        highlightSquares: ['d6', 'f6', 'g5', 'g3', 'f2', 'd2', 'c3', 'c5'],
        explanation: 'Even though the knight is surrounded by pawns, it can still move to all its normal squares.',
      },
      {
        instruction: 'A knight on the rim is dim! Knights are strongest in the center of the board.',
        fen: '8/8/8/8/8/8/8/N7 w - - 0 1',
        highlightSquares: ['b3', 'c2'],
        explanation: 'From the corner, a knight only has 2 possible moves. From the center, it has up to 8!',
      },
    ],
  },
  {
    id: 'pieces-bishop',
    title: 'The Bishop',
    description: 'Learn how the bishop moves diagonally across the board.',
    category: 'pieces',
    steps: [
      {
        instruction: 'The bishop moves diagonally any number of squares.',
        fen: '8/8/8/8/4B3/8/8/8 w - - 0 1',
        arrows: [{ from: 'e4', to: 'h7' }, { from: 'e4', to: 'a8' }, { from: 'e4', to: 'h1' }, { from: 'e4', to: 'b1' }],
        explanation: 'The bishop can move along both diagonals until blocked by another piece.',
      },
      {
        instruction: 'Each bishop stays on squares of one color for the entire game.',
        fen: '8/8/8/8/2B1B3/8/8/8 w - - 0 1',
        explanation: 'The light-squared bishop on c4 can only ever reach light squares. Same for the dark-squared bishop.',
      },
      {
        instruction: 'The two bishops together are very powerful - they cover all squares!',
        fen: '8/8/8/8/2B1B3/8/8/8 w - - 0 1',
        explanation: 'This is why having both bishops is called "the bishop pair" and is considered an advantage.',
      },
    ],
  },
  {
    id: 'pieces-rook',
    title: 'The Rook',
    description: 'Understand how the rook moves in straight lines.',
    category: 'pieces',
    steps: [
      {
        instruction: 'The rook moves horizontally or vertically any number of squares.',
        fen: '8/8/8/8/4R3/8/8/8 w - - 0 1',
        arrows: [{ from: 'e4', to: 'e8' }, { from: 'e4', to: 'e1' }, { from: 'e4', to: 'a4' }, { from: 'e4', to: 'h4' }],
        explanation: 'The rook controls entire ranks and files from its position.',
      },
      {
        instruction: 'Rooks are most powerful on open files (files with no pawns).',
        fen: '8/8/8/8/8/8/8/4R3 w - - 0 1',
        arrows: [{ from: 'e1', to: 'e8' }],
        explanation: 'An open file lets the rook penetrate into enemy territory.',
      },
      {
        instruction: 'Connected rooks on the same rank or file defend each other and are very strong.',
        fen: '8/8/8/8/8/8/8/R3R3 w - - 0 1',
        arrows: [{ from: 'a1', to: 'e1' }],
        explanation: 'These rooks protect each other and can work together to control the board.',
      },
    ],
  },
  {
    id: 'pieces-queen',
    title: 'The Queen',
    description: 'Learn about the most powerful piece on the board.',
    category: 'pieces',
    steps: [
      {
        instruction: 'The queen combines the powers of both the rook and bishop!',
        fen: '8/8/8/8/4Q3/8/8/8 w - - 0 1',
        arrows: [
          { from: 'e4', to: 'e8' }, { from: 'e4', to: 'e1' },
          { from: 'e4', to: 'a4' }, { from: 'e4', to: 'h4' },
          { from: 'e4', to: 'h7' }, { from: 'e4', to: 'a8' },
          { from: 'e4', to: 'h1' }, { from: 'e4', to: 'b1' },
        ],
        explanation: 'The queen can move horizontally, vertically, or diagonally any number of squares.',
      },
      {
        instruction: 'The queen is worth about 9 pawns - protect it carefully!',
        fen: '8/8/8/8/4Q3/8/8/8 w - - 0 1',
        explanation: 'Losing your queen early usually means losing the game. Don\'t bring it out too early!',
      },
    ],
  },
  {
    id: 'pieces-king',
    title: 'The King',
    description: 'Learn how the king moves and about castling.',
    category: 'pieces',
    steps: [
      {
        instruction: 'The king moves one square in any direction.',
        fen: '8/8/8/8/4K3/8/8/8 w - - 0 1',
        highlightSquares: ['d5', 'e5', 'f5', 'd4', 'f4', 'd3', 'e3', 'f3'],
        explanation: 'The king is slow but must be protected at all costs!',
      },
      {
        instruction: 'Castling is a special move where the king and rook move together.',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        explanation: 'Castling helps protect the king and activate the rook. You can castle kingside or queenside.',
      },
      {
        instruction: 'To castle kingside, the king moves two squares toward the h-file rook.',
        fen: '8/8/8/8/8/8/8/R3K2R w KQ - 0 1',
        arrows: [{ from: 'e1', to: 'g1' }],
        correctMove: { from: 'e1', to: 'g1' },
        explanation: 'The king goes to g1 and the rook jumps over to f1. This is written as O-O.',
      },
      {
        instruction: 'You cannot castle if: the king has moved, the rook has moved, the king is in check, or would pass through check.',
        fen: '8/8/8/8/4r3/8/8/R3K2R w KQ - 0 1',
        explanation: 'Here White cannot castle because the e4 rook would put the king in check on e1 or f1.',
      },
    ],
  },
  // TACTICS
  {
    id: 'tactics-fork',
    title: 'The Fork',
    description: 'Learn how to attack two pieces at once.',
    category: 'tactics',
    steps: [
      {
        instruction: 'A fork is when one piece attacks two or more enemy pieces at once.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
        arrows: [{ from: 'h5', to: 'f7' }],
        explanation: 'The queen threatens checkmate on f7 AND the e5 pawn. Black can\'t save both!',
      },
      {
        instruction: 'Knights are excellent forking pieces because of their unique movement.',
        fen: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1',
        arrows: [{ from: 'd4', to: 'c6' }],
        highlightSquares: ['e8'],
        explanation: 'If the knight moves to c6, it would check the king AND attack any piece on a5, b4, d8, etc.',
      },
      {
        instruction: 'This is a classic knight fork - attacking the king and queen!',
        fen: '4k3/8/2N5/8/8/8/8/4K2q w - - 0 1',
        highlightSquares: ['e8', 'h1'],
        arrows: [{ from: 'c6', to: 'e7' }],
        correctMove: { from: 'c6', to: 'e7' },
        explanation: 'Nf7 forks the king and queen. After the king moves, White captures the queen!',
      },
    ],
  },
  {
    id: 'tactics-pin',
    title: 'The Pin',
    description: 'Learn to immobilize pieces using pins.',
    category: 'tactics',
    steps: [
      {
        instruction: 'A pin occurs when a piece cannot move because it would expose a more valuable piece behind it.',
        fen: '4k3/8/4r3/8/4B3/8/8/4K3 w - - 0 1',
        arrows: [{ from: 'e4', to: 'e8' }],
        explanation: 'The bishop pins the rook to the king. If the rook moves, the king would be in check!',
      },
      {
        instruction: 'An absolute pin is when a piece is pinned to the king - it cannot legally move.',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1',
        highlightSquares: ['c3'],
        explanation: 'The knight on c3 is absolutely pinned by the bishop. It cannot move at all!',
      },
      {
        instruction: 'A relative pin is when moving would lose material, but is still legal.',
        fen: '4k3/8/4q3/8/4R3/8/8/4K3 w - - 0 1',
        highlightSquares: ['e4'],
        explanation: 'The rook is pinned to the king by the queen. Moving it is legal but loses the rook!',
      },
    ],
  },
  {
    id: 'tactics-skewer',
    title: 'The Skewer',
    description: 'Force valuable pieces to move, capturing what\'s behind.',
    category: 'tactics',
    steps: [
      {
        instruction: 'A skewer is like a reverse pin - the more valuable piece is in front and must move.',
        fen: '4k3/8/8/8/8/4K3/8/4r3 w - - 0 1',
        arrows: [{ from: 'e1', to: 'e3' }],
        explanation: 'The rook skewers the king. After the king moves, the rook behind it would be captured.',
      },
      {
        instruction: 'Skewers work because the front piece must move, exposing the piece behind.',
        fen: '6k1/8/6K1/8/8/8/8/r7 w - - 0 1',
        arrows: [{ from: 'a1', to: 'g1' }],
        explanation: 'The rook checks the king. After Kh7 or Kf7, the rook can capture the queen if one were on g1.',
      },
    ],
  },
  {
    id: 'tactics-discovered',
    title: 'Discovered Attack',
    description: 'Unleash powerful attacks by moving one piece to reveal another.',
    category: 'tactics',
    steps: [
      {
        instruction: 'A discovered attack happens when moving one piece reveals an attack from another piece behind it.',
        fen: '4k3/8/8/8/3N4/8/3R4/4K3 w - - 0 1',
        arrows: [{ from: 'd4', to: 'f5' }, { from: 'd2', to: 'd8' }],
        explanation: 'When the knight moves, it "discovers" an attack from the rook to the black king!',
      },
      {
        instruction: 'A discovered check is especially powerful - the king must respond to check while you win material.',
        fen: '4k3/4r3/8/3B4/8/8/8/4K3 w - - 0 1',
        arrows: [{ from: 'd5', to: 'f7' }],
        explanation: 'Moving the bishop to f7 discovers check from... nothing here, but the concept is key!',
      },
      {
        instruction: 'Double check is the most powerful: both the moving piece AND the revealed piece give check!',
        fen: 'r3k3/8/8/3N4/8/8/4B3/4K3 w - - 0 1',
        arrows: [{ from: 'd5', to: 'c7' }],
        explanation: 'Nc7+ is a double check! The knight checks AND the bishop checks. The king MUST move.',
      },
    ],
  },
  {
    id: 'tactics-backrank',
    title: 'Back Rank Mate',
    description: 'Exploit a trapped king on the back rank.',
    category: 'tactics',
    steps: [
      {
        instruction: 'Back rank mate occurs when a king is trapped behind its own pawns and gets checkmated on the last rank.',
        fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
        arrows: [{ from: 'e1', to: 'e8' }],
        explanation: 'Re8# is checkmate! The pawns block the king\'s escape. This is a back rank mate.',
      },
      {
        instruction: 'Always watch for back rank weaknesses - both yours and your opponent\'s!',
        fen: 'r4rk1/5ppp/8/8/8/8/5PPP/R4RK1 w - - 0 1',
        highlightSquares: ['g8', 'g1'],
        explanation: 'Both kings are potentially vulnerable to back rank mates. Be careful!',
      },
      {
        instruction: 'To prevent back rank mates, create "luft" (air) - an escape square for your king.',
        fen: '6k1/5pp1/7p/8/8/8/5PPP/4R1K1 w - - 0 1',
        highlightSquares: ['h6'],
        explanation: 'The h6 pawn move created an escape square on h7. Now there\'s no back rank mate!',
      },
    ],
  },
  {
    id: 'tactics-removing',
    title: 'Removing the Defender',
    description: 'Eliminate the piece that protects your target.',
    category: 'tactics',
    steps: [
      {
        instruction: 'Sometimes a piece defends something important. Remove that defender to win material!',
        fen: '4k3/8/4n3/8/4B3/8/4Q3/4K3 w - - 0 1',
        arrows: [{ from: 'e4', to: 'e6' }],
        explanation: 'The knight defends the e8 square. Take the knight, then the queen can invade!',
      },
      {
        instruction: 'The defender can be removed by capturing, attacking, or deflecting it.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        arrows: [{ from: 'c4', to: 'f7' }],
        explanation: 'The knight on f6 defends against Qh5 threats. What if we could remove it?',
      },
      {
        instruction: 'Here\'s a classic example: the Légal Trap!',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        explanation: 'White can sacrifice the queen! After Bxf7+ Ke7, Nd5# is checkmate because the f6 knight is gone!',
      },
    ],
  },
  {
    id: 'tactics-enpassant',
    title: 'En Passant',
    description: 'Learn the special pawn capture rule.',
    category: 'tactics',
    steps: [
      {
        instruction: 'En passant (French for "in passing") is a special pawn capture.',
        fen: '8/8/8/8/4Pp2/8/8/8 b - e3 0 1',
        arrows: [{ from: 'f4', to: 'e3' }],
        explanation: 'When a pawn moves two squares and lands beside an enemy pawn, it can be captured "in passing".',
      },
      {
        instruction: 'The capture happens as if the pawn had only moved one square.',
        fen: '8/8/8/4Pp2/8/8/8/8 w - f6 0 1',
        arrows: [{ from: 'e5', to: 'f6' }],
        explanation: 'The white pawn on e5 can capture the f5 pawn by moving to f6. The f5 pawn is removed!',
      },
      {
        instruction: 'En passant must be done immediately - on the very next move, or the right is lost!',
        fen: '8/8/8/3pP3/8/8/8/8 w - d6 0 1',
        highlightSquares: ['d6'],
        explanation: 'White can play exd6 en passant RIGHT NOW. If White makes any other move, the chance is gone forever.',
      },
    ],
  },
  // OPENINGS
  {
    id: 'openings-principles',
    title: 'Opening Principles',
    description: 'Learn the fundamental rules of good opening play.',
    category: 'openings',
    steps: [
      {
        instruction: 'Principle 1: Control the center with pawns.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        highlightSquares: ['d4', 'd5', 'e4', 'e5'],
        explanation: 'The center squares (d4, d5, e4, e5) are the most important. Control them!',
      },
      {
        instruction: 'Principle 2: Develop your pieces (knights and bishops) early.',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
        arrows: [{ from: 'f1', to: 'c4' }, { from: 'b1', to: 'c3' }],
        explanation: 'Get your pieces off the back rank so they can participate in the game.',
      },
      {
        instruction: 'Principle 3: Castle early to protect your king.',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        arrows: [{ from: 'e1', to: 'g1' }],
        explanation: 'Castling tucks your king away safely and connects your rooks.',
      },
      {
        instruction: 'Principle 4: Don\'t move the same piece twice in the opening.',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        explanation: 'Each move should develop a new piece. Moving one piece repeatedly wastes time.',
      },
      {
        instruction: 'Principle 5: Don\'t bring the queen out too early.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P2Q/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1',
        highlightSquares: ['h4'],
        explanation: 'The queen can be chased around by enemy pieces, losing valuable time.',
      },
    ],
  },
  {
    id: 'openings-italian',
    title: 'The Italian Game',
    description: 'A classic opening that fights for the center and targets f7.',
    category: 'openings',
    steps: [
      {
        instruction: 'The Italian Game begins with 1.e4 e5 2.Nf3 Nc6 3.Bc4.',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 0 1',
        arrows: [{ from: 'c4', to: 'f7' }],
        explanation: 'The bishop on c4 aims at f7, the weakest point in Black\'s position.',
      },
      {
        instruction: 'Black usually responds with 3...Bc5, creating the Giuoco Piano (Italian for "quiet game").',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        explanation: 'Now both sides develop naturally. This is one of the oldest recorded openings!',
      },
      {
        instruction: 'White often plays c3 to prepare d4, challenging the center.',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 1',
        arrows: [{ from: 'd2', to: 'd4' }],
        explanation: 'The c3 pawn supports a future d4 push to open the center.',
      },
      {
        instruction: 'The Italian Game leads to rich tactical and strategic play.',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 1',
        explanation: 'Both players can castle and fight for control of the center. A great opening to learn!',
      },
    ],
  },
  {
    id: 'openings-sicilian',
    title: 'The Sicilian Defense',
    description: 'The most popular response to 1.e4 at the highest levels.',
    category: 'openings',
    steps: [
      {
        instruction: 'The Sicilian Defense begins with 1.e4 c5.',
        fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
        highlightSquares: ['c5'],
        explanation: 'Black fights for the center but with the c-pawn, creating an asymmetrical game.',
      },
      {
        instruction: 'White usually plays 2.Nf3, and Black responds with various systems.',
        fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 1',
        explanation: 'From here, Black can play ...d6 (Najdorf/Dragon), ...Nc6 (Classical), or ...e6 (Scheveningen).',
      },
      {
        instruction: 'The Open Sicilian features d4, opening the position.',
        fen: 'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 1',
        arrows: [{ from: 'c5', to: 'd4' }],
        explanation: 'After 2...d6 3.d4, Black captures cxd4 and White recaptures Nxd4.',
      },
      {
        instruction: 'The Sicilian gives Black winning chances but requires precise play.',
        fen: 'r1bqkbnr/pp2pppp/2np4/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 1',
        explanation: 'Black has an extra central pawn but White has a lead in development. Sharp and complex!',
      },
    ],
  },
  {
    id: 'openings-london',
    title: 'The London System',
    description: 'A solid, reliable opening system for White.',
    category: 'openings',
    steps: [
      {
        instruction: 'The London System starts with 1.d4 and 2.Bf4, developing the bishop early.',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 0 1',
        highlightSquares: ['f4'],
        explanation: 'White develops the dark-squared bishop before playing e3, avoiding getting it trapped.',
      },
      {
        instruction: 'The setup is flexible and can be played against almost any Black response.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 1',
        arrows: [{ from: 'b1', to: 'd2' }, { from: 'g1', to: 'f3' }],
        explanation: 'White will play Nf3, e3, Nbd2, c3, and build a solid position.',
      },
      {
        instruction: 'The London aims for a solid structure with clear plans.',
        fen: 'r1bqkb1r/ppp1pppp/2n2n2/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R b KQkq - 0 1',
        explanation: 'Easy to learn, hard to break down. Great for players who prefer solid positions!',
      },
    ],
  },
  // ENDGAMES
  {
    id: 'endgame-kq-k',
    title: 'King + Queen vs King',
    description: 'Learn to deliver checkmate with king and queen.',
    category: 'endgames',
    steps: [
      {
        instruction: 'This is the easiest checkmate to learn. The queen restricts the king.',
        fen: '8/8/8/8/3k4/8/8/KQ6 w - - 0 1',
        explanation: 'The goal is to push the enemy king to the edge of the board, then checkmate.',
      },
      {
        instruction: 'Use the queen to cut off the king, creating a box it cannot escape.',
        fen: '8/8/8/8/3k4/8/3Q4/K7 w - - 0 1',
        arrows: [{ from: 'd2', to: 'd8' }],
        explanation: 'The queen on the d-file prevents the king from crossing to the queenside.',
      },
      {
        instruction: 'Bring your king up to help deliver checkmate.',
        fen: '8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1',
        arrows: [{ from: 'e1', to: 'e2' }],
        explanation: 'The queen alone can\'t checkmate. Your king must help trap the enemy king.',
      },
      {
        instruction: 'Checkmate on the edge! The king is trapped with nowhere to go.',
        fen: 'k7/1Q6/1K6/8/8/8/8/8 b - - 0 1',
        explanation: 'The queen covers all escape squares while the king supports it. Checkmate!',
      },
    ],
  },
  {
    id: 'endgame-kr-k',
    title: 'King + Rook vs King',
    description: 'Master the fundamental rook endgame checkmate.',
    category: 'endgames',
    steps: [
      {
        instruction: 'The rook checkmate requires pushing the enemy king to the edge.',
        fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
        explanation: 'Unlike the queen, the rook needs more precise technique.',
      },
      {
        instruction: 'Use your rook to cut off the king, restricting it to fewer ranks or files.',
        fen: '8/8/8/4k3/R7/8/8/4K3 w - - 0 1',
        arrows: [{ from: 'a4', to: 'h4' }],
        explanation: 'The rook on the 4th rank prevents the black king from coming below.',
      },
      {
        instruction: 'Bring your king closer to help push the enemy king back.',
        fen: '8/8/8/4k3/R7/8/4K3/8 w - - 0 1',
        arrows: [{ from: 'e2', to: 'e3' }],
        explanation: 'Opposition and king activity are key in this endgame.',
      },
      {
        instruction: 'The checkmate pattern: king and rook work together on the edge.',
        fen: 'k7/R7/1K6/8/8/8/8/8 b - - 0 1',
        explanation: 'The rook delivers check on the 7th rank. The king has no escape. Checkmate!',
      },
    ],
  },
  {
    id: 'endgame-kp-k',
    title: 'King + Pawn vs King',
    description: 'The most fundamental pawn endgame - can you promote?',
    category: 'endgames',
    steps: [
      {
        instruction: 'In King + Pawn vs King, the goal is to promote the pawn to a queen.',
        fen: '8/4k3/8/4P3/8/4K3/8/8 w - - 0 1',
        arrows: [{ from: 'e5', to: 'e8' }],
        explanation: 'White wants to push the pawn to e8 and promote. Black wants to stop it.',
      },
      {
        instruction: 'The key concept is "opposition" - kings directly facing each other.',
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        highlightSquares: ['e6', 'e8'],
        explanation: 'White has the opposition! The kings face each other and it\'s Black to move.',
      },
      {
        instruction: 'With opposition, the defending king must give way.',
        fen: '3k4/8/4K3/4P3/8/8/8/8 w - - 0 1',
        arrows: [{ from: 'e6', to: 'd6' }],
        explanation: 'Black moved aside. Now White can advance: Kd6, then push the pawn.',
      },
      {
        instruction: 'The "rule of the square" helps determine if a king can catch a pawn.',
        fen: '8/8/8/k3P3/8/8/8/4K3 w - - 0 1',
        highlightSquares: ['e5', 'e6', 'e7', 'e8', 'f5', 'f6', 'f7', 'f8', 'g5', 'g6', 'g7', 'g8', 'h5', 'h6', 'h7', 'h8'],
        explanation: 'Draw a square from the pawn to the promotion square. If the king can enter it, it catches the pawn!',
      },
      {
        instruction: 'If the king is in front of its pawn, winning chances are much higher.',
        fen: '8/8/4k3/8/4K3/4P3/8/8 w - - 0 1',
        arrows: [{ from: 'e4', to: 'e5' }],
        explanation: 'King in front of pawn = winning chances. King behind pawn = usually a draw.',
      },
    ],
  },
  {
    id: 'endgame-opposition',
    title: 'The Opposition',
    description: 'Master this critical endgame concept.',
    category: 'endgames',
    steps: [
      {
        instruction: 'Opposition means kings are directly facing each other with one square between.',
        fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1',
        highlightSquares: ['d3', 'd5'],
        explanation: 'The kings are in opposition. Whoever has to move loses it - they must step aside!',
      },
      {
        instruction: 'Having the opposition means your opponent must give way.',
        fen: '8/8/8/3k4/8/3K4/8/8 b - - 0 1',
        arrows: [{ from: 'd5', to: 'c5' }, { from: 'd5', to: 'e5' }],
        explanation: 'Black to move must step aside (Kc5 or Ke5), letting White\'s king advance.',
      },
      {
        instruction: 'Distant opposition: kings on the same file/rank with odd squares between.',
        fen: '3k4/8/8/8/8/8/8/3K4 w - - 0 1',
        highlightSquares: ['d1', 'd8'],
        explanation: 'With 6 squares between (even), whoever moves can gain the opposition!',
      },
      {
        instruction: 'The opposition is crucial in king and pawn endings.',
        fen: '8/8/8/4k3/4P3/4K3/8/8 w - - 0 1',
        arrows: [{ from: 'e3', to: 'e4' }],
        explanation: 'White should NOT push the pawn yet! First gain opposition with Ke3-e4 when possible.',
      },
      {
        instruction: 'Remember: The player NOT to move has the opposition!',
        fen: '8/8/4k3/8/4K3/8/8/8 w - - 0 1',
        explanation: 'White to move means Black has the opposition. White must try to outflank.',
      },
    ],
  },
  {
    id: 'endgame-stalemate',
    title: 'Stalemate Tricks',
    description: 'Learn to use stalemate as a defensive weapon.',
    category: 'endgames',
    steps: [
      {
        instruction: 'Stalemate occurs when a player has no legal moves but is NOT in check.',
        fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
        highlightSquares: ['h8'],
        explanation: 'The black king has no legal moves, but is not in check. Stalemate = draw!',
      },
      {
        instruction: 'When losing badly, look for stalemate tricks to save the game!',
        fen: 'k7/2K5/8/8/8/8/r7/8 b - - 0 1',
        arrows: [{ from: 'a2', to: 'a7' }],
        explanation: 'Black offers the rook! If Kxa7, Black is stalemated. The rook sacrifice saves the draw!',
      },
      {
        instruction: 'Be careful not to stalemate your opponent when you\'re winning!',
        fen: '8/8/8/8/8/1k6/1p6/1K6 w - - 0 1',
        highlightSquares: ['b1'],
        explanation: 'White has no legal moves but isn\'t in check. Black threw away the win with stalemate!',
      },
      {
        instruction: 'Always check if your opponent has a legal move before assuming you\'ve won.',
        fen: 'k7/P7/K7/8/8/8/8/8 b - - 0 1',
        explanation: 'The king is not in check but cannot move anywhere safe. Stalemate - draw!',
      },
    ],
  },
  // STRATEGY
  {
    id: 'strategy-piece-values',
    title: 'Piece Values',
    description: 'Understand the relative value of each piece.',
    category: 'tactics',
    steps: [
      {
        instruction: 'Each piece has a point value to help evaluate trades and sacrifices.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        explanation: 'Pawn = 1, Knight = 3, Bishop = 3, Rook = 5, Queen = 9. The King is priceless!',
      },
      {
        instruction: 'A Rook (5) is worth more than a Knight (3) or Bishop (3).',
        fen: '8/8/8/3R4/8/8/3n4/8 w - - 0 1',
        highlightSquares: ['d5', 'd2'],
        explanation: 'Trading a rook for a knight or bishop is bad - you lose 2 points of material.',
      },
      {
        instruction: 'The Queen (9) is worth roughly a Rook + Bishop + Pawn.',
        fen: '8/8/8/3Q4/8/8/8/8 w - - 0 1',
        explanation: 'Protect your queen! Losing it usually means losing the game.',
      },
      {
        instruction: 'Two Rooks (10) are slightly stronger than a Queen (9).',
        fen: '8/8/8/3RR3/8/8/8/8 w - - 0 1',
        explanation: 'Two rooks can coordinate attacks and cover more squares than a single queen.',
      },
      {
        instruction: 'The "bishop pair" (two bishops) has a bonus value, especially in open positions.',
        fen: '8/8/8/2B1B3/8/8/8/8 w - - 0 1',
        explanation: 'Together, the bishops cover all squares. Many consider them worth ~6.5 combined.',
      },
    ],
  },
  {
    id: 'strategy-trading',
    title: 'When to Trade Pieces',
    description: 'Learn strategic principles about piece exchanges.',
    category: 'tactics',
    steps: [
      {
        instruction: 'Trade pieces when you\'re ahead in material to simplify toward a winning endgame.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        explanation: 'If you\'re up a piece, trade everything and win with your extra material in the endgame.',
      },
      {
        instruction: 'Avoid trades when behind in material - keep pieces for counterplay!',
        fen: '8/8/8/8/4k3/8/4K3/8 w - - 0 1',
        explanation: 'With fewer pieces, the stronger side finds it easier to convert their advantage.',
      },
      {
        instruction: 'Trade pieces if your opponent has attacking chances against your king.',
        fen: 'r1bqr1k1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 1',
        explanation: 'Fewer pieces = less danger. Simplify to neutralize enemy attacks.',
      },
      {
        instruction: 'Keep pieces when attacking the enemy king.',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1',
        explanation: 'More pieces = more firepower for your attack. Don\'t trade when you\'re on the offensive!',
      },
      {
        instruction: 'Trade bad pieces for good pieces.',
        fen: '8/8/8/3Bp3/4P3/8/8/3b4 w - - 0 1',
        explanation: 'White\'s bishop is blocked by its own pawn. Trade it for Black\'s active bishop!',
      },
    ],
  },
];

export const tutorialCategories: { value: TutorialCategory; label: string; description: string }[] = [
  { value: 'basics', label: 'Basics', description: 'Fundamental concepts of chess' },
  { value: 'pieces', label: 'Pieces', description: 'How each piece moves' },
  { value: 'tactics', label: 'Tactics', description: 'Winning combinations' },
  { value: 'openings', label: 'Openings', description: 'Start the game right' },
  { value: 'endgames', label: 'Endgames', description: 'Finish the game strong' },
];

export function getTutorialsByCategory(category: TutorialCategory): Tutorial[] {
  return tutorials.filter((t) => t.category === category);
}

export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find((t) => t.id === id);
}
