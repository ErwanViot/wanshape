import { LOADING_PHASES } from './formOptions.ts';

export interface GeneratingOverlayProps {
  phase: number;
}

export function GeneratingOverlay({ phase }: GeneratingOverlayProps) {
  const progressPct = Math.min(95, ((phase + 1) / LOADING_PHASES.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="text-center space-y-6 px-6 max-w-sm">
        <div className="w-12 h-12 border-3 border-divider-strong border-t-brand rounded-full animate-spin mx-auto" />
        <p className="text-lg font-semibold text-heading">{LOADING_PHASES[phase].text}</p>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-secondary transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-faint">Estimation : 30-60 secondes</p>
      </div>
    </div>
  );
}
