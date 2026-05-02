import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNutritionProfile } from '../../hooks/useNutritionProfile.ts';
import { useNutritionRange } from '../../hooks/useNutritionRange.ts';
import { shiftYYYYMMDD, todayYYYYMMDD } from '../../utils/nutritionDate.ts';
import { InsightsBlock } from './InsightsBlock.tsx';
import { MonthHeatmap } from './MonthHeatmap.tsx';
import { WeekStrip } from './WeekStrip.tsx';

const RANGE_DAYS = 30;

/**
 * Lazy-mounts the historical sections (week strip, monthly heatmap, insights)
 * once the user scrolls them into view. Mirrors the IntersectionObserver
 * pattern used by ExerciseVideo so we don't introduce a new dependency.
 *
 * The hook query is gated on visibility — first paint of /nutrition stays
 * focused on the today block; the 30d range scan only fires when needed.
 */
export function NutritionHistorySection() {
  const { t } = useTranslation('nutrition');
  const { profile } = useNutritionProfile();
  const targetCalories = profile?.target_calories ?? null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Pin the date range at mount so a midnight rollover doesn't shift the
  // range under us between renders.
  const [bounds] = useState(() => {
    const today = todayYYYYMMDD();
    const start = shiftYYYYMMDD(today, -(RANGE_DAYS - 1)) ?? today;
    return { startDate: start, endDate: today, today };
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  const { summary, loading, error } = useNutritionRange(bounds.startDate, bounds.endDate, { enabled: isVisible });

  return (
    <section ref={containerRef} className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-heading">{t('history.week_heading')}</h2>
        {!isVisible || loading ? (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`week-skel-${i}`} className="skeleton aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : summary ? (
          <WeekStrip days={summary.days.slice(-7)} targetCalories={targetCalories} todayKey={bounds.today} />
        ) : null}
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-heading">{t('history.month_heading')}</h2>
        {!isVisible || loading ? (
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: RANGE_DAYS }).map((_, i) => (
              <div key={`month-skel-${i}`} className="skeleton aspect-square rounded-md" />
            ))}
          </div>
        ) : summary ? (
          <MonthHeatmap days={summary.days} targetCalories={targetCalories} todayKey={bounds.today} />
        ) : null}
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-heading">{t('history.insights_heading')}</h2>
        {!isVisible || loading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        ) : summary ? (
          <InsightsBlock summary={summary} rangeDays={RANGE_DAYS} />
        ) : null}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  );
}
