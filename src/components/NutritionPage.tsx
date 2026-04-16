import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useDailyNutrition } from '../hooks/useDailyNutrition.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useNutritionProfile } from '../hooks/useNutritionProfile.ts';
import type { FoodReference, MealLogInsert, MealType } from '../types/nutrition.ts';
import { CalorieRing } from './nutrition/CalorieRing.tsx';
import { DailyFeed } from './nutrition/DailyFeed.tsx';
import { MealEntryForm } from './nutrition/MealEntryForm.tsx';

export function NutritionPage() {
  useDocumentHead({
    title: 'Nutrition · Wan2Fit',
    description: 'Suis tes apports caloriques et macros au fil de la journée.',
  });

  const { profile } = useNutritionProfile();
  const { summary, loading, error, addMeal, deleteMeal } = useDailyNutrition();
  const [formOpen, setFormOpen] = useState(false);
  const [initialMealType, setInitialMealType] = useState<MealType>('breakfast');

  function handleAdd(mealType: MealType) {
    setInitialMealType(mealType);
    setFormOpen(true);
  }

  async function handleSubmit(input: Omit<MealLogInsert, 'user_id' | 'logged_date'>): Promise<boolean> {
    const result = await addMeal(input);
    return result != null;
  }

  async function handleSearchSelect(food: FoodReference, quantityGrams: number): Promise<boolean> {
    const factor = quantityGrams / 100;
    const scaled = (per100: number | null) => (per100 != null ? Math.round(per100 * factor * 10) / 10 : null);
    const result = await addMeal({
      meal_type: initialMealType,
      source: 'ciqual',
      name: food.name_fr,
      calories: scaled(food.calories_100g) ?? 0,
      protein_g: scaled(food.protein_100g),
      carbs_g: scaled(food.carbs_100g),
      fat_g: scaled(food.fat_100g),
      quantity_grams: Math.round(quantityGrams * 10) / 10,
      reference_id: food.id,
      ai_metadata: null,
      notes: null,
    });
    return result != null;
  }

  const macroRow = [
    { label: 'Protéines', value: summary.totals.protein_g, target: summary.target.protein_g, suffix: 'g' },
    { label: 'Glucides', value: summary.totals.carbs_g, target: summary.target.carbs_g, suffix: 'g' },
    { label: 'Lipides', value: summary.totals.fat_g, target: summary.target.fat_g, suffix: 'g' },
  ];

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-heading">Nutrition</h1>
            <p className="text-sm text-muted mt-1">Ta journée en un coup d'œil.</p>
          </div>
          <Link
            to="/nutrition/setup"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-body border border-divider hover:bg-divider transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
            {profile?.target_calories != null ? 'Modifier la cible' : 'Définir une cible'}
          </Link>
        </header>

        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-2xl bg-surface-card border border-card-border p-6">
          <div className="shrink-0">
            <CalorieRing
              current={summary.totals.calories}
              target={summary.target.calories}
              size={160}
              strokeWidth={12}
            />
          </div>
          <div className="flex-1 w-full space-y-3">
            {summary.target.calories == null && (
              <p className="text-sm text-body">
                Awareness mode : tu suis tes apports sans cible fixe. Active-la quand tu veux.
              </p>
            )}
            <dl className="grid grid-cols-3 gap-3">
              {macroRow.map((m) => (
                <div key={m.label} className="rounded-xl bg-surface border border-divider p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{m.label}</dt>
                  <dd className="mt-1 text-sm font-bold text-heading">
                    {Math.round(m.value)}
                    <span className="text-xs text-muted font-normal"> {m.suffix}</span>
                    {m.target != null && (
                      <span className="block text-[11px] text-muted font-normal mt-0.5">
                        / {Math.round(m.target)} {m.suffix}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-8 w-1/3 rounded-lg" />
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        ) : (
          <DailyFeed byMealType={summary.byMealType} onAdd={handleAdd} onDelete={deleteMeal} />
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {formOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-surface border border-card-border p-6 shadow-xl">
              <MealEntryForm
                initialMealType={initialMealType}
                onSubmit={handleSubmit}
                onSearchSelect={handleSearchSelect}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          </div>
        )}

        <footer className="text-center text-[11px] text-muted">
          Base d'aliments : ANSES — Table CIQUAL (licence Etalab 2.0)
        </footer>
      </div>
    </div>
  );
}
