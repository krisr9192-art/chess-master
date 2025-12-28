import type { PieceSymbol } from '../../types';

interface CapturedPiecesProps {
  whiteCaptured: PieceSymbol[];
  blackCaptured: PieceSymbol[];
}

const PIECE_SYMBOLS: Record<PieceSymbol, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function calculateMaterialDiff(
  whiteCaptured: PieceSymbol[],
  blackCaptured: PieceSymbol[]
): number {
  const whiteValue = whiteCaptured.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const blackValue = blackCaptured.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  return whiteValue - blackValue;
}

interface CapturedRowProps {
  pieces: PieceSymbol[];
  color: 'white' | 'black';
  advantage?: number;
}

function CapturedRow({ pieces, color, advantage }: CapturedRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-14">
        {color === 'white' ? 'White' : 'Black'}:
      </span>
      <div className="flex flex-wrap gap-0.5">
        {pieces.map((piece, index) => (
          <span
            key={`${piece}-${index}`}
            className={`text-xl ${color === 'white' ? 'text-slate-200' : 'text-slate-600'}`}
          >
            {PIECE_SYMBOLS[piece][color]}
          </span>
        ))}
        {pieces.length === 0 && (
          <span className="text-slate-500 text-sm">-</span>
        )}
      </div>
      {advantage !== undefined && advantage !== 0 && (
        <span className={`text-xs font-medium ml-auto ${
          advantage > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {advantage > 0 ? '+' : ''}{advantage}
        </span>
      )}
    </div>
  );
}

export function CapturedPieces({ whiteCaptured, blackCaptured }: CapturedPiecesProps) {
  const materialDiff = calculateMaterialDiff(whiteCaptured, blackCaptured);

  return (
    <div className="card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 mb-2">Captured Pieces</h3>
      <CapturedRow
        pieces={whiteCaptured}
        color="black"
        advantage={materialDiff > 0 ? materialDiff : undefined}
      />
      <CapturedRow
        pieces={blackCaptured}
        color="white"
        advantage={materialDiff < 0 ? -materialDiff : undefined}
      />
    </div>
  );
}
