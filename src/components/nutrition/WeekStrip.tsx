import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { DailyNutritionBrief } from '../../types/nutrition.ts';
import { formatDateLabel } from '../../utils/nutritionDate.ts';

export interface WeekStripProps {
  /** Up to 7 daily briefs, oldest first. */
  days: DailyNutritionBrief[];
  targetCalories: number | null;
  /** YYYYMMDD that should never link itself (typically today). */
  todayKey: string;
}

/**
 * Compact 7-day strip. Each cell is a Link that drills into /nutrition?d=YYYYMMDD,
 * letting the user log meals for that day via PR 1's DateSelector.
 */
export function WeekStrip({ days, targetCalories, todayKey }: WeekStripProps) {
  const { t, i18n } = useTranslation('nutrition');

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const label = formatDateLabel(d.date, {
          locale: i18n.language,
          labels: {
            today: t('date_selector.today'),
            yesterday: t('date_selector.yesterday'),
            tomorrow: t('date_selector.tomorrow'),
          },
        });
        const cal = Math.round(d.totals.calories);
        const pct = targetCalories ? Math.min(120, Math.round((cal / targetCalories) * 100)) : null;
        const queryString = d.date === todayKey ? '' : `?d=${d.date}`;
        const href = `/nutrition${queryString}`;

        return (
          <Link
            key={d.date}
            to={href}
            className="flex flex-col items-center gap-1 rounded-xl border border-divider bg-surface px-1.5 py-2 hover:border-brand/40 hover:bg-divider transition-colors"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted truncate max-w-full">
              {label}
            </span>
            <span className="text-sm font-bold text-heading leading-tight">{d.hasEntries ? cal : '–'}</span>
            {pct != null && d.hasEntries && (
              <span className="text-[10px] text-muted leading-none">{t('history.target_pct', { pct })}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
