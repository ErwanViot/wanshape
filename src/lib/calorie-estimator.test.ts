import { describe, expect, it } from 'vitest';
import { estimateKcal } from './calorie-estimator.ts';
import {
  formatToHealthConnectType,
  formatToHKActivityType,
  HealthConnectExerciseType,
  HKWorkoutActivityType,
} from './health-types.ts';

describe('estimateKcal', () => {
  it('returns 0 for non-positive durations', () => {
    expect(estimateKcal({ formatSlug: 'hiit', durationSeconds: 0 })).toBe(0);
    expect(estimateKcal({ formatSlug: 'hiit', durationSeconds: -10 })).toBe(0);
  });

  it('uses the default 70 kg weight when none provided', () => {
    // 30 min HIIT @ 9 MET, 70 kg → 9 × 70 × 0.5 = 315 kcal
    expect(estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60 })).toBe(315);
  });

  it('scales linearly with weight', () => {
    const base = estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60, weightKg: 70 });
    const heavy = estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60, weightKg: 90 });
    // 9 × 90 × 0.5 = 405 kcal
    expect(heavy).toBe(405);
    expect(heavy).toBeGreaterThan(base);
  });

  it('orders intensities correctly: tabata > hiit > amrap > circuit > emom > superset > strength', () => {
    const opts = { durationSeconds: 30 * 60, weightKg: 70 } as const;
    const tabata = estimateKcal({ ...opts, formatSlug: 'tabata' });
    const hiit = estimateKcal({ ...opts, formatSlug: 'hiit' });
    const amrap = estimateKcal({ ...opts, formatSlug: 'amrap' });
    const circuit = estimateKcal({ ...opts, formatSlug: 'circuit' });
    const emom = estimateKcal({ ...opts, formatSlug: 'emom' });
    const superset = estimateKcal({ ...opts, formatSlug: 'superset' });
    const renforcement = estimateKcal({ ...opts, formatSlug: 'renforcement' });

    expect(tabata).toBeGreaterThan(hiit);
    expect(hiit).toBeGreaterThan(amrap);
    expect(amrap).toBeGreaterThan(circuit);
    expect(circuit).toBeGreaterThan(emom);
    expect(emom).toBeGreaterThan(superset);
    expect(superset).toBeGreaterThan(renforcement);
  });

  it('treats a weight of 0 or negative as unknown (uses default)', () => {
    const fallback = estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60 });
    expect(estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60, weightKg: 0 })).toBe(fallback);
    expect(estimateKcal({ formatSlug: 'hiit', durationSeconds: 30 * 60, weightKg: -5 })).toBe(fallback);
  });

  it('rounds to the nearest integer', () => {
    const result = estimateKcal({ formatSlug: 'pyramide', durationSeconds: 12 * 60, weightKg: 68 });
    // 5 × 68 × (720/3600) = 68 → integer already
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('formatToHKActivityType', () => {
  it('maps strength formats to HealthKit traditional/functional strength', () => {
    expect(formatToHKActivityType('pyramide')).toBe(HKWorkoutActivityType.TraditionalStrengthTraining);
    expect(formatToHKActivityType('renforcement')).toBe(HKWorkoutActivityType.TraditionalStrengthTraining);
    expect(formatToHKActivityType('superset')).toBe(HKWorkoutActivityType.FunctionalStrengthTraining);
  });

  it('maps interval formats to HIIT', () => {
    for (const slug of ['emom', 'circuit', 'amrap', 'hiit', 'tabata'] as const) {
      expect(formatToHKActivityType(slug)).toBe(HKWorkoutActivityType.HighIntensityIntervalTraining);
    }
  });
});

describe('formatToHealthConnectType', () => {
  it('maps strength formats to STRENGTH_TRAINING', () => {
    expect(formatToHealthConnectType('pyramide')).toBe(HealthConnectExerciseType.StrengthTraining);
    expect(formatToHealthConnectType('renforcement')).toBe(HealthConnectExerciseType.StrengthTraining);
    expect(formatToHealthConnectType('superset')).toBe(HealthConnectExerciseType.StrengthTraining);
  });

  it('maps circuit to CircuitTraining and the rest to HIIT', () => {
    expect(formatToHealthConnectType('circuit')).toBe(HealthConnectExerciseType.CircuitTraining);
    for (const slug of ['emom', 'amrap', 'hiit', 'tabata'] as const) {
      expect(formatToHealthConnectType(slug)).toBe(HealthConnectExerciseType.HighIntensityIntervalTraining);
    }
  });
});
