import type { AtomicStep } from '../types/player.ts';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
}

export function EMOMView({ step, remaining, progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Minute indicator */}
      <div className="text-white/50 text-sm font-medium">
        {step.roundInfo && `Minute ${step.roundInfo.current}/${step.roundInfo.total}`}
      </div>

      {/* Block name */}
      <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list */}
      <div className="w-full max-w-sm space-y-3">
        {step.emomExercises?.map((ex, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10">
            <span className="text-white font-medium">{ex.name}</span>
            <span className="text-lg font-bold" style={{ color: step.blockColor }}>
              x{ex.reps}
            </span>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs">Faites les exercices puis récupérez jusqu'à la prochaine minute</p>
    </div>
  );
}
