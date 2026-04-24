import { useTranslation } from 'react-i18next';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export function WeekDots({ weekDots }: { weekDots: boolean[] }) {
  const { t } = useTranslation('stats');
  const activeDays = weekDots.filter(Boolean).length;

  return (
    <section aria-label={t(activeDays === 1 ? 'week_dots.aria' : 'week_dots.aria_other', { n: activeDays })}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">{t('week_dots.heading')}</p>
        <p className="text-xs text-muted">
          {t(activeDays === 1 ? 'week_dots.activity_one' : 'week_dots.activity_other', { n: activeDays })}
        </p>
      </div>
      <div className="flex gap-2">
        {weekDots.map((done, i) => (
          <div key={i} className={`flex-1 flex flex-col items-center gap-2 stagger-fade-in stagger-${i + 1}`}>
            <div
              className={`w-full aspect-square max-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                done ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-surface-2 border-2 border-divider-strong'
              }`}
            >
              {done && (
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-400"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-medium text-muted">{t(`week_dots.day_${DAY_KEYS[i]}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
