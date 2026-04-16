/**
 * YYYYMMDD helpers for meal_logs.logged_date.
 *
 * Critical: we MUST format using the user's LOCAL date. Using `toISOString()`
 * would use UTC and drift by ±1 day for users outside UTC±1h (e.g. a 23h dinner
 * in Paris would land on the next day). This convention matches the existing
 * `session_completions.session_date` format.
 */
export function formatLocalYYYYMMDD(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function parseYYYYMMDD(value: string): Date | null {
  if (!/^\d{8}$/.test(value)) return null;
  const y = Number.parseInt(value.slice(0, 4), 10);
  const m = Number.parseInt(value.slice(4, 6), 10) - 1;
  const d = Number.parseInt(value.slice(6, 8), 10);
  const date = new Date(y, m, d);
  // Sanity: did the Date constructor roll over? e.g. 20260230 → March 2
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return date;
}

export function todayYYYYMMDD(): string {
  return formatLocalYYYYMMDD(new Date());
}

/**
 * Shifts a YYYYMMDD string by `days` (positive or negative) in the local
 * timezone. Returns a new YYYYMMDD string, or null if the input is invalid.
 */
export function shiftYYYYMMDD(value: string, days: number): string | null {
  const parsed = parseYYYYMMDD(value);
  if (!parsed) return null;
  parsed.setDate(parsed.getDate() + days);
  return formatLocalYYYYMMDD(parsed);
}

/**
 * Human-readable label like "aujourd'hui", "hier", or "lun. 17 avr.".
 * Locale-aware French.
 */
export function formatDateLabel(value: string, now: Date = new Date()): string {
  const parsed = parseYYYYMMDD(value);
  if (!parsed) return value;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays === -1) return 'demain';

  return parsed.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
