import { EXERCISES_DATA } from '../data/exercises.ts';
import exercisesEn from '../i18n/locales/en/exercises_data.json';
import exercisesFr from '../i18n/locales/fr/exercises_data.json';

type LocaleExerciseEntry = {
  name: string;
  aliases?: string[];
  variants?: { name: string; description?: string }[];
};

type LocaleExercisesMap = Record<string, LocaleExerciseEntry>;

const localeMaps: LocaleExercisesMap[] = [exercisesFr as LocaleExercisesMap, exercisesEn as LocaleExercisesMap];

/** Lowercase, strip accents */
function normalize(name: string): string {
  return name.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
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

// Build lookup from every supported locale so AI-generated sessions match
// regardless of whether they were produced in FR or EN.
for (const ex of EXERCISES_DATA) {
  const entry: ExerciseLink = { slug: ex.slug };

  for (const map of localeMaps) {
    const localized = map[ex.slug];
    if (!localized) continue;

    linkMap.set(normalize(localized.name), entry);
    for (const alias of localized.aliases ?? []) {
      linkMap.set(normalize(alias), entry);
    }

    for (const v of localized.variants ?? []) {
      linkMap.set(normalize(v.name), { slug: ex.slug, anchor: slugify(v.name) });
    }
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
