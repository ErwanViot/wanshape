import { X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MEAL_TYPES } from '../../config/nutrition.ts';
import type { OpenFoodFactsProduct } from '../../lib/openFoodFacts.ts';
import type { FoodReference, MealLogInsert, MealType } from '../../types/nutrition.ts';
import { AiTextPane } from './AiTextPane.tsx';
import { BarcodePane } from './BarcodePane.tsx';
import { FoodSearchInput } from './FoodSearchInput.tsx';

type Mode = 'manual' | 'search' | 'barcode' | 'ai';

interface MealEntryFormProps {
  initialMealType: MealType;
  isPremium: boolean;
  onSubmit: (input: Omit<MealLogInsert, 'user_id' | 'logged_date'>) => Promise<boolean>;
  onCancel: () => void;
  onSearchSelect?: (food: FoodReference, quantityGrams: number, mealType: MealType) => Promise<boolean>;
  onBarcodeSelect?: (product: OpenFoodFactsProduct, quantityGrams: number, mealType: MealType) => Promise<boolean>;
}

function parseMacro(raw: string): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 10) / 10;
}

function scaleByPortion(per100g: number | null | undefined, grams: number): number | null {
  if (per100g == null) return null;
  const value = (per100g * grams) / 100;
  return Math.round(value * 10) / 10;
}

export function MealEntryForm({
  initialMealType,
  isPremium,
  onSubmit,
  onCancel,
  onSearchSelect,
  onBarcodeSelect,
}: MealEntryFormProps) {
  const { t } = useTranslation('nutrition');
  const [mode, setMode] = useState<Mode>('manual');
  const modes: Mode[] = isPremium ? ['manual', 'search', 'barcode', 'ai'] : ['manual', 'search', 'barcode'];
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search tab state
  const [selectedFood, setSelectedFood] = useState<FoodReference | null>(null);
  const [portionGrams, setPortionGrams] = useState('100');

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const kcal = Number.parseFloat(calories.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(kcal) || kcal < 0) {
      setError(t('meal_form.error_required'));
      return;
    }
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        meal_type: mealType,
        source: 'manual',
        name: name.trim(),
        calories: Math.round(kcal * 10) / 10,
        protein_g: parseMacro(protein),
        carbs_g: parseMacro(carbs),
        fat_g: parseMacro(fat),
        quantity_grams: null,
        reference_id: null,
        ai_metadata: null,
        notes: notes.trim() || null,
      });
      if (ok) onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedFood) {
      setError(t('meal_form.error_food'));
      return;
    }
    const grams = Number.parseFloat(portionGrams.replace(',', '.'));
    if (!Number.isFinite(grams) || grams <= 0) {
      setError(t('meal_form.error_qty'));
      return;
    }
    setSubmitting(true);
    try {
      if (onSearchSelect) {
        const ok = await onSearchSelect(selectedFood, grams, mealType);
        if (ok) onCancel();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const scaledCalories = selectedFood
    ? scaleByPortion(selectedFood.calories_100g, Number.parseFloat(portionGrams) || 0)
    : null;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-heading">{t('meal_form.heading')}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-muted hover:text-heading hover:bg-divider"
          aria-label={t('meal_form.close_aria')}
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-divider w-full">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            aria-pressed={mode === m}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? 'bg-brand text-white' : 'text-body hover:text-heading'
            }`}
          >
            {t(`meal_form.mode_${m}`)}
          </button>
        ))}
      </div>

      <fieldset>
        <legend className="block text-xs font-medium text-body mb-1">{t('meal_form.meal_legend')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt}
              type="button"
              onClick={() => setMealType(mt)}
              aria-pressed={mealType === mt}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                mealType === mt ? 'bg-brand text-white' : 'bg-surface border border-divider text-body'
              }`}
            >
              {t(`meal_type.${mt}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'ai' ? (
        <AiTextPane mealType={mealType} onSubmit={onSubmit} onCancel={onCancel} />
      ) : mode === 'barcode' ? (
        <BarcodePane
          mealType={mealType}
          onCancel={onCancel}
          onSubmit={async (product, grams) => {
            setSubmitting(true);
            try {
              if (onBarcodeSelect) {
                const ok = await onBarcodeSelect(product, grams, mealType);
                if (ok) onCancel();
                return ok;
              }
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label htmlFor="meal-name" className="block text-xs font-medium text-body mb-1">
              {t('meal_form.name_label')}
            </label>
            <input
              id="meal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('meal_form.name_placeholder')}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="meal-calories" className="block text-xs font-medium text-body mb-1">
                {t('meal_form.calories_label')} <span className="text-red-400">*</span>
              </label>
              <input
                id="meal-calories"
                type="number"
                inputMode="decimal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="0"
                step="1"
                placeholder="450"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="meal-protein" className="block text-xs font-medium text-body mb-1">
                {t('meal_form.protein_label')}
              </label>
              <input
                id="meal-protein"
                type="number"
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                min="0"
                step="0.5"
                placeholder="25"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="meal-carbs" className="block text-xs font-medium text-body mb-1">
                {t('meal_form.carbs_label')}
              </label>
              <input
                id="meal-carbs"
                type="number"
                inputMode="decimal"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="meal-fat" className="block text-xs font-medium text-body mb-1">
                {t('meal_form.fat_label')}
              </label>
              <input
                id="meal-fat"
                type="number"
                inputMode="decimal"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label htmlFor="meal-notes" className="block text-xs font-medium text-body mb-1">
              {t('meal_form.notes_label')}
            </label>
            <input
              id="meal-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              {t('meal_form.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('meal_form.adding') : t('meal_form.add')}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <SearchPane
            selectedFood={selectedFood}
            onSelect={setSelectedFood}
            portionGrams={portionGrams}
            onPortionChange={setPortionGrams}
            scaledCalories={scaledCalories}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              {t('meal_form.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedFood}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('meal_form.adding') : t('meal_form.add')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface SearchPaneProps {
  selectedFood: FoodReference | null;
  onSelect: (food: FoodReference | null) => void;
  portionGrams: string;
  onPortionChange: (value: string) => void;
  scaledCalories: number | null;
}

function SearchPane({ selectedFood, onSelect, portionGrams, onPortionChange, scaledCalories }: SearchPaneProps) {
  const { t } = useTranslation('nutrition');
  if (selectedFood) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-surface-card border border-divider p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-heading font-medium">{selectedFood.name_fr}</p>
            <button type="button" onClick={() => onSelect(null)} className="text-xs text-brand hover:underline">
              {t('meal_form.change')}
            </button>
          </div>
          <p className="text-xs text-muted">
            Base :{' '}
            {selectedFood.calories_100g != null
              ? t('meal_form.kcal_per_100', { kcal: Math.round(selectedFood.calories_100g) })
              : t('meal_form.calories_unavailable')}
            {selectedFood.group_fr ? ` · ${selectedFood.group_fr}` : ''}
          </p>
        </div>
        <div>
          <label htmlFor="portion-grams" className="block text-xs font-medium text-body mb-1">
            {t('meal_form.qty_label')}
          </label>
          <input
            id="portion-grams"
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={portionGrams}
            onChange={(e) => onPortionChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
          />
        </div>
        {scaledCalories != null && (
          <p className="text-sm text-body">
            <Trans
              i18nKey="meal_form.portion_text"
              ns="nutrition"
              values={{ kcal: Math.round(scaledCalories) }}
              components={{ strong: <strong /> }}
            />
          </p>
        )}
      </div>
    );
  }

  return <FoodSearchInput onSelect={onSelect} />;
}
