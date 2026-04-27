import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LOADING_PHASES_COUNT } from './formOptions.ts';

export interface GeneratingOverlayProps {
  phase: number;
}

export function GeneratingOverlay({ phase }: GeneratingOverlayProps) {
  const { t } = useTranslation('programs');
  const progressPct = Math.min(95, ((phase + 1) / LOADING_PHASES_COUNT) * 100);

  return (
    <output
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 backdrop-blur-sm"
      aria-live="polite"
    >
      <div className="text-center space-y-6 px-6 max-w-md w-full">
        <div className="w-12 h-12 border-3 border-divider-strong border-t-brand rounded-full animate-spin mx-auto" />

        <p className="text-lg font-semibold text-heading">{t('generating.title')}</p>

        <ul className="space-y-2 text-left">
          {Array.from({ length: LOADING_PHASES_COUNT }, (_, i) => {
            const isDone = i < phase;
            const isActive = i === phase;
            return (
              <li
                key={i}
                className={`flex items-start gap-3 text-sm transition-opacity duration-300 ${
                  isDone ? 'text-body' : isActive ? 'text-heading font-medium' : 'text-faint opacity-60'
                }`}
              >
                <span
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isActive
                        ? 'bg-brand/20 text-brand'
                        : 'bg-white/5 text-faint'
                  }`}
                  aria-hidden="true"
                >
                  {isDone ? (
                    <Check className="w-3 h-3" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  ) : null}
                </span>
                <span>{t(`loading_phases.${i}`)}</span>
              </li>
            );
          })}
        </ul>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-secondary transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-faint">{t('generating.estimate')}</p>
      </div>
    </output>
  );
}
