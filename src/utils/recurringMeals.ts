import type { MealLog, MealSource } from '../types/nutrition.ts';
import { parseYYYYMMDD } from './nutritionDate.ts';

export type RecurringMeal = {
  /** Stable group key, used as React key. */
  signature: string;
  name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  quantity_grams: number | null;
  source: MealSource;
  reference_id: string | null;
  count: number;
  /** YYYYMMDD of the most recent occurrence in the window. */
  lastUsedAt: string;
};

const WINDOW_DAYS = 30;
const MIN_OCCURRENCES = 2;
const RECENCY_WEIGHT = 0.5;

function buildSignature(log: MealLog): string {
  if (log.reference_id) return `ref:${log.reference_id}`;
  const normalized = log.name.trim().toLowerCase();
  return `name:${normalized}`;
}

function dateDistance(fromYYYYMMDD: string, today: Date): number {
  const parsed = parseYYYYMMDD(fromYYYYMMDD);
  if (!parsed) return WINDOW_DAYS;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((start.getTime() - parsed.getTime()) / 86_400_000));
}

export interface BuildRecurringMealsOptions {
  /** Defaults to 3. */
  limit?: number;
  /** Defaults to today. Injected for deterministic tests. */
  now?: Date;
}

export function buildRecurringMeals(logs: MealLog[], options: BuildRecurringMealsOptions = {}): RecurringMeal[] {
  const { limit = 3, now = new Date() } = options;
  const groups = new Map<string, MealLog[]>();
  for (const log of logs) {
    const sig = buildSignature(log);
    const list = groups.get(sig);
    if (list) list.push(log);
    else groups.set(sig, [log]);
  }

  const candidates: Array<RecurringMeal & { score: number }> = [];
  for (const [signature, items] of groups) {
    if (items.length < MIN_OCCURRENCES) continue;
    // Most recent occurrence drives the displayed values (last used name,
    // last used quantity) — the user is likely to want what they had last
    // time, not an average across the window.
    const sorted = [...items].sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1));
    const latest = sorted[0];
    const distance = dateDistance(latest.logged_date, now);
    const recencyScore = 1 - Math.min(distance, WINDOW_DAYS) / WINDOW_DAYS;
    const score = items.length + RECENCY_WEIGHT * recencyScore;
    candidates.push({
      signature,
      name: latest.name,
      calories: latest.calories,
      protein_g: latest.protein_g,
      carbs_g: latest.carbs_g,
      fat_g: latest.fat_g,
      quantity_grams: latest.quantity_grams,
      source: latest.source,
      reference_id: latest.reference_id,
      count: items.length,
      lastUsedAt: latest.logged_date,
      score,
    });
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.lastUsedAt < b.lastUsedAt ? 1 : -1;
  });

  return candidates.slice(0, limit).map(({ score: _score, ...rest }) => rest);
}
