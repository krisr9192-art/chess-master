import { useRef, useEffect } from 'react';
import type { MoveInfo } from '../../types';

interface MoveHistoryProps {
  moves: MoveInfo[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export function MoveHistory({ moves, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new moves are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (white + black)
  const movePairs: { number: number; white?: MoveInfo; black?: MoveInfo }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  if (moves.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3 text-white">Moves</h3>
        <div className="text-slate-400 text-sm text-center py-4">
          No moves yet. Start playing!
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Moves</h3>
      <div
        ref={containerRef}
        className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin"
      >
        {movePairs.map((pair, pairIndex) => (
          <div
            key={pair.number}
            className="flex items-center text-sm font-mono"
          >
            <span className="w-8 text-slate-500 flex-shrink-0">
              {pair.number}.
            </span>
            {pair.white && (
              <button
                onClick={() => onMoveClick?.(pairIndex * 2)}
                className={`flex-1 px-2 py-1 rounded text-left transition-colors ${
                  currentMoveIndex === pairIndex * 2
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pair.white.san}
              </button>
            )}
            {pair.black && (
              <button
                onClick={() => onMoveClick?.(pairIndex * 2 + 1)}
                className={`flex-1 px-2 py-1 rounded text-left transition-colors ${
                  currentMoveIndex === pairIndex * 2 + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {pair.black.san}
              </button>
            )}
            {!pair.black && <span className="flex-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}
