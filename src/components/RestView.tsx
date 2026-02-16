import type { AtomicStep } from '../types/player.ts';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  onSkip: () => void;
}

export function RestView({ step, remaining, progress, onSkip }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white/70">
        Repos
      </h2>

      {/* Timer */}
      <TimerDisplay
        remaining={remaining}
        progress={progress}
        color={step.blockColor}
        size="medium"
      />

      {/* Next exercise info */}
      <p className="text-white/60 text-base">
        {step.instructions}
      </p>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="px-6 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium active:bg-white/20 transition-colors"
      >
        Passer le repos →
      </button>
    </div>
  );
}
