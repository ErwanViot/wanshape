import { describe, expect, it } from 'vitest';
import { GOAL_MACRO_SPLIT } from '../config/nutrition.ts';
import { computeBmr, computeTdee, validateTdeeInputs } from './tdee.ts';

describe('computeBmr (Mifflin-St Jeor)', () => {
  it('matches the canonical male reference (30y, 80kg, 180cm)', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(computeBmr('male', 80, 180, 30)).toBe(1780);
  });

  it('matches the canonical female reference (30y, 65kg, 165cm)', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25
    expect(computeBmr('female', 65, 165, 30)).toBeCloseTo(1370.25, 2);
  });

  it('decreases as age increases (all else equal)', () => {
    const young = computeBmr('male', 80, 180, 25);
    const older = computeBmr('male', 80, 180, 55);
    expect(young).toBeGreaterThan(older);
  });

  it('is higher for male than female at same morphology', () => {
    const male = computeBmr('male', 70, 175, 30);
    const female = computeBmr('female', 70, 175, 30);
    expect(male - female).toBe(166);
  });
});

describe('validateTdeeInputs', () => {
  const valid = {
    sex: 'male' as const,
    ageYears: 30,
    heightCm: 180,
    weightKg: 80,
    activityLevel: 'moderate' as const,
    goal: 'maintenance' as const,
  };

  it('accepts a valid input set', () => {
    expect(validateTdeeInputs(valid)).toBeNull();
  });

  it('rejects age below minimum', () => {
    expect(validateTdeeInputs({ ...valid, ageYears: 10 })).toBe('invalid_age');
  });

  it('rejects absurd height', () => {
    expect(validateTdeeInputs({ ...valid, heightCm: 50 })).toBe('invalid_height');
  });

  it('rejects absurd weight', () => {
    expect(validateTdeeInputs({ ...valid, weightKg: 10 })).toBe('invalid_weight');
  });

  it('rejects NaN ages', () => {
    expect(validateTdeeInputs({ ...valid, ageYears: Number.NaN })).toBe('invalid_age');
  });
});

describe('computeTdee', () => {
  it('produces expected maintenance target for male moderate 30y', () => {
    const result = computeTdee({
      sex: 'male',
      ageYears: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'moderate',
      goal: 'maintenance',
    });
    // BMR 1780 * 1.55 = 2759 TDEE, maintenance delta 0 → ~2759 kcal
    expect(result.bmr).toBe(1780);
    expect(result.tdee).toBe(2759);
    expect(result.targetCalories).toBe(2759);
  });

  it('applies the loss deficit of -400 kcal', () => {
    const result = computeTdee({
      sex: 'female',
      ageYears: 35,
      heightCm: 165,
      weightKg: 70,
      activityLevel: 'light',
      goal: 'loss',
    });
    // BMR ≈ 1387.25, TDEE ≈ 1907.2, target ≈ 1507
    expect(result.targetCalories).toBeLessThan(result.tdee);
    expect(result.tdee - result.targetCalories).toBe(400);
  });

  it('applies the gain surplus of +300 kcal', () => {
    const result = computeTdee({
      sex: 'male',
      ageYears: 25,
      heightCm: 175,
      weightKg: 65,
      activityLevel: 'active',
      goal: 'gain',
    });
    expect(result.targetCalories - result.tdee).toBe(300);
  });

  it('clamps extreme low targets to min 1000', () => {
    const result = computeTdee({
      sex: 'female',
      ageYears: 95,
      heightCm: 140,
      weightKg: 40,
      activityLevel: 'sedentary',
      goal: 'loss',
    });
    expect(result.targetCalories).toBeGreaterThanOrEqual(1000);
  });

  it('clamps extreme high targets to max 5000', () => {
    const result = computeTdee({
      sex: 'male',
      ageYears: 22,
      heightCm: 200,
      weightKg: 150,
      activityLevel: 'very_active',
      goal: 'gain',
    });
    expect(result.targetCalories).toBeLessThanOrEqual(5000);
  });

  it('macros sum (in kcal) match targetCalories within rounding precision', () => {
    // With fat computed by difference, drift is bounded by ±4 kcal
    // (half-kcal of rounding across the two 4-kcal macros and one 9-kcal fat).
    const result = computeTdee({
      sex: 'male',
      ageYears: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'moderate',
      goal: 'maintenance',
    });
    const fromMacros = result.targetProteinG * 4 + result.targetCarbsG * 4 + result.targetFatG * 9;
    expect(Math.abs(fromMacros - result.targetCalories)).toBeLessThanOrEqual(4);
  });

  it('throws on invalid inputs', () => {
    expect(() =>
      computeTdee({
        sex: 'male',
        ageYears: 5,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
        goal: 'maintenance',
      }),
    ).toThrow();
  });
});

describe('GOAL_MACRO_SPLIT invariants', () => {
  it('each goal split sums to 1.0', () => {
    for (const [goal, split] of Object.entries(GOAL_MACRO_SPLIT)) {
      const sum = split.protein + split.carbs + split.fat;
      expect(sum, `GOAL_MACRO_SPLIT[${goal}] must sum to 1`).toBeCloseTo(1, 5);
    }
  });
});
