import { useTranslation } from 'react-i18next';
import type { AtomicStep } from '../types/player.ts';
import { ExerciseListWithVideos } from './ExerciseListWithVideos.tsx';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  showVideos: boolean;
  onToggleShowVideos: () => void;
}

export function EMOMView({ step, remaining, progress, showVideos, onToggleShowVideos }: Props) {
  const { t } = useTranslation('player');

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Minute indicator */}
      <div className="text-white/50 text-sm font-medium">
        {step.roundInfo && t('emom_view.minute', { current: step.roundInfo.current, total: step.roundInfo.total })}
      </div>

      {/* Block name + explanation */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">{step.blockName}</h2>
        <p className="text-white/60 text-sm">{t('emom_view.explanation')}</p>
      </div>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} />

      {/* Exercise list with video demos */}
      {step.emomExercises && (
        <ExerciseListWithVideos
          exercises={step.emomExercises}
          blockColor={step.blockColor}
          showVideos={showVideos}
          onToggleShowVideos={onToggleShowVideos}
        />
      )}
    </div>
  );
}
