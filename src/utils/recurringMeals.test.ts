import { describe, expect, it } from 'vitest';
import type { MealLog } from '../types/nutrition.ts';
import { buildRecurringMeals } from './recurringMeals.ts';

const NOW = new Date(2026, 4, 1); // 2026-05-01 local

function makeLog(overrides: Partial<MealLog> = {}): MealLog {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    user_id: 'u1',
    logged_date: '20260501',
    meal_type: 'breakfast',
    source: 'manual',
    name: 'Yaourt grec',
    calories: 180,
    protein_g: 18,
    carbs_g: 8,
    fat_g: 6,
    quantity_grams: 200,
    reference_id: null,
    ai_metadata: null,
    notes: null,
    created_at: '2026-05-01T07:00:00Z',
    ...overrides,
  };
}

describe('buildRecurringMeals', () => {
  it('returns nothing when an item appears only once', () => {
    const result = buildRecurringMeals([makeLog()], { now: NOW });
    expect(result).toEqual([]);
  });

  it('keeps items that appear at least twice', () => {
    const logs = [makeLog({ logged_date: '20260501' }), makeLog({ logged_date: '20260428' })];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    expect(result[0].name).toBe('Yaourt grec');
  });

  it('groups by reference_id when present, regardless of name', () => {
    const logs = [
      makeLog({ reference_id: 'ciqual:42', name: 'Yaourt grec', logged_date: '20260501' }),
      // Same reference, different display name (e.g. user edited it once)
      makeLog({ reference_id: 'ciqual:42', name: 'YAOURT GREC NATURE', logged_date: '20260425' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    // Latest occurrence wins for the displayed name
    expect(result[0].name).toBe('Yaourt grec');
  });

  it('groups by normalized name when reference_id is missing', () => {
    const logs = [
      makeLog({ reference_id: null, name: '  Yaourt Grec  ', logged_date: '20260501' }),
      makeLog({ reference_id: null, name: 'yaourt grec', logged_date: '20260420' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });

  it('does not collapse different reference_ids that share a name', () => {
    const logs = [
      makeLog({ reference_id: 'ciqual:42', name: 'Yaourt', logged_date: '20260501' }),
      makeLog({ reference_id: 'ciqual:42', name: 'Yaourt', logged_date: '20260425' }),
      makeLog({ reference_id: 'off:123', name: 'Yaourt', logged_date: '20260430' }),
      makeLog({ reference_id: 'off:123', name: 'Yaourt', logged_date: '20260420' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result).toHaveLength(2);
  });

  it('uses the latest occurrence values (name + quantity) for display', () => {
    const logs = [
      makeLog({ name: 'flocons avoine', quantity_grams: 60, calories: 230, logged_date: '20260420' }),
      makeLog({ name: 'flocons avoine', quantity_grams: 80, calories: 305, logged_date: '20260430' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result[0].quantity_grams).toBe(80);
    expect(result[0].calories).toBe(305);
  });

  it('orders by frequency, then recency', () => {
    const logs = [
      // A: 2 occurrences, last = 2026-04-15 (older)
      makeLog({ name: 'A', logged_date: '20260415' }),
      makeLog({ name: 'A', logged_date: '20260410' }),
      // B: 4 occurrences, last = 2026-04-10
      makeLog({ name: 'B', logged_date: '20260410' }),
      makeLog({ name: 'B', logged_date: '20260408' }),
      makeLog({ name: 'B', logged_date: '20260405' }),
      makeLog({ name: 'B', logged_date: '20260403' }),
      // C: 2 occurrences, last = 2026-04-30 (most recent)
      makeLog({ name: 'C', logged_date: '20260430' }),
      makeLog({ name: 'C', logged_date: '20260425' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    // B wins on count, then C beats A on recency despite same count.
    expect(result.map((r) => r.name)).toEqual(['B', 'C', 'A']);
  });

  it('caps the result at the requested limit', () => {
    const names = ['A', 'B', 'C', 'D', 'E'];
    const logs = names.flatMap((n) => [makeLog({ name: n }), makeLog({ name: n })]);
    expect(buildRecurringMeals(logs, { now: NOW, limit: 3 })).toHaveLength(3);
    expect(buildRecurringMeals(logs, { now: NOW, limit: 1 })).toHaveLength(1);
  });

  it('ignores meal_type filtering — caller must pre-filter', () => {
    // Sanity check: the util does not look at meal_type. The hook is in
    // charge of querying only the relevant meal_type. If a future caller
    // forgets, this test documents the contract.
    const logs = [
      makeLog({ meal_type: 'breakfast', name: 'X', logged_date: '20260501' }),
      makeLog({ meal_type: 'dinner', name: 'X', logged_date: '20260430' }),
    ];
    const result = buildRecurringMeals(logs, { now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });
});
