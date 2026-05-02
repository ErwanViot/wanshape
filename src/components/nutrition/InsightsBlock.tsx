import { useTranslation } from 'react-i18next';
import type { NutritionRangeSummary } from '../../types/nutrition.ts';

export interface InsightsBlockProps {
  summary: NutritionRangeSummary;
  /** Number of days the visible range spans (e.g. 30). */
  rangeDays: number;
}

/**
 * Factual stats only — no judgement, no streak, no goal-pressure phrasing.
 * Items are rendered conditionally so an empty range stays silent rather
 * than show "0 days hit your target", which would feel scolding.
 */
export function InsightsBlock({ summary, rangeDays }: InsightsBlockProps) {
  const { t } = useTranslation('nutrition');

  const items: string[] = [];
  if (summary.avgCalories7d != null) {
    items.push(t('history.avg_kcal_week', { n: summary.avgCalories7d }));
  }
  if (summary.avgCaloriesRange != null) {
    items.push(t('history.avg_kcal_range', { n: summary.avgCaloriesRange, days: rangeDays }));
  }
  if (summary.daysHittingTargetWeek != null && summary.daysHittingTargetWeek > 0) {
    items.push(t('history.target_days_week', { n: summary.daysHittingTargetWeek }));
  }
  const daysWithoutEntries = summary.days.length - summary.daysWithEntries;
  if (daysWithoutEntries > 0 && summary.daysWithEntries > 0) {
    items.push(t('history.days_without_entry', { n: daysWithoutEntries, days: rangeDays }));
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">{t('history.no_insights_yet')}</p>;
  }

  return (
    <ul className="space-y-1.5 text-sm text-body">
      {items.map((line) => (
        <li key={line} className="flex items-start gap-2">
          <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
