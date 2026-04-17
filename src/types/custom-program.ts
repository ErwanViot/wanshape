import type { Equipment } from './equipment.ts';

export type ExperienceDuree = 'debutant' | 'six_mois_deux_ans' | 'plus_deux_ans';
export type FrequenceActuelle = 'jamais' | 'une_deux' | 'trois_quatre' | 'cinq_plus';

/**
 * What the UI collects and sends to the `generate-program` edge function.
 * `age` and `sexe` are transmitted to Anthropic at generation time (disclosed
 * in the Privacy Policy) but are NOT persisted afterwards — see
 * `PersistedProgramOnboarding` below and `supabase/functions/generate-program/sanitize.ts`.
 */
export interface ProgramOnboardingInput {
  objectifs: string[];
  objectif_detail?: string;
  experience_duree: ExperienceDuree;
  frequence_actuelle: FrequenceActuelle;
  blessures: string[];
  blessure_detail?: string;
  age?: number;
  sexe?: 'homme' | 'femme' | 'autre';
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: Equipment[];
  duree_semaines: 4 | 8 | 12;
}

/**
 * What is actually stored at rest in `programs.onboarding_data`. Mirrors
 * `ProgramOnboardingInput` minus `age` and `sexe` (RGPD minimization).
 * Keep this in sync with `PersistableOnboarding` in
 * `supabase/functions/generate-program/sanitize.ts` — same shape, duplicated
 * because Deno edge functions cannot import from `src/`.
 */
export type PersistedProgramOnboarding = Omit<ProgramOnboardingInput, 'age' | 'sexe'>;

export interface ProgramProgression {
  logique: string;
  cible_semaine_3?: string;
  cible_semaine_6?: string;
  cible_semaine_8?: string;
  cible_semaine_12?: string;
}

export interface GenerateProgramResponse {
  programId: string;
  slug: string;
}
