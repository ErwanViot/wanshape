import { EXERCISES_DATA } from '../data/exercises.ts';

/** Lowercase, strip accents */
function normalize(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Exact lookup: normalized name → video URL */
const exactMap = new Map<string, string>();

// Build lookup table once at module load
for (const ex of EXERCISES_DATA) {
  const mainVideo = ex.video;

  // Main name + aliases → exercise video
  if (mainVideo) {
    exactMap.set(normalize(ex.name), mainVideo);
    for (const a of ex.aliases) {
      exactMap.set(normalize(a), mainVideo);
    }
  }

  // Variants → only if the variant has its own video
  for (const v of ex.variants) {
    if (v.video) {
      exactMap.set(normalize(v.name), v.video);
    }
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
