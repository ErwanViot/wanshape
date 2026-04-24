import { useTranslation } from 'react-i18next';
import type { AtomicStep } from '../types/player.ts';
import { TimerDisplay } from './TimerDisplay.tsx';

interface Props {
  step: AtomicStep;
  remaining: number;
  progress: number;
  onSkip: () => void;
}

export function RestView({ step, remaining, progress, onSkip }: Props) {
  const { t } = useTranslation('player');

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white/70">{t('rest_view.title')}</h2>

      {/* Context: round/set info */}
      <div className="text-white/50 text-sm">
        {step.roundInfo && (
          <span>{t('rest_view.round', { current: step.roundInfo.current, total: step.roundInfo.total })}</span>
        )}
        {step.roundInfo && step.setInfo && <span> · </span>}
        {step.setInfo && (
          <span>{t('rest_view.set', { current: step.setInfo.current, total: step.setInfo.total })}</span>
        )}
        {step.intervalInfo && (
          <span className="ml-2">
            {t('rest_view.interval', { current: step.intervalInfo.current, total: step.intervalInfo.total })}
          </span>
        )}
      </div>

      {/* Timer */}
      <TimerDisplay remaining={remaining} progress={progress} color={step.blockColor} size="medium" />

      {/* Next exercise info */}
      <p className="text-white/80 text-lg">{step.instructions}</p>

      {/* Skip button */}
      <button
        type="button"
        onClick={onSkip}
        className="px-6 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium active:bg-white/20 transition-colors"
      >
        {t('rest_view.skip')}
      </button>
    </div>
  );
}
