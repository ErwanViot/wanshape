/** Finds the coaching note matching a given week number from range-keyed consignes. */
export function getConsigneForWeek(consignes: Record<string, string> | null, week: number): string | null {
  if (!consignes) return null;
  for (const [range, text] of Object.entries(consignes)) {
    const parts = range.split('-').map(Number);
    if (parts.length === 1 && parts[0] === week) return text;
    if (parts.length === 2 && week >= parts[0] && week <= parts[1]) return text;
  }
  return null;
}
