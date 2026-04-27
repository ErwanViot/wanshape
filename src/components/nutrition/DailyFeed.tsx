import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MEAL_TYPES } from '../../config/nutrition.ts';
import type { MealLog, MealType } from '../../types/nutrition.ts';
import { MealCard } from './MealCard.tsx';

interface DailyFeedProps {
  byMealType: Partial<Record<MealType, MealLog[]>>;
  onAdd: (mealType: MealType) => void;
  onDelete: (id: string) => void;
}

function sumCalories(logs: MealLog[] | undefined): number {
  if (!logs) return 0;
  return Math.round(logs.reduce((acc, l) => acc + (l.calories ?? 0), 0));
}

export function DailyFeed({ byMealType, onAdd, onDelete }: DailyFeedProps) {
  const { t } = useTranslation('nutrition');
  return (
    <div className="space-y-6">
      {MEAL_TYPES.map((mealType) => {
        const logs = byMealType[mealType];
        const kcal = sumCalories(logs);
        return (
          <section key={mealType} aria-labelledby={`meal-${mealType}`}>
            <header className="flex items-center justify-between mb-2">
              <h3 id={`meal-${mealType}`} className="font-display text-base font-bold text-heading">
                {t(`meal_type.${mealType}`)}
                {kcal > 0 && <span className="ml-2 text-xs font-medium text-muted">{kcal} kcal</span>}
              </h3>
              <button
                type="button"
                onClick={() => onAdd(mealType)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
                aria-label={t('daily_feed.add_aria', { mealType: t(`meal_type.${mealType}`) })}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('daily_feed.add_btn')}
              </button>
            </header>
            {logs && logs.length > 0 ? (
              <ul className="space-y-2">
                {logs.map((meal) => (
                  <li key={meal.id}>
                    <MealCard meal={meal} onDelete={onDelete} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted italic pl-1">{t('daily_feed.empty')}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
