import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialTime: number; // in seconds
  isRunning: boolean;
  onTimeout?: () => void;
  color?: 'white' | 'black';
  isActive?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Timer({
  initialTime,
  isRunning,
  onTimeout,
  color = 'white',
  isActive = false,
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onTimeout?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isActive, onTimeout]);

  const isLow = time < 30;
  const isCritical = time < 10;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-slate-700 ring-2 ring-blue-500'
          : 'bg-slate-800'
      } ${isCritical ? 'animate-pulse' : ''}`}
    >
      <div
        className={`w-3 h-3 rounded-full ${
          color === 'white' ? 'bg-white' : 'bg-slate-900 border-2 border-slate-600'
        }`}
      />
      <Clock
        size={18}
        className={`${
          isCritical ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-slate-400'
        }`}
      />
      <span
        className={`font-mono text-xl font-bold ${
          isCritical
            ? 'text-red-500'
            : isLow
              ? 'text-yellow-500'
              : 'text-white'
        }`}
      >
        {formatTime(time)}
      </span>
    </div>
  );
}

interface GameTimersProps {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  currentTurn: 'w' | 'b';
  onWhiteTimeout?: () => void;
  onBlackTimeout?: () => void;
  orientation?: 'white' | 'black';
}

export function GameTimers({
  whiteTime,
  blackTime,
  isRunning,
  currentTurn,
  onWhiteTimeout,
  onBlackTimeout,
  orientation = 'white',
}: GameTimersProps) {
  const timers = (
    <>
      <Timer
        initialTime={blackTime}
        isRunning={isRunning}
        isActive={currentTurn === 'b'}
        onTimeout={onBlackTimeout}
        color="black"
      />
      <Timer
        initialTime={whiteTime}
        isRunning={isRunning}
        isActive={currentTurn === 'w'}
        onTimeout={onWhiteTimeout}
        color="white"
      />
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      {orientation === 'white' ? timers : (
        <>
          <Timer
            initialTime={whiteTime}
            isRunning={isRunning}
            isActive={currentTurn === 'w'}
            onTimeout={onWhiteTimeout}
            color="white"
          />
          <Timer
            initialTime={blackTime}
            isRunning={isRunning}
            isActive={currentTurn === 'b'}
            onTimeout={onBlackTimeout}
            color="black"
          />
        </>
      )}
    </div>
  );
}
