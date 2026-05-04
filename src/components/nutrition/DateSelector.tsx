import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateLabel, shiftYYYYMMDD } from '../../utils/nutritionDate.ts';

export interface DateSelectorProps {
  dateKey: string;
  minDateKey: string;
  maxDateKey: string;
  onChange: (next: string) => void;
}

export function DateSelector({ dateKey, minDateKey, maxDateKey, onChange }: DateSelectorProps) {
  const { t, i18n } = useTranslation('nutrition');

  const canGoPrev = dateKey > minDateKey;
  const canGoNext = dateKey < maxDateKey;
  const isToday = dateKey === maxDateKey;

  const label = formatDateLabel(dateKey, {
    locale: i18n.language,
    labels: {
      today: t('date_selector.today'),
      yesterday: t('date_selector.yesterday'),
      tomorrow: t('date_selector.tomorrow'),
    },
  });

  function handlePrev() {
    const next = shiftYYYYMMDD(dateKey, -1);
    if (next && next >= minDateKey) onChange(next);
  }

  function handleNext() {
    const next = shiftYYYYMMDD(dateKey, 1);
    if (next && next <= maxDateKey) onChange(next);
  }

  return (
    <div className="flex items-center justify-center gap-1 rounded-xl bg-surface border border-divider p-1">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label={t('date_selector.previous_day')}
        className="p-2 rounded-lg text-body hover:bg-divider transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>
      <div className="flex-1 text-center px-3 py-1 min-w-[10rem]">
        <span className="text-sm font-semibold text-heading capitalize">{label}</span>
        {!isToday && (
          <button
            type="button"
            onClick={() => onChange(maxDateKey)}
            className="block w-full text-[11px] text-brand hover:underline mt-0.5"
          >
            {t('date_selector.back_to_today')}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label={t('date_selector.next_day')}
        className="p-2 rounded-lg text-body hover:bg-divider transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
