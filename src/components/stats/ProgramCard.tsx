import { ChevronRight } from 'lucide-react';
import type { useActiveProgram } from '../../hooks/useProgram.ts';

export interface ProgramCardProps {
  activeProgram: NonNullable<ReturnType<typeof useActiveProgram>['activeProgram']>;
  progressPct: number;
}

export function ProgramCard({ activeProgram, progressPct }: ProgramCardProps) {
  // SVG donut chart
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);

  return (
    <div className="flex items-center gap-5">
      {/* Donut */}
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
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-black text-heading">{progressPct}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">Programme en cours</p>
        <p className="text-base font-bold text-heading group-hover:text-brand transition-colors truncate">
          {activeProgram.title}
        </p>
        <p className="text-xs text-muted mt-1">
          {activeProgram.completedCount}/{activeProgram.totalSessions} séances
        </p>
        {activeProgram.nextSessionTitle && (
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            Prochaine : <span className="text-heading font-semibold truncate">{activeProgram.nextSessionTitle}</span>
            <ChevronRight className="w-3 h-3 text-muted shrink-0" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}
