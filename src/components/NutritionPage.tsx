import { Settings2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDailyNutrition } from '../hooks/useDailyNutrition.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useNutritionProfile } from '../hooks/useNutritionProfile.ts';
import { useTodayInsight } from '../hooks/useTodayInsight.ts';
import type { OpenFoodFactsProduct } from '../lib/openFoodFacts.ts';
import type { FoodReference, MealLogInsert, MealType } from '../types/nutrition.ts';
import { CalorieRing } from './nutrition/CalorieRing.tsx';
import { DailyFeed } from './nutrition/DailyFeed.tsx';
import { InsightCard } from './nutrition/InsightCard.tsx';
import { MealEntryForm } from './nutrition/MealEntryForm.tsx';

export function NutritionPage() {
  const { t } = useTranslation('nutrition');
  useDocumentHead({
    title: t('page.title'),
    description: t('page.description'),
  });

  const { profile: authProfile } = useAuth();
  const isPremium = authProfile?.subscription_tier === 'premium';
  const { profile } = useNutritionProfile();
  const { summary, loading, error, addMeal, deleteMeal } = useDailyNutrition();
  const { insight, setInsight } = useTodayInsight();
  const [formOpen, setFormOpen] = useState(false);
  const [initialMealType, setInitialMealType] = useState<MealType>('breakfast');
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!formOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFormOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Move focus into the modal so keyboard users land inside.
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [formOpen]);

  const target = {
    calories: profile?.target_calories ?? null,
    protein_g: profile?.target_protein_g ?? null,
    carbs_g: profile?.target_carbs_g ?? null,
    fat_g: profile?.target_fat_g ?? null,
  };

  function handleAdd(mealType: MealType) {
    setInitialMealType(mealType);
    setFormOpen(true);
  }

  async function handleSubmit(input: Omit<MealLogInsert, 'user_id' | 'logged_date'>): Promise<boolean> {
    const result = await addMeal(input);
    return result != null;
  }

  async function handleSearchSelect(food: FoodReference, quantityGrams: number, mealType: MealType): Promise<boolean> {
    const factor = quantityGrams / 100;
    const scaled = (per100: number | null) => (per100 != null ? Math.round(per100 * factor * 10) / 10 : null);
    // OFF results from the search fallback share the same data source as a
    // scanned barcode (the OFF database, indexed by EAN). The DB CHECK only
    // allows ('manual','ciqual','barcode','ai_text','overflow_insight'), so
    // we fold OFF text-search results into 'barcode' rather than introduce
    // a new value via migration. reference_id is the barcode either way.
    const isOff = food.source === 'off';
    const result = await addMeal({
      meal_type: mealType,
      source: isOff ? 'barcode' : 'ciqual',
      name: food.name_fr.slice(0, 200),
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

  async function handleBarcodeSelect(
    product: OpenFoodFactsProduct,
    quantityGrams: number,
    mealType: MealType,
  ): Promise<boolean> {
    const factor = quantityGrams / 100;
    const scaled = (per100: number | null) => (per100 != null ? Math.round(per100 * factor * 10) / 10 : null);
    const name = product.brand ? `${product.name} (${product.brand})` : product.name;
    const result = await addMeal({
      meal_type: mealType,
      source: 'barcode',
      name: name.slice(0, 200),
      calories: scaled(product.calories_100g) ?? 0,
      protein_g: scaled(product.protein_100g),
      carbs_g: scaled(product.carbs_100g),
      fat_g: scaled(product.fat_100g),
      quantity_grams: Math.round(quantityGrams * 10) / 10,
      reference_id: product.barcode,
      ai_metadata: null,
      notes: null,
    });
    return result != null;
  }

  const macroRow = [
    { label: t('page.macro_protein'), value: summary.totals.protein_g, target: target.protein_g, suffix: 'g' },
    { label: t('page.macro_carbs'), value: summary.totals.carbs_g, target: target.carbs_g, suffix: 'g' },
    { label: t('page.macro_fat'), value: summary.totals.fat_g, target: target.fat_g, suffix: 'g' },
  ];

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-heading">{t('page.heading')}</h1>
            <p className="text-sm text-muted mt-1">{t('page.subtitle')}</p>
          </div>
          <Link
            to="/nutrition/setup"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-body border border-divider hover:bg-divider transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" aria-hidden="true" />
            {profile?.target_calories != null ? t('page.edit_target') : t('page.set_target')}
          </Link>
        </header>

        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-2xl bg-surface-card border border-card-border p-6">
          <div className="shrink-0">
            <CalorieRing current={summary.totals.calories} target={target.calories} size={160} strokeWidth={12} />
          </div>
          <div className="flex-1 w-full space-y-3">
            {target.calories == null && <p className="text-sm text-body">{t('page.awareness_mode')}</p>}
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

        <InsightCard insight={insight} isPremium={isPremium} onGenerated={setInsight} />

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
          <div className="fixed inset-0 z-[60] h-[100dvh] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <button
              type="button"
              aria-label={t('page.close_modal_aria')}
              onClick={() => setFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            />
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('page.add_meal_modal_aria')}
              tabIndex={-1}
              className="relative w-full max-w-lg max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl sm:rounded-2xl bg-surface border border-card-border p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 shadow-xl focus:outline-none"
            >
              <MealEntryForm
                mealType={initialMealType}
                isPremium={isPremium}
                onSubmit={handleSubmit}
                onSearchSelect={handleSearchSelect}
                onBarcodeSelect={handleBarcodeSelect}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          </div>
        )}

        <footer className="text-center text-[11px] text-muted">{t('page.footer_source')}</footer>
      </div>
    </div>
  );
}
