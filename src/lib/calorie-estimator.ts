import type { FormatSlug } from './health-types.ts';

// Energy expenditure for each Wan2Fit format, in MET (metabolic
// equivalents). Values are taken from the Compendium of Physical
// Activities (Ainsworth et al., 2024 update) and rounded to the nearest
// half-MET — the literature's spread is wide enough that finer
// precision would be false confidence.
const FORMAT_MET: Record<FormatSlug, number> = {
  pyramide: 5.0, // Resistance training, free weights, vigorous
  renforcement: 5.0, // Strength training, general
  superset: 6.0, // Strength training with reduced rest
  emom: 7.0, // Every-minute-on-the-minute, structured intervals
  circuit: 7.5, // Circuit training, vigorous effort
  amrap: 8.0, // As-many-rounds-as-possible
  hiit: 9.0, // Generic HIIT
  tabata: 9.5, // Tabata protocol (highest sustained intensity)
};

const DEFAULT_WEIGHT_KG = 70;

export interface CalorieInput {
  formatSlug: FormatSlug;
  durationSeconds: number;
  /**
   * User weight in kg. When unknown we assume 70 kg — the apparent
   * precision of the formula is illusory either way (METs already
   * carry ±20% spread), so an estimate from a default weight is fine
   * for a "this session burned around X kcal" badge.
   */
  weightKg?: number;
}

/**
 * Returns an integer kcal estimate for one workout block.
 *
 * Formula: kcal = MET × weight_kg × duration_hours
 *
 * Rounded to the nearest integer. Returns 0 for non-positive durations
 * so the estimator never inflates an interrupted session.
 */
export function estimateKcal({ formatSlug, durationSeconds, weightKg }: CalorieInput): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  const met = FORMAT_MET[formatSlug];
  const weight = weightKg && weightKg > 0 ? weightKg : DEFAULT_WEIGHT_KG;
  const hours = durationSeconds / 3600;
  return Math.round(met * weight * hours);
}
