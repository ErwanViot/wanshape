import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { DailyNutritionBrief } from '../../types/nutrition.ts';

export interface MonthHeatmapProps {
  /** Up to 30 daily briefs, oldest first. */
  days: DailyNutritionBrief[];
  targetCalories: number | null;
  /** YYYYMMDD that should never link itself (typically today). */
  todayKey: string;
}

/**
 * Computes a Tailwind background class for a single cell. Tiers are
 * intentionally coarse — three buckets keeps the heatmap readable on a
 * 30-cell grid where colour is just a hint, not a metric.
 *
 * - No entries → muted base
 * - Has entries, no target → neutral filled
 * - Has entries with target: <60% / 60-100% / >100% → 3 brand tints
 */
function cellClass(brief: DailyNutritionBrief, target: number | null): string {
  if (!brief.hasEntries) return 'bg-divider';
  if (target == null) return 'bg-brand/30';
  const pct = brief.totals.calories / target;
  if (pct < 0.6) return 'bg-brand/20';
  if (pct <= 1) return 'bg-brand/60';
  return 'bg-brand/85';
}

export function MonthHeatmap({ days, targetCalories, todayKey }: MonthHeatmapProps) {
  const { t } = useTranslation('nutrition');

  return (
    <ul aria-label={t('history.month_heading')} className="grid grid-cols-10 gap-1.5 list-none p-0">
      {days.map((d) => {
        const cal = Math.round(d.totals.calories);
        const queryString = d.date === todayKey ? '' : `?d=${d.date}`;
        const ariaLabel = d.hasEntries
          ? t('history.cell_aria_filled', { date: d.date, calories: cal })
          : t('history.cell_aria_empty', { date: d.date });

        return (
          <li key={d.date}>
            <Link
              to={`/nutrition${queryString}`}
              aria-label={ariaLabel}
              className={`block aspect-square rounded-md transition-colors hover:ring-2 hover:ring-brand/60 ${cellClass(d, targetCalories)}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
