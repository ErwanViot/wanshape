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

/** Exact lookup: normalized name → video URL */
const exactMap = new Map<string, string>();

// Build lookup table once at module load, covering every supported locale so
// AI-generated sessions resolve to the right video regardless of the language
// the session was produced in.
for (const ex of EXERCISES_DATA) {
  const mainVideo = ex.video;

  for (const map of localeMaps) {
    const localized = map[ex.slug];
    if (!localized) continue;

    if (mainVideo) {
      exactMap.set(normalize(localized.name), mainVideo);
      for (const a of localized.aliases ?? []) {
        exactMap.set(normalize(a), mainVideo);
      }
    }

    (localized.variants ?? []).forEach((v, i) => {
      const variantVideo = ex.variantVideos?.[i];
      if (variantVideo) {
        exactMap.set(normalize(v.name), variantVideo);
      }
    });
  }
}

/**
 * Returns the video URL for an exercise name.
 * Only exact matches on exercise name, alias, or variant are returned.
 * No fuzzy/prefix matching to avoid showing incorrect demos
 * (e.g. "Pompes diamant" should not show "Pompes" video).
 */
export function getExerciseVideoUrl(exerciseName: string): string | null {
  return exactMap.get(normalize(exerciseName)) ?? null;
}
