import type { AtomicStep } from '../types/player.ts';
import { NextPreview } from './NextPreview.tsx';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
}

export function ExerciseView({ step, remaining, progress }: Props) {
  const pulse = remaining <= 3 && remaining > 0;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Context */}
      <div className="text-white/50 text-sm">
        {step.roundInfo && (
          <span>
            Round {step.roundInfo.current}/{step.roundInfo.total}
          </span>
        )}
        {step.setInfo && (
          <span>
            Série {step.setInfo.current}/{step.setInfo.total}
          </span>
        )}
        {step.intervalInfo && (
          <span className="ml-2">
            · Intervalle {step.intervalInfo.current}/{step.intervalInfo.total}
          </span>
        )}
      </div>

      {/* Exercise name */}
      <h2 className="text-3xl sm:text-4xl font-bold text-white">{step.exerciseName}</h2>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} pulse={pulse} />

      {/* Instructions */}
      <p className="text-white text-lg max-w-sm">{step.instructions}</p>

      {/* Tempo */}
      {step.tempo && <p className="text-white/40 text-sm font-mono">Tempo {step.tempo}</p>}

      {/* Next preview */}
      {step.nextStepPreview && <NextPreview preview={step.nextStepPreview} />}
    </div>
  );
}
