import { Utensils } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useNutritionProfile } from '../../hooks/useNutritionProfile.ts';
import { useNutritionRange } from '../../hooks/useNutritionRange.ts';
import { shiftYYYYMMDD, todayYYYYMMDD } from '../../utils/nutritionDate.ts';

const WEEK_DAYS = 7;

/**
 * 7-day rolling nutrition widget for /suivi. Shows mini-bars sized by
 * % of calorie target (or just by absolute kcal when no target is set)
 * and a one-line average. Hidden for visitors via parent gating.
 *
 * No IntersectionObserver gate here, by design: on /suivi the widget
 * lives below `RecentSessions` but is still in the user's first
 * meaningful viewport on most devices, and the 7-day fetch is much
 * cheaper than the 30-day one used by NutritionHistorySection.
 */
export function NutritionWidget7d() {
  const { t } = useTranslation('nutrition');
  const { profile } = useNutritionProfile();
  const targetCalories = profile?.target_calories ?? null;

  const [bounds] = useState(() => {
    const today = todayYYYYMMDD();
    const start = shiftYYYYMMDD(today, -(WEEK_DAYS - 1)) ?? today;
    return { startDate: start, endDate: today };
  });

  const { summary, loading } = useNutritionRange(bounds.startDate, bounds.endDate);

  // Choose a denominator for the bar height: target if set, else the max
  // observed value in the window so bars stay relative to each other.
  const maxObserved = summary?.days.reduce((m, d) => Math.max(m, d.totals.calories), 0) ?? 0;
  const denom = targetCalories ?? Math.max(maxObserved, 1);

  return (
    <Link
      to="/nutrition"
      aria-label={t('widget7d.aria')}
      className="flex flex-col gap-3 rounded-2xl border border-card-border bg-surface-card p-5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 transition-all"
    >
      <div className="flex items-center gap-2">
        <Utensils className="w-4 h-4 text-brand" aria-hidden="true" />
        <h3 className="font-display text-base font-bold text-heading">{t('widget7d.heading')}</h3>
      </div>

      {loading || !summary ? (
        <div className="flex items-end gap-1.5 h-16">
          {Array.from({ length: WEEK_DAYS }).map((_, i) => (
            <div key={`bar-skel-${i}`} className="flex-1 skeleton rounded-t" style={{ height: '40%' }} />
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-1.5 h-16" aria-hidden="true">
          {summary.days.map((d) => {
            const ratio = d.hasEntries ? Math.min(1, d.totals.calories / denom) : 0;
            const heightPct = Math.max(6, Math.round(ratio * 100));
            // height: <pct>% on a flex child needs the parent to expose a
            // resolved height — we set it on the bar directly (sibling of the
            // h-16 row) instead of nesting an extra wrapper that drops it.
            return (
              <div
                key={d.date}
                className={`flex-1 rounded-t ${d.hasEntries ? 'bg-brand/70' : 'bg-divider'}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>
      )}

      {summary?.avgCalories7d != null ? (
        <p className="text-xs text-muted">{t('history.avg_kcal_week', { n: summary.avgCalories7d })}</p>
      ) : (
        <p className="text-xs text-muted">{t('widget7d.no_data')}</p>
      )}
    </Link>
  );
}
