import { EXERCISES_DATA } from '../data/exercises.ts';

/** Lowercase, strip accents, spaces → hyphens */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

interface ExerciseLink {
  slug: string;
  anchor?: string;
}

const linkMap = new Map<string, ExerciseLink>();

for (const ex of EXERCISES_DATA) {
  const entry: ExerciseLink = { slug: ex.slug };

  // Main name + aliases
  linkMap.set(normalize(ex.name), entry);
  for (const alias of ex.aliases) {
    linkMap.set(normalize(alias), entry);
  }

  // Variants → link to parent with anchor
  for (const v of ex.variants) {
    linkMap.set(normalize(v.name), { slug: ex.slug, anchor: slugify(v.name) });
  }
}

/** Returns { slug, anchor? } if the exercise has a dedicated page, null otherwise. */
export function getExerciseLink(name: string): ExerciseLink | null {
  return linkMap.get(normalize(name)) ?? null;
}
