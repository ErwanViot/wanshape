import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRecurringMeals } from '../../hooks/useRecurringMeals.ts';
import type { MealLogInsert, MealType } from '../../types/nutrition.ts';
import type { RecurringMeal } from '../../utils/recurringMeals.ts';

export type RecurringMealPrefill = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export interface RecurringMealsBlockProps {
  mealType: MealType;
  /** Called when the user taps a card to add it as-is. */
  onQuickAdd: (input: Omit<MealLogInsert, 'user_id' | 'logged_date'>) => Promise<boolean>;
  /** Called when the user taps the edit pencil to tweak before adding. */
  onEdit: (prefill: RecurringMealPrefill) => void;
}

function toMealLogInsert(meal: RecurringMeal, mealType: MealType): Omit<MealLogInsert, 'user_id' | 'logged_date'> {
  return {
    meal_type: mealType,
    source: meal.source,
    name: meal.name,
    calories: meal.calories,
    protein_g: meal.protein_g,
    carbs_g: meal.carbs_g,
    fat_g: meal.fat_g,
    quantity_grams: meal.quantity_grams,
    reference_id: meal.reference_id,
    ai_metadata: null,
    notes: null,
  };
}

function toPrefill(meal: RecurringMeal): RecurringMealPrefill {
  const macro = (v: number | null) => (v != null ? String(v) : '');
  return {
    name: meal.name,
    calories: String(Math.round(meal.calories)),
    protein: macro(meal.protein_g),
    carbs: macro(meal.carbs_g),
    fat: macro(meal.fat_g),
  };
}

export function RecurringMealsBlock({ mealType, onQuickAdd, onEdit }: RecurringMealsBlockProps) {
  const { t } = useTranslation('nutrition');
  const { items, loading } = useRecurringMeals(mealType);

  if (loading || items.length === 0) return null;

  return (
    <section aria-labelledby="recurring-meals-heading" className="space-y-2">
      <h3 id="recurring-meals-heading" className="text-xs font-medium text-body">
        {t('recurring.heading')}
      </h3>
      <ul className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1 snap-x snap-mandatory">
        {items.map((meal) => (
          <li key={meal.signature} className="snap-start shrink-0 w-44">
            <article className="relative h-full flex flex-col rounded-xl bg-surface-card border border-divider p-3">
              <button
                type="button"
                onClick={() => onQuickAdd(toMealLogInsert(meal, mealType))}
                className="flex-1 text-left -m-3 p-3 pb-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={t('recurring.quick_add_aria', { name: meal.name })}
              >
                <p className="text-sm font-medium text-heading line-clamp-2 leading-snug">{meal.name}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {Math.round(meal.calories)} kcal
                  {meal.quantity_grams != null && ` · ${Math.round(meal.quantity_grams)} g`}
                </p>
              </button>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {t('recurring.count', { count: meal.count })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(toPrefill(meal))}
                    aria-label={t('recurring.edit_aria', { name: meal.name })}
                    className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-divider transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickAdd(toMealLogInsert(meal, mealType))}
                    aria-label={t('recurring.quick_add_aria', { name: meal.name })}
                    className="p-1.5 rounded-lg text-white bg-brand hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
