/**
 * Privacy-minimization helpers for `programs.onboarding_data`.
 *
 * RGPD art. 5(1)(c) — data minimization: only persist what the feature
 * actually needs downstream. `age` and `sexe` are sent to Anthropic at
 * generation time (disclosed in the Privacy Policy) but never re-used by
 * the app afterwards — storing them long-term in Supabase would create
 * unnecessary exposure, especially combined with declared injuries which
 * can shift the dataset toward RGPD art. 9 (health data).
 *
 * `onboarding_data` is preserved as a jsonb column for future replay /
 * debugging of the generation; we project it to the subset that is safe
 * to keep at rest.
 */

/**
 * Keep in sync with `PersistedProgramOnboarding` in
 * `src/types/custom-program.ts` — same shape, duplicated because Deno edge
 * functions cannot import from `src/`.
 *
 * `objectif_detail` and `blessure_detail` are free-text fields retained for
 * future replay/debugging of the AI generation. `blessure_detail` in
 * particular sits close to RGPD art. 9 (health data); its retention is
 * justified by the need to reconstruct why the AI produced a given program
 * and by the explicit user input. Revisit if the feature no longer requires
 * the replay capability.
 */
export interface PersistableOnboarding {
  objectifs: string[];
  objectif_detail?: string;
  experience_duree: string;
  frequence_actuelle: string;
  blessures: string[];
  blessure_detail?: string;
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: string[];
  duree_semaines: number;
}

/**
 * Strips `age` and `sexe` (and any unknown key, defensive) from the raw
 * request body before it is written to `programs.onboarding_data`.
 */
export function sanitizeOnboardingForPersistence(
  body: PersistableOnboarding & { age?: number; sexe?: string; [key: string]: unknown },
): PersistableOnboarding {
  return {
    objectifs: body.objectifs,
    objectif_detail: body.objectif_detail,
    experience_duree: body.experience_duree,
    frequence_actuelle: body.frequence_actuelle,
    blessures: body.blessures,
    blessure_detail: body.blessure_detail,
    seances_par_semaine: body.seances_par_semaine,
    duree_seance_minutes: body.duree_seance_minutes,
    materiel: body.materiel,
    duree_semaines: body.duree_semaines,
  };
}
