import { ACTIVITY_MULTIPLIERS, GOAL_CALORIE_DELTA, GOAL_MACRO_SPLIT, TDEE_BOUNDS } from '../config/nutrition.ts';
import type { BiologicalSex, TdeeInputs, TdeeResult } from '../types/nutrition.ts';

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

/**
 * Mifflin-St Jeor BMR (kcal/day). Computed client-side only.
 * Reference: Mifflin MD et al., Am J Clin Nutr 1990.
 */
export function computeBmr(sex: BiologicalSex, weightKg: number, heightCm: number, ageYears: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'male' ? base + 5 : base - 161;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export type TdeeValidationError =
  | 'invalid_age'
  | 'invalid_height'
  | 'invalid_weight'
  | 'invalid_sex'
  | 'invalid_activity'
  | 'invalid_goal';

export function validateTdeeInputs(inputs: TdeeInputs): TdeeValidationError | null {
  if (
    !Number.isFinite(inputs.ageYears) ||
    inputs.ageYears < TDEE_BOUNDS.age.min ||
    inputs.ageYears > TDEE_BOUNDS.age.max
  ) {
    return 'invalid_age';
  }
  if (
    !Number.isFinite(inputs.heightCm) ||
    inputs.heightCm < TDEE_BOUNDS.heightCm.min ||
    inputs.heightCm > TDEE_BOUNDS.heightCm.max
  ) {
    return 'invalid_height';
  }
  if (
    !Number.isFinite(inputs.weightKg) ||
    inputs.weightKg < TDEE_BOUNDS.weightKg.min ||
    inputs.weightKg > TDEE_BOUNDS.weightKg.max
  ) {
    return 'invalid_weight';
  }
  if (inputs.sex !== 'female' && inputs.sex !== 'male') return 'invalid_sex';
  if (!(inputs.activityLevel in ACTIVITY_MULTIPLIERS)) return 'invalid_activity';
  if (!(inputs.goal in GOAL_CALORIE_DELTA)) return 'invalid_goal';
  return null;
}

export function computeTdee(inputs: TdeeInputs): TdeeResult {
  const validation = validateTdeeInputs(inputs);
  if (validation !== null) {
    throw new Error(`Invalid TDEE input: ${validation}`);
  }

  const bmr = computeBmr(inputs.sex, inputs.weightKg, inputs.heightCm, inputs.ageYears);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[inputs.activityLevel];
  const rawTarget = tdee + GOAL_CALORIE_DELTA[inputs.goal];
  const targetCalories = Math.round(clamp(rawTarget, TDEE_BOUNDS.targetCalories.min, TDEE_BOUNDS.targetCalories.max));

  const split = GOAL_MACRO_SPLIT[inputs.goal];
  const targetProteinG = Math.round((targetCalories * split.protein) / KCAL_PER_G_PROTEIN);
  const targetCarbsG = Math.round((targetCalories * split.carbs) / KCAL_PER_G_CARBS);
  const targetFatG = Math.round((targetCalories * split.fat) / KCAL_PER_G_FAT);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}
