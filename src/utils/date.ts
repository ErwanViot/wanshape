export function formatDateToDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}${mm}${yyyy}`;
}

export function parseDDMMYYYY(str: string): Date {
  const dd = parseInt(str.slice(0, 2), 10);
  const mm = parseInt(str.slice(2, 4), 10) - 1;
  const yyyy = parseInt(str.slice(4, 8), 10);
  return new Date(yyyy, mm, dd);
}

export function getTodayKey(): string {
  return formatDateToDDMMYYYY(new Date());
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDurationLong(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 1) return `${seconds}s`;
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m} min`;
}
