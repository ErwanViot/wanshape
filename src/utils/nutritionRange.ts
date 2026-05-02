import type { DailyNutritionBrief, DailyNutritionTotals, MealLog, NutritionRangeSummary } from '../types/nutrition.ts';
import { parseYYYYMMDD, shiftYYYYMMDD } from './nutritionDate.ts';

const EMPTY_TOTALS: DailyNutritionTotals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

function emptyBrief(date: string): DailyNutritionBrief {
  return { date, totals: { ...EMPTY_TOTALS }, hasEntries: false };
}

function addToTotals(totals: DailyNutritionTotals, log: MealLog): DailyNutritionTotals {
  return {
    calories: totals.calories + (log.calories ?? 0),
    protein_g: totals.protein_g + (log.protein_g ?? 0),
    carbs_g: totals.carbs_g + (log.carbs_g ?? 0),
    fat_g: totals.fat_g + (log.fat_g ?? 0),
  };
}

/**
 * Returns the inclusive list of YYYYMMDD between startDate and endDate.
 * Falls back to a single-element list when bounds don't parse — the caller
 * already validated the dates upstream, so this guard is defensive only.
 */
export function enumerateDateRange(startDate: string, endDate: string): string[] {
  if (!parseYYYYMMDD(startDate) || !parseYYYYMMDD(endDate) || startDate > endDate) {
    return [startDate];
  }
  const dates: string[] = [];
  let cursor: string | null = startDate;
  while (cursor && cursor <= endDate) {
    dates.push(cursor);
    cursor = shiftYYYYMMDD(cursor, 1);
  }
  return dates;
}

/**
 * Rolls up raw meal_logs into per-day briefs and pre-computes the metrics
 * the historical UI blocks need (7d / range averages, target hit count).
 *
 * Pure function: no React, no Supabase, fully unit-testable.
 *
 * - `daysHittingTargetWeek` is null when no target is set (awareness mode).
 * - "Hitting" the target means consumed ≥ target; we don't penalise overshoot
 *   because the philosophy is awareness, not gamification.
 */
export function buildRangeSummary(
  logs: MealLog[],
  startDate: string,
  endDate: string,
  targetCalories: number | null,
): NutritionRangeSummary {
  const allDates = enumerateDateRange(startDate, endDate);
  const briefMap = new Map<string, DailyNutritionBrief>();
  for (const date of allDates) briefMap.set(date, emptyBrief(date));

  for (const log of logs) {
    const brief = briefMap.get(log.logged_date);
    if (!brief) continue; // log outside the range — defensive
    brief.totals = addToTotals(brief.totals, log);
    brief.hasEntries = true;
  }

  const days = Array.from(briefMap.values());
  const daysWithEntries = days.filter((d) => d.hasEntries).length;

  // Most recent 7 days = the tail of the array (we built it ascending).
  const last7 = days.slice(-7);
  const avgCalories7d = average(last7.filter((d) => d.hasEntries).map((d) => d.totals.calories));
  const avgCaloriesRange = average(days.filter((d) => d.hasEntries).map((d) => d.totals.calories));

  const daysHittingTargetWeek =
    targetCalories == null ? null : last7.filter((d) => d.hasEntries && d.totals.calories >= targetCalories).length;

  return {
    startDate,
    endDate,
    days,
    avgCalories7d,
    avgCaloriesRange,
    daysWithEntries,
    daysHittingTargetWeek,
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round(sum / values.length);
}
