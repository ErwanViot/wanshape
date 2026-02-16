import type { AtomicStep } from '../types/player.ts';
import { BLOCK_LABELS } from '../engine/constants.ts';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
}

export function BlockTransition({ step, remaining, progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Block indicator */}
      <div className="text-white/40 text-sm">
        Bloc {step.blockIndex + 1}/{step.totalBlocks}
      </div>

      {/* Block type label */}
      <div
        className="text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full"
        style={{ backgroundColor: step.blockColor + '30', color: step.blockColor }}
      >
        {BLOCK_LABELS[step.blockType]}
      </div>

      {/* Block name */}
      <h2 className="text-3xl sm:text-4xl font-bold text-white">
        {step.exerciseName}
      </h2>

      {/* Description */}
      <p className="text-white/60 text-base">
        {step.instructions}
      </p>

      {/* Timer */}
      <TimerDisplay
        remaining={remaining}
        progress={progress}
        color={step.blockColor}
        size="small"
      />
    </div>
  );
}
