import { EXERCISES_DATA } from '../data/exercises.ts';

/** Lowercase, strip accents */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Lowercase, strip accents, spaces → hyphens */
export function slugify(name: string): string {
  return normalize(name).replace(/\s+/g, '-');
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

// Sorted known names from longest to shortest for prefix matching
const sortedKeys = [...linkMap.keys()].sort((a, b) => b.length - a.length);

/** Returns { slug, anchor? } if the exercise has a dedicated page, null otherwise. */
export function getExerciseLink(name: string): ExerciseLink | null {
  const key = normalize(name);

  // 1. Exact match
  const exact = linkMap.get(key);
  if (exact) return exact;

  // 2. Fuzzy prefix: find the longest known name that is a prefix of the input
  //    e.g. "Pompes sur genoux" → matches "pompes" → links to pompes-classiques
  for (const known of sortedKeys) {
    if (key.startsWith(known) && (key.length === known.length || key[known.length] === ' ')) {
      return linkMap.get(known)!;
    }
  }

  return null;
}
