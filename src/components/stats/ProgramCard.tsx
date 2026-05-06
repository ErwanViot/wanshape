import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { useActiveProgram } from '../../hooks/useProgram.ts';
import { localizedProgramFields } from '../../utils/programLocale.ts';
import { localizedSessionData } from '../../utils/sessionLocale.ts';
import { AnimatedNumber } from './AnimatedNumber.tsx';

export interface ProgramCardProps {
  activeProgram: NonNullable<ReturnType<typeof useActiveProgram>['activeProgram']>;
  progressPct: number;
}

export function ProgramCard({ activeProgram, progressPct }: ProgramCardProps) {
  const { t } = useTranslation(['stats', 'programs_data', 'sessions_data']);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);

  const localizedProgram = localizedProgramFields(activeProgram, t);
  const nextSessionTitle =
    activeProgram.nextSessionData && activeProgram.nextSessionOrder != null
      ? localizedSessionData(activeProgram.slug, activeProgram.nextSessionOrder, activeProgram.nextSessionData, t).title
      : activeProgram.nextSessionTitle;

  return (
    <div className="flex items-center gap-5">
      {/* SVG donut */}
      <div className="relative shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-divider-strong)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
            style={{ transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber
            value={progressPct}
            formatter={(n) => `${Math.round(n)}%`}
            className="font-display text-lg font-black text-heading"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">{t('program_card.active_label')}</p>
        <p className="text-base font-bold text-heading group-hover:text-brand transition-colors truncate">
          {localizedProgram.title}
        </p>
        <p className="text-xs text-muted mt-1">
          {t('program_card.sessions_progress', {
            completed: activeProgram.completedCount,
            total: activeProgram.totalSessions,
          })}
        </p>
        {nextSessionTitle && (
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            {t('program_card.next_session')}{' '}
            <span className="text-heading font-semibold truncate">{nextSessionTitle}</span>
            <ChevronRight className="w-3 h-3 text-muted shrink-0" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}
