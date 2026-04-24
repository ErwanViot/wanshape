import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MealLog } from '../../types/nutrition.ts';

interface MealCardProps {
  meal: MealLog;
  onDelete?: (id: string) => void;
}

function formatMacro(value: number | null | undefined, suffix: string): string | null {
  if (value == null) return null;
  return `${Math.round(value)} ${suffix}`;
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const { t } = useTranslation('nutrition');
  const macros = [
    formatMacro(meal.protein_g, 'g P'),
    formatMacro(meal.carbs_g, 'g G'),
    formatMacro(meal.fat_g, 'g L'),
  ].filter((v): v is string => v !== null);

  return (
    <article className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface-card border border-divider">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-heading truncate">{meal.name}</p>
          <span className="shrink-0 font-display text-sm font-bold text-brand">
            {Math.round(meal.calories ?? 0)} kcal
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted">
          <span className="uppercase tracking-wider">
            {meal.source === 'manual'
              ? t('meal_card.source_manual')
              : meal.source === 'ciqual'
                ? t('meal_card.source_ciqual')
                : meal.source === 'barcode'
                  ? t('meal_card.source_barcode')
                  : t('meal_card.source_ai')}
          </span>
          {meal.quantity_grams != null && <span>{Math.round(meal.quantity_grams)} g</span>}
          {macros.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(meal.id)}
          aria-label={t('meal_card.delete_aria', { name: meal.name })}
          className="shrink-0 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-divider transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
