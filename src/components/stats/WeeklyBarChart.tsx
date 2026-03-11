import { useState } from 'react';
import type { WeeklyData } from '../../hooks/useHistory.ts';

export function WeeklyBarChart({ data }: { data: WeeklyData[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">Volume hebdo</p>
        <p className="text-xs text-muted">
          {activeIdx != null ? (
            <span className="text-heading font-semibold">
              {data[activeIdx].minutes} min · {data[activeIdx].sessions} séance{data[activeIdx].sessions > 1 ? 's' : ''}
            </span>
          ) : (
            'min / semaine'
          )}
        </p>
      </div>
      <div className="flex items-end gap-2 flex-1 min-h-[120px]">
        {data.map((week, i) => {
          const heightPct = Math.max((week.minutes / maxMinutes) * 100, 4);
          const isActive = activeIdx === i;
          return (
            <button
              key={week.label}
              type="button"
              onClick={() => setActiveIdx(isActive ? null : i)}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              aria-label={`${week.label} : ${week.minutes} minutes, ${week.sessions} séance${week.sessions > 1 ? 's' : ''}`}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-lg transition-all duration-200 ${
                    week.isCurrent
                      ? 'bg-brand shadow-sm shadow-brand/30'
                      : isActive
                        ? 'bg-brand/60'
                        : 'bg-divider-strong group-hover:bg-brand/30'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${week.isCurrent ? 'text-brand font-bold' : 'text-muted'}`}>
                {week.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
