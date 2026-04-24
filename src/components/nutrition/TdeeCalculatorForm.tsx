import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_LEVELS, NUTRITION_GOALS, TDEE_BOUNDS } from '../../config/nutrition.ts';
import type { ActivityLevel, BiologicalSex, NutritionGoal, TdeeResult } from '../../types/nutrition.ts';
import { computeTdee, validateTdeeInputs } from '../../utils/tdee.ts';

interface TdeeCalculatorFormProps {
  onAccept: (result: TdeeResult, activityLevel: ActivityLevel, goal: NutritionGoal) => Promise<void>;
  onCancel: () => void;
}

const SEX_VALUES: BiologicalSex[] = ['female', 'male'];

/**
 * Ephemeral onboarding form. Inputs (age, height, weight, sex) are kept in
 * React state ONLY and are never sent to the server. Only the derived
 * `targetCalories` and `activityLevel`/`goal` are persisted via onAccept.
 */
export function TdeeCalculatorForm({ onAccept, onCancel }: TdeeCalculatorFormProps) {
  const { t } = useTranslation('nutrition');
  const [sex, setSex] = useState<BiologicalSex>('female');
  const [ageYears, setAge] = useState('');
  const [heightCm, setHeight] = useState('');
  const [weightKg, setWeight] = useState('');
  const [activityLevel, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<NutritionGoal>('maintenance');
  const [preview, setPreview] = useState<TdeeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parsed() {
    return {
      sex,
      ageYears: Number.parseFloat(ageYears),
      heightCm: Number.parseFloat(heightCm),
      weightKg: Number.parseFloat(weightKg),
      activityLevel,
      goal,
    };
  }

  function handleComputePreview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const inputs = parsed();
    const validation = validateTdeeInputs(inputs);
    if (validation) {
      setError(
        validation === 'invalid_age'
          ? t('tdee.error_age', { min: TDEE_BOUNDS.age.min, max: TDEE_BOUNDS.age.max })
          : validation === 'invalid_height'
            ? t('tdee.error_height', { min: TDEE_BOUNDS.heightCm.min, max: TDEE_BOUNDS.heightCm.max })
            : validation === 'invalid_weight'
              ? t('tdee.error_weight', { min: TDEE_BOUNDS.weightKg.min, max: TDEE_BOUNDS.weightKg.max })
              : t('tdee.error_default'),
      );
      setPreview(null);
      return;
    }
    setPreview(computeTdee(inputs));
  }

  async function handleAccept() {
    if (!preview) return;
    setSubmitting(true);
    try {
      await onAccept(preview, activityLevel, goal);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-surface-card border border-divider p-4 space-y-2">
        <h3 className="font-display text-base font-bold text-heading">{t('tdee.heading')}</h3>
        <p
          className="text-sm text-body leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: translated HTML with bold tag
          dangerouslySetInnerHTML={{ __html: t('tdee.intro') }}
        />
        <p className="text-xs text-muted italic">{t('tdee.formula_note')}</p>
      </div>

      <form onSubmit={handleComputePreview} className="space-y-4">
        <div>
          <fieldset>
            <legend className="block text-xs font-medium text-body mb-1">{t('tdee.sex_legend')}</legend>
            <div className="flex gap-2">
              {SEX_VALUES.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setSex(val)}
                  aria-pressed={sex === val}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    sex === val ? 'border-brand bg-brand/10 text-heading' : 'border-divider text-body'
                  }`}
                >
                  {t(`tdee.sex_${val}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="tdee-age" className="block text-xs font-medium text-body mb-1">
              {t('tdee.age_label')}
            </label>
            <input
              id="tdee-age"
              type="number"
              inputMode="numeric"
              min={TDEE_BOUNDS.age.min}
              max={TDEE_BOUNDS.age.max}
              value={ageYears}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="tdee-height" className="block text-xs font-medium text-body mb-1">
              {t('tdee.height_label')}
            </label>
            <input
              id="tdee-height"
              type="number"
              inputMode="decimal"
              min={TDEE_BOUNDS.heightCm.min}
              max={TDEE_BOUNDS.heightCm.max}
              value={heightCm}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="tdee-weight" className="block text-xs font-medium text-body mb-1">
              {t('tdee.weight_label')}
            </label>
            <input
              id="tdee-weight"
              type="number"
              inputMode="decimal"
              min={TDEE_BOUNDS.weightKg.min}
              max={TDEE_BOUNDS.weightKg.max}
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tdee-activity" className="block text-xs font-medium text-body mb-1">
            {t('tdee.activity_label')}
          </label>
          <select
            id="tdee-activity"
            value={activityLevel}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full px-3 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
          >
            {ACTIVITY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {t(`activity_level.${lvl}`)}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="block text-xs font-medium text-body mb-1">{t('tdee.goal_legend')}</legend>
          <div className="flex flex-wrap gap-2">
            {NUTRITION_GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                aria-pressed={goal === g}
                className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  goal === g ? 'border-brand bg-brand/10 text-heading' : 'border-divider text-body'
                }`}
              >
                {t(`nutrition_goal.${g}`)}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient">
          {t('tdee.compute_cta')}
        </button>
      </form>

      {preview && (
        <div className="rounded-xl bg-surface-card border border-brand/30 p-4 space-y-3">
          <h4 className="font-display text-base font-bold text-heading">{t('tdee.preview_heading')}</h4>
          <p
            className="text-sm text-body"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: translated HTML with bold tags
            dangerouslySetInnerHTML={{
              __html: `${t('tdee.bmr', { kcal: preview.bmr })}<br />${t('tdee.tdee_label', { kcal: preview.tdee })}`,
            }}
          />
          <div className="rounded-lg bg-brand/10 border border-brand/30 p-3">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">{t('tdee.target_label')}</p>
            <p className="font-display text-3xl font-black text-brand">{preview.targetCalories} kcal</p>
            <p className="text-xs text-body mt-1">
              {t('tdee.distribution', {
                protein: preview.targetProteinG,
                carbs: preview.targetCarbsG,
                fat: preview.targetFatG,
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              {t('tdee.cancel')}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
            >
              {submitting ? t('tdee.saving') : t('tdee.accept')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
