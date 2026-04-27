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

export interface RelativeDayLabels {
  today: string;
  yesterday: string;
  tomorrow: string;
}

/**
 * Human-readable label like "today", "yesterday", or "Mon, Apr 17".
 * Caller passes the locale and translated relative labels so this utility
 * stays pure (no React / i18n dependency).
 */
export function formatDateLabel(
  value: string,
  options: { locale?: string; labels?: RelativeDayLabels; now?: Date } = {},
): string {
  const parsed = parseYYYYMMDD(value);
  if (!parsed) return value;

  const { locale = 'fr', labels, now = new Date() } = options;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));

  const fallback: RelativeDayLabels = { today: "aujourd'hui", yesterday: 'hier', tomorrow: 'demain' };
  const relative = labels ?? fallback;

  if (diffDays === 0) return relative.today;
  if (diffDays === 1) return relative.yesterday;
  if (diffDays === -1) return relative.tomorrow;

  return parsed.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}
