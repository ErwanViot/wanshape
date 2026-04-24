import { useTranslation } from 'react-i18next';
import type { AtomicStep } from '../types/player.ts';
import { ExerciseVideoButton } from './ExerciseVideoButton.tsx';
import { NextPreview } from './NextPreview.tsx';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  showVideos: boolean;
  onToggleShowVideos: () => void;
}

export function ExerciseView({ step, remaining, progress, showVideos, onToggleShowVideos }: Props) {
  const { t } = useTranslation('player');
  const pulse = remaining <= 3 && remaining > 0;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Context */}
      <div className="text-white/50 text-sm">
        {step.roundInfo && (
          <span>{t('exercise_view.round', { current: step.roundInfo.current, total: step.roundInfo.total })}</span>
        )}
        {step.setInfo && (
          <span>{t('exercise_view.set', { current: step.setInfo.current, total: step.setInfo.total })}</span>
        )}
        {step.intervalInfo && (
          <span className="ml-2">
            {t('exercise_view.interval', { current: step.intervalInfo.current, total: step.intervalInfo.total })}
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
      {step.tempo && (
        <p className="text-white/40 text-sm font-mono">{t('exercise_view.tempo', { value: step.tempo })}</p>
      )}

      {/* Video demo */}
      <ExerciseVideoButton
        exerciseName={step.exerciseName}
        alwaysShow={showVideos}
        onToggleAlwaysShow={onToggleShowVideos}
      />

      {/* Next preview */}
      {step.nextStepPreview && <NextPreview preview={step.nextStepPreview} />}
    </div>
  );
}
