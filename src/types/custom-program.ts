export type Materiel =
  | 'poids_du_corps' | 'halteres' | 'barre_disques' | 'kettlebell'
  | 'elastiques' | 'banc' | 'barre_traction' | 'trx'
  | 'corde_a_sauter' | 'medecine_ball';

export type ExperienceDuree = 'debutant' | 'six_mois_deux_ans' | 'plus_deux_ans';
export type FrequenceActuelle = 'jamais' | 'une_deux' | 'trois_quatre' | 'cinq_plus';

export interface ProgramOnboardingInput {
  objectifs: string[];
  objectif_detail?: string;
  sport?: string;
  jour_match?: string;
  experience_duree: ExperienceDuree;
  frequence_actuelle: FrequenceActuelle;
  blessures: string[];
  blessure_detail?: string;
  age?: number;
  sexe?: 'homme' | 'femme' | 'autre';
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: Materiel[];
  duree_semaines: 4 | 8 | 12;
}

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
