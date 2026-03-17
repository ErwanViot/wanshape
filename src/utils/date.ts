export function formatDateKey(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${yyyy}${mm}${dd}`;
}

export function parseDateKey(str: string): Date {
  const yyyy = parseInt(str.slice(0, 4), 10);
  const mm = parseInt(str.slice(4, 6), 10) - 1;
  const dd = parseInt(str.slice(6, 8), 10);
  return new Date(yyyy, mm, dd);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateKey(d);
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

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}
