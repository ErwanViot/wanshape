import type { AtomicStep } from '../types/player.ts';
import { NextPreview } from './NextPreview.tsx';

interface Props {
  step: AtomicStep;
  onDone: () => void;
}

export function RepsView({ step, onDone }: Props) {
  const repsLabel = step.repTarget === 'max' ? 'MAX' : step.repTarget;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Context */}
      <div className="text-white/50 text-sm">
        {step.roundInfo && (
          <span>Round {step.roundInfo.current}/{step.roundInfo.total}</span>
        )}
        {step.setInfo && (
          <span>Série {step.setInfo.current}/{step.setInfo.total}</span>
        )}
      </div>

      {/* Exercise name */}
      <h2 className="text-3xl sm:text-4xl font-bold text-white">
        {step.exerciseName}
      </h2>

      {/* Rep count */}
      <div className="text-5xl sm:text-6xl font-bold" style={{ color: step.blockColor }}>
        {repsLabel}
        <span className="text-xl sm:text-2xl text-white/50 ml-2">reps</span>
      </div>

      {/* Instructions */}
      <p className="text-white/60 text-base max-w-sm">
        {step.instructions}
      </p>

      {/* Tempo */}
      {step.tempo && (
        <p className="text-white/40 text-sm font-mono">
          Tempo {step.tempo}
        </p>
      )}

      {/* Done button */}
      <button
        onClick={onDone}
        className="w-full max-w-sm h-16 rounded-2xl font-bold text-xl text-white transition-all active:scale-95 animate-bounce-in"
        style={{ backgroundColor: step.blockColor }}
      >
        TERMINÉ ✓
      </button>

      {/* Next preview */}
      {step.nextStepPreview && (
        <NextPreview preview={step.nextStepPreview} />
      )}
    </div>
  );
}
