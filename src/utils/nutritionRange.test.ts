import { describe, expect, it } from 'vitest';
import type { MealLog } from '../types/nutrition.ts';
import { buildRangeSummary, enumerateDateRange } from './nutritionRange.ts';

function makeLog(date: string, calories: number, protein = 0, carbs = 0, fat = 0): MealLog {
  return {
    id: `${date}-${calories}`,
    user_id: 'u',
    logged_date: date,
    meal_type: 'breakfast',
    source: 'manual',
    name: 'test',
    calories,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    quantity_grams: null,
    reference_id: null,
    ai_metadata: null,
    notes: null,
    created_at: '2026-05-02T00:00:00Z',
  };
}

describe('enumerateDateRange', () => {
  it('returns the inclusive list of YYYYMMDD between start and end', () => {
    expect(enumerateDateRange('20260425', '20260502')).toEqual([
      '20260425',
      '20260426',
      '20260427',
      '20260428',
      '20260429',
      '20260430',
      '20260501',
      '20260502',
    ]);
  });

  it('returns a single-element list when start === end', () => {
    expect(enumerateDateRange('20260502', '20260502')).toEqual(['20260502']);
  });

  it('falls back to [start] when bounds are invalid', () => {
    expect(enumerateDateRange('invalid', '20260502')).toEqual(['invalid']);
    expect(enumerateDateRange('20260502', '20260425')).toEqual(['20260502']); // reversed
  });

  it('handles month rollover', () => {
    expect(enumerateDateRange('20260430', '20260502')).toEqual(['20260430', '20260501', '20260502']);
  });
});

describe('buildRangeSummary', () => {
  it('produces an empty brief for every day, even those without logs', () => {
    const summary = buildRangeSummary([], '20260501', '20260502', null);
    expect(summary.days).toHaveLength(2);
    expect(summary.days[0]).toEqual({
      date: '20260501',
      totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      hasEntries: false,
    });
    expect(summary.daysWithEntries).toBe(0);
    expect(summary.avgCalories7d).toBeNull();
    expect(summary.avgCaloriesRange).toBeNull();
  });

  it('aggregates multiple logs per day', () => {
    const logs = [makeLog('20260501', 200, 10), makeLog('20260501', 300, 5), makeLog('20260502', 400)];
    const summary = buildRangeSummary(logs, '20260501', '20260502', null);
    expect(summary.days[0].totals.calories).toBe(500);
    expect(summary.days[0].totals.protein_g).toBe(15);
    expect(summary.days[0].hasEntries).toBe(true);
    expect(summary.days[1].totals.calories).toBe(400);
    expect(summary.daysWithEntries).toBe(2);
  });

  it('ignores logs whose date is outside the range', () => {
    const logs = [makeLog('20260101', 999), makeLog('20260501', 200)];
    const summary = buildRangeSummary(logs, '20260501', '20260502', null);
    expect(summary.days[0].totals.calories).toBe(200);
    expect(summary.daysWithEntries).toBe(1);
  });

  it('averages calories over days that actually have entries (rounded)', () => {
    const logs = [makeLog('20260501', 1000), makeLog('20260502', 2000)];
    // Range has 2 days both with entries → avg = 1500
    const summary = buildRangeSummary(logs, '20260501', '20260502', null);
    expect(summary.avgCaloriesRange).toBe(1500);
    expect(summary.avgCalories7d).toBe(1500);
  });

  it('avgCalories7d looks at the most recent 7 days only', () => {
    // 10-day range, only the last 3 have entries
    const logs = [makeLog('20260430', 1500), makeLog('20260501', 1800), makeLog('20260502', 2100)];
    const summary = buildRangeSummary(logs, '20260423', '20260502', null);
    expect(summary.days).toHaveLength(10);
    // 7d window = 20260426..20260502, of which 3 days have entries
    expect(summary.avgCalories7d).toBe(1800); // (1500+1800+2100)/3
    expect(summary.avgCaloriesRange).toBe(1800);
  });

  it('daysHittingTargetWeek is null when no target is set', () => {
    const logs = [makeLog('20260502', 9000)];
    const summary = buildRangeSummary(logs, '20260501', '20260502', null);
    expect(summary.daysHittingTargetWeek).toBeNull();
  });

  it('daysHittingTargetWeek counts days reaching the target on the last 7 days', () => {
    const logs = [
      makeLog('20260426', 1500), // below
      makeLog('20260428', 2100), // above
      makeLog('20260430', 2000), // exactly target
      makeLog('20260502', 2500), // above
    ];
    const summary = buildRangeSummary(logs, '20260426', '20260502', 2000);
    expect(summary.daysHittingTargetWeek).toBe(3);
  });
});
