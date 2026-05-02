// The following unions must stay in sync with the check constraints declared in
// supabase/migrations/014_nutrition.sql (meal_type, source, goal, activity_level).
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra';

export type MealSource = 'manual' | 'ciqual' | 'barcode' | 'ai_text' | 'overflow_insight';

export type NutritionGoal = 'loss' | 'maintenance' | 'gain';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type BiologicalSex = 'female' | 'male';

/**
 * Persisted nutrition target. Stores only derived numeric goals, never the raw
 * morphological inputs (age, height, weight, sex) used to compute them.
 */
export type NutritionProfile = {
  user_id: string;
  target_calories: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  goal: NutritionGoal | null;
  activity_level: ActivityLevel | null;
  created_at: string;
  updated_at: string;
};

export type NutritionProfileUpsert = Partial<
  Pick<
    NutritionProfile,
    'target_calories' | 'target_protein_g' | 'target_carbs_g' | 'target_fat_g' | 'goal' | 'activity_level'
  >
>;

/**
 * Ephemeral client-only inputs used to compute a target. NEVER persisted.
 */
export type TdeeInputs = {
  sex: BiologicalSex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
};

export type TdeeResult = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
};

export type AiMetadata = {
  model: string;
  input_tokens: number;
  output_tokens: number;
  confidence?: 'low' | 'medium' | 'high';
  prompt_version?: string;
};

export type MealLog = {
  id: string;
  user_id: string;
  /** YYYYMMDD (user's LOCAL date). Must never be computed via toISOString(). */
  logged_date: string;
  meal_type: MealType;
  source: MealSource;
  name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  quantity_grams: number | null;
  reference_id: string | null;
  ai_metadata: AiMetadata | null;
  notes: string | null;
  created_at: string;
};

export type MealLogInsert = Omit<MealLog, 'id' | 'user_id' | 'created_at'> & {
  user_id?: string;
};

export type FoodReference = {
  id: string;
  name_fr: string;
  group_fr: string | null;
  calories_100g: number | null;
  protein_100g: number | null;
  carbs_100g: number | null;
  fat_100g: number | null;
  fiber_100g: number | null;
  /** 'ciqual' for rows fetched from the local CIQUAL table; 'off' when
   *  synthesized from an Open Food Facts text-search fallback. */
  source: string;
  // Fields below are only populated for source === 'off' search fallback.
  // They carry product-level metadata (brand, image, OFF source URL) plus
  // numeric quantity hints used to seed the portion input — keeping them
  // optional preserves the CIQUAL row shape unchanged.
  brand?: string | null;
  image_url?: string | null;
  source_url?: string;
  product_quantity_g?: number | null;
  serving_quantity_g?: number | null;
};

export type DailyNutritionTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type DailyNutritionSummary = {
  /** YYYYMMDD in the user's local timezone. */
  date: string;
  totals: DailyNutritionTotals;
  /** Partial: only meal_type keys with at least one log are present. */
  byMealType: Partial<Record<MealType, MealLog[]>>;
  target: {
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  };
};

/**
 * Lightweight per-day rollup used by historical views (7d strip, 30d heatmap).
 * Drops `byMealType` and `target` to keep payload small over a 30-day window.
 */
export type DailyNutritionBrief = {
  /** YYYYMMDD in the user's local timezone. */
  date: string;
  totals: DailyNutritionTotals;
  hasEntries: boolean;
};

export type NutritionRangeSummary = {
  /** Inclusive YYYYMMDD bounds, oldest to newest. */
  startDate: string;
  endDate: string;
  /** One entry per day in [startDate, endDate], oldest first. */
  days: DailyNutritionBrief[];
  /** Mean calories on the most recent 7 days; null if none had entries. */
  avgCalories7d: number | null;
  /** Mean calories on the full window; null if none had entries. */
  avgCaloriesRange: number | null;
  daysWithEntries: number;
  /** Days hitting the (non-null) calorie target on the most recent 7 days. */
  daysHittingTargetWeek: number | null;
};

export type TextEstimate = {
  name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  confidence: 'low' | 'medium' | 'high';
};

export type NutritionInsight = {
  id: string;
  user_id: string;
  logged_date: string;
  summary: string;
  suggestions: string[];
  ai_metadata: AiMetadata | null;
  created_at: string;
};
