import { EXERCISES_DATA } from '../data/exercises.ts';

/** Lowercase, strip accents */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Returns the video URL for an exercise name by searching:
 * 1. Exact match on exercise name or alias → exercise video
 * 2. Exact match on variant name → variant video (or parent video)
 * 3. Fuzzy prefix match on known names
 * Returns null if no match or no video found.
 */
export function getExerciseVideoUrl(exerciseName: string): string | null {
  const key = normalize(exerciseName);

  for (const ex of EXERCISES_DATA) {
    // Check main name and aliases
    if (normalize(ex.name) === key || ex.aliases.some((a) => normalize(a) === key)) {
      return ex.video ?? null;
    }

    // Check variants — return variant-specific video if available
    for (const v of ex.variants) {
      if (normalize(v.name) === key) {
        return v.video ?? ex.video ?? null;
      }
    }
  }

  // Fuzzy prefix: "Pompes sur genoux" → match "Pompes" alias → pompes-classiques
  // Build a list of all names with their video, sorted longest first
  const candidates: { name: string; video: string | undefined }[] = [];
  for (const ex of EXERCISES_DATA) {
    candidates.push({ name: normalize(ex.name), video: ex.video });
    for (const a of ex.aliases) {
      candidates.push({ name: normalize(a), video: ex.video });
    }
    for (const v of ex.variants) {
      candidates.push({ name: normalize(v.name), video: v.video ?? ex.video });
    }
  }
  candidates.sort((a, b) => b.name.length - a.name.length);

  for (const c of candidates) {
    if (key.startsWith(c.name) && (key.length === c.name.length || key[c.name.length] === ' ')) {
      return c.video ?? null;
    }
  }

  return null;
}
