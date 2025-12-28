interface EvaluationBarProps {
  score: number; // in centipawns
  mate?: number; // moves to mate
  height?: number;
}

export function EvaluationBar({ score, mate, height = 400 }: EvaluationBarProps) {
  // Calculate the percentage for white (0-100)
  // Score is in centipawns, so 100 = 1 pawn advantage
  let percentage: number;

  if (mate !== undefined) {
    // If there's a forced mate, show extreme advantage
    percentage = mate > 0 ? 95 : 5;
  } else {
    // Convert centipawns to percentage
    // Use a sigmoid-like function to smooth out extreme values
    // At +/- 500 cp (5 pawns), it should show ~90%/10%
    const normalized = score / 500;
    percentage = 50 + 50 * (2 / (1 + Math.exp(-normalized * 2)) - 1);
    percentage = Math.max(5, Math.min(95, percentage));
  }

  // Format the score for display
  const formatScore = (): string => {
    if (mate !== undefined) {
      return `M${Math.abs(mate)}`;
    }
    const pawns = score / 100;
    if (Math.abs(pawns) < 0.1) return '0.0';
    return (pawns > 0 ? '+' : '') + pawns.toFixed(1);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-6 rounded-sm overflow-hidden bg-slate-900 relative"
        style={{ height: `${height}px` }}
      >
        {/* Black's portion (top) */}
        <div
          className="absolute top-0 left-0 right-0 bg-slate-800 transition-all duration-300"
          style={{ height: `${100 - percentage}%` }}
        />
        {/* White's portion (bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-slate-100 transition-all duration-300"
          style={{ height: `${percentage}%` }}
        />
        {/* Center line */}
        <div
          className="absolute left-0 right-0 h-px bg-slate-500"
          style={{ top: '50%' }}
        />
      </div>
      <div
        className={`text-xs font-mono font-bold ${
          mate !== undefined
            ? mate > 0
              ? 'text-green-400'
              : 'text-red-400'
            : score > 50
              ? 'text-green-400'
              : score < -50
                ? 'text-red-400'
                : 'text-slate-400'
        }`}
      >
        {formatScore()}
      </div>
    </div>
  );
}
