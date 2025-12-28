import {
  RotateCcw,
  Flag,
  Handshake,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  RotateCw,
} from 'lucide-react';

interface GameControlsProps {
  onUndo?: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  onReset?: () => void;
  onFlipBoard?: () => void;
  onFirstMove?: () => void;
  onPrevMove?: () => void;
  onNextMove?: () => void;
  onLastMove?: () => void;
  canUndo?: boolean;
  showNavigation?: boolean;
  showResign?: boolean;
  showDraw?: boolean;
  isGameOver?: boolean;
}

export function GameControls({
  onUndo,
  onResign,
  onOfferDraw,
  onReset,
  onFlipBoard,
  onFirstMove,
  onPrevMove,
  onNextMove,
  onLastMove,
  canUndo = true,
  showNavigation = false,
  showResign = true,
  showDraw = true,
  isGameOver = false,
}: GameControlsProps) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-2">
        {/* Undo button */}
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo || isGameOver}
            className="btn btn-secondary flex items-center gap-2 text-sm py-2 px-3"
            title="Undo Move"
          >
            <RotateCcw size={16} />
            Undo
          </button>
        )}

        {/* Flip board button */}
        {onFlipBoard && (
          <button
            onClick={onFlipBoard}
            className="btn btn-secondary flex items-center gap-2 text-sm py-2 px-3"
            title="Flip Board"
          >
            <RotateCw size={16} />
            Flip
          </button>
        )}

        {/* Reset button */}
        {onReset && (
          <button
            onClick={onReset}
            className="btn btn-secondary flex items-center gap-2 text-sm py-2 px-3"
            title="New Game"
          >
            <RotateCcw size={16} />
            New Game
          </button>
        )}

        {/* Draw button */}
        {showDraw && onOfferDraw && !isGameOver && (
          <button
            onClick={onOfferDraw}
            className="btn btn-secondary flex items-center gap-2 text-sm py-2 px-3"
            title="Offer Draw"
          >
            <Handshake size={16} />
            Draw
          </button>
        )}

        {/* Resign button */}
        {showResign && onResign && !isGameOver && (
          <button
            onClick={onResign}
            className="btn btn-danger flex items-center gap-2 text-sm py-2 px-3"
            title="Resign"
          >
            <Flag size={16} />
            Resign
          </button>
        )}
      </div>

      {/* Navigation controls for analysis */}
      {showNavigation && (
        <div className="flex gap-1 mt-3 justify-center">
          <button
            onClick={onFirstMove}
            className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="First Move"
          >
            <ChevronFirst size={20} />
          </button>
          <button
            onClick={onPrevMove}
            className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Previous Move"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNextMove}
            className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Next Move"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={onLastMove}
            className="p-2 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title="Last Move"
          >
            <ChevronLast size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
