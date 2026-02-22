const SLUG_MAP: Record<string, string> = {
  pyramide: 'pyramid',
  renforcement: 'classic',
  superset: 'superset',
  emom: 'emom',
  circuit: 'circuit',
  amrap: 'amrap',
  hiit: 'hiit',
  tabata: 'tabata',
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_MAP).map(([slug, type]) => [type, slug])
);

export function formatSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatTypeToSlug(type: string): string {
  return REVERSE_MAP[type] ?? formatSlug(type);
}

export function slugToFormatType(slug: string): string | undefined {
  return SLUG_MAP[slug];
}
