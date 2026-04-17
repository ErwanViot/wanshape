import type { ActivityLevel, MealType, NutritionGoal } from '../types/nutrition.ts';

// MEAL_TYPES must stay in sync with the meal_logs.meal_type check constraint
// in supabase/migrations/014_nutrition.sql.
export const MEAL_TYPES: readonly MealType[] = ['breakfast', 'lunch', 'snack', 'dinner', 'extra'] as const;

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Goûter',
  dinner: 'Dîner',
  extra: 'Autre',
};

export const MEAL_TYPE_ORDER: Record<MealType, number> = {
  breakfast: 0,
  lunch: 1,
  snack: 2,
  dinner: 3,
  extra: 4,
};

export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const;

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sédentaire (peu ou pas d'exercice)",
  light: 'Légère (1 à 3 séances/semaine)',
  moderate: 'Modérée (3 à 5 séances/semaine)',
  active: 'Active (6 à 7 séances/semaine)',
  very_active: 'Très active (2x/jour ou métier physique)',
};

/** PAL factor applied to BMR to get TDEE. Mifflin-St Jeor + Harris-Benedict multipliers. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const NUTRITION_GOALS: readonly NutritionGoal[] = ['loss', 'maintenance', 'gain'] as const;

export const NUTRITION_GOAL_LABELS: Record<NutritionGoal, string> = {
  loss: 'Perte de poids progressive',
  maintenance: 'Maintien du poids',
  gain: 'Prise de masse progressive',
};

/**
 * Calorie delta applied to TDEE per goal (moderate / sustainable approach).
 * Fixed (not %): keeps the math explicit and simple. TDEE_BOUNDS.targetCalories
 * clamps the result so small-stature users don't get an unsafe deficit.
 */
export const GOAL_CALORIE_DELTA: Record<NutritionGoal, number> = {
  loss: -400,
  maintenance: 0,
  gain: 300,
};

/** Macro split per goal (sum must equal 1.0; guarded by tdee.test.ts). */
export const GOAL_MACRO_SPLIT: Record<NutritionGoal, { protein: number; carbs: number; fat: number }> = {
  loss: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  maintenance: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  gain: { protein: 0.25, carbs: 0.5, fat: 0.25 },
};

/**
 * Safety bounds for the ephemeral TDEE form (client-only validation).
 * age.min = 18 aligns with the CGU section "Suivi nutritionnel" which restricts
 * the feature to adults; calorie tracking may qualify as art. 9 RGPD health
 * data under Lindenapotheke C-21/23 and CNIL guidance for minors is much
 * stricter.
 */
export const TDEE_BOUNDS = {
  age: { min: 18, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 250 },
  targetCalories: { min: 1000, max: 5000 },
} as const;

/** Daily rate limits for AI features (enforced server-side in edge function). */
export const AI_RATE_LIMITS = {
  textEstimate: 30,
  overflowInsight: 1,
} as const;

/** Used by the client to display remaining budget; must mirror edge function. */
export const AI_COST_WINDOW_HOURS = 24;
