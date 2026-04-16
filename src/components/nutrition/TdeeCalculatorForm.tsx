import { type FormEvent, useState } from 'react';
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVELS,
  NUTRITION_GOAL_LABELS,
  NUTRITION_GOALS,
  TDEE_BOUNDS,
} from '../../config/nutrition.ts';
import type { ActivityLevel, BiologicalSex, NutritionGoal, TdeeResult } from '../../types/nutrition.ts';
import { computeTdee, validateTdeeInputs } from '../../utils/tdee.ts';

interface TdeeCalculatorFormProps {
  onAccept: (result: TdeeResult, activityLevel: ActivityLevel, goal: NutritionGoal) => Promise<void>;
  onCancel: () => void;
}

const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: 'female', label: 'Femme' },
  { value: 'male', label: 'Homme' },
];

/**
 * Ephemeral onboarding form. Inputs (age, height, weight, sex) are kept in
 * React state ONLY and are never sent to the server. Only the derived
 * `targetCalories` and `activityLevel`/`goal` are persisted via onAccept.
 */
export function TdeeCalculatorForm({ onAccept, onCancel }: TdeeCalculatorFormProps) {
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
      setError(errorLabel(validation));
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
        <h2 className="font-display text-base font-bold text-heading">Calcul de ta cible calorique</h2>
        <p className="text-sm text-body leading-relaxed">
          Les informations ci-dessous sont utilisées <strong>uniquement dans ton navigateur</strong> pour estimer une
          cible calorique indicative. Elles ne sont jamais envoyées sur nos serveurs et seront oubliées dès que tu
          fermes cette page.
        </p>
        <p className="text-xs text-muted italic">
          Formule : Mifflin-St Jeor. Estimation ±150 kcal. Ajuste après 2 semaines selon ton ressenti.
        </p>
      </div>

      <form onSubmit={handleComputePreview} className="space-y-4">
        <div>
          <fieldset>
            <legend className="block text-xs font-medium text-body mb-1">Sexe biologique</legend>
            <div className="flex gap-2">
              {SEX_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSex(opt.value)}
                  aria-pressed={sex === opt.value}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    sex === opt.value ? 'border-brand bg-brand/10 text-heading' : 'border-divider text-body'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="tdee-age" className="block text-xs font-medium text-body mb-1">
              Âge (ans)
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
              Taille (cm)
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
              Poids (kg)
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
            Niveau d'activité
          </label>
          <select
            id="tdee-activity"
            value={activityLevel}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full px-3 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
          >
            {ACTIVITY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {ACTIVITY_LEVEL_LABELS[lvl]}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="block text-xs font-medium text-body mb-1">Objectif</legend>
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
                {NUTRITION_GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient">
          Calculer ma cible
        </button>
      </form>

      {preview && (
        <div className="rounded-xl bg-surface-card border border-brand/30 p-4 space-y-3">
          <h3 className="font-display text-base font-bold text-heading">Ta cible estimée</h3>
          <p className="text-sm text-body">
            Métabolisme de base : <strong className="text-heading">{preview.bmr} kcal</strong>
            <br />
            Dépense totale estimée : <strong className="text-heading">{preview.tdee} kcal</strong>
          </p>
          <div className="rounded-lg bg-brand/10 border border-brand/30 p-3">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Cible quotidienne</p>
            <p className="font-display text-3xl font-black text-brand">{preview.targetCalories} kcal</p>
            <p className="text-xs text-body mt-1">
              Répartition indicative : {preview.targetProteinG} g protéines · {preview.targetCarbsG} g glucides ·{' '}
              {preview.targetFatG} g lipides
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
            >
              {submitting ? 'Sauvegarde…' : 'Valider cette cible'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function errorLabel(err: string): string {
  switch (err) {
    case 'invalid_age':
      return `L'âge doit être entre ${TDEE_BOUNDS.age.min} et ${TDEE_BOUNDS.age.max} ans.`;
    case 'invalid_height':
      return `La taille doit être entre ${TDEE_BOUNDS.heightCm.min} et ${TDEE_BOUNDS.heightCm.max} cm.`;
    case 'invalid_weight':
      return `Le poids doit être entre ${TDEE_BOUNDS.weightKg.min} et ${TDEE_BOUNDS.weightKg.max} kg.`;
    default:
      return 'Vérifie les informations saisies.';
  }
}
