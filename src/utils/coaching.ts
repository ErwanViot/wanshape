/**
 * Parses a consignes_semaine key into the weeks it covers. Accepts the same
 * grammar as the edge validator (weeksFromConsigneKey in
 * supabase/functions/generate-program/validate.ts): "3", "1-4", "1,3-5",
 * "9, 10, 11". Malformed parts are ignored.
 */
export function weeksFromConsigneKey(key: string): number[] {
  const weeks: number[] = [];
  for (const part of key.split(',')) {
    const bounds = part.trim().split('-');
    if (bounds.length === 2) {
      const start = Number.parseInt(bounds[0], 10);
      const end = Number.parseInt(bounds[1], 10);
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) continue;
      for (let w = start; w <= end; w++) weeks.push(w);
    } else {
      const n = Number.parseInt(part.trim(), 10);
      if (!Number.isNaN(n)) weeks.push(n);
    }
  }
  return weeks;
}

/** Finds the coaching note matching a given week number from range-keyed consignes. */
export function getConsigneForWeek(consignes: Record<string, string> | null, week: number): string | null {
  if (!consignes) return null;
  for (const [range, text] of Object.entries(consignes)) {
    if (weeksFromConsigneKey(range).includes(week)) return text;
  }
  return null;
}
