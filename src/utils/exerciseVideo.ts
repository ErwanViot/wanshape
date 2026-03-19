import { EXERCISES_DATA } from '../data/exercises.ts';

/** Lowercase, strip accents */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Exact lookup: normalized name → video URL */
const exactMap = new Map<string, string>();

/** Prefix lookup: sorted longest-first for fuzzy matching */
const prefixCandidates: { name: string; video: string }[] = [];

// Build lookup tables once at module load
for (const ex of EXERCISES_DATA) {
  const mainVideo = ex.video;

  // Main name + aliases → exercise video
  if (mainVideo) {
    exactMap.set(normalize(ex.name), mainVideo);
    for (const a of ex.aliases) {
      exactMap.set(normalize(a), mainVideo);
    }
  }

  // Variants → variant video (or parent fallback)
  for (const v of ex.variants) {
    const video = v.video ?? mainVideo;
    if (video) {
      exactMap.set(normalize(v.name), video);
    }
  }

  // Prefix candidates (aliases are typically short/generic, best for prefix matching)
  if (mainVideo) {
    prefixCandidates.push({ name: normalize(ex.name), video: mainVideo });
    for (const a of ex.aliases) {
      prefixCandidates.push({ name: normalize(a), video: mainVideo });
    }
  }
  for (const v of ex.variants) {
    const video = v.video ?? mainVideo;
    if (video) {
      prefixCandidates.push({ name: normalize(v.name), video });
    }
  }
}

prefixCandidates.sort((a, b) => b.name.length - a.name.length);

/**
 * Returns the video URL for an exercise name by searching:
 * 1. Exact match on exercise name, alias, or variant → specific video
 * 2. Fuzzy prefix match (longest known name that is a prefix of input)
 *
 * Note: prefix matching can produce false positives for exercises sharing
 * a common prefix (e.g. "Planche laterale" matching "Planche"). This is
 * acceptable as a v1 heuristic since most session names match exactly.
 */
export function getExerciseVideoUrl(exerciseName: string): string | null {
  const key = normalize(exerciseName);

  // 1. Exact match (O(1))
  const exact = exactMap.get(key);
  if (exact) return exact;

  // 2. Fuzzy prefix match
  for (const c of prefixCandidates) {
    if (key.startsWith(c.name) && (key.length === c.name.length || key[c.name.length] === ' ')) {
      return c.video;
    }
  }

  return null;
}
