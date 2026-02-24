import type { AtomicStep } from '../types/player.ts';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  rounds: number;
  onIncrementRound: () => void;
}

export function AMRAPView({ step, remaining, progress, rounds, onIncrementRound }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      {/* Block name */}
      <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list */}
      <div className="w-full max-w-sm space-y-2">
        {step.amrapExercises?.map((ex, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10">
            <span className="text-white font-medium">{ex.name}</span>
            <span className="text-lg font-bold" style={{ color: step.blockColor }}>
              x{ex.reps}
            </span>
          </div>
        ))}
      </div>

      {/* Round counter + button */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: step.blockColor }}>
            {rounds}
          </div>
          <div className="text-white/50 text-xs">rounds</div>
        </div>

        <button
          type="button"
          onClick={onIncrementRound}
          className="h-16 px-8 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
          style={{ backgroundColor: step.blockColor }}
        >
          +1 Round
        </button>
      </div>
    </div>
  );
}
