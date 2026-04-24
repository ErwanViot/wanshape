import type { ExperienceDuree, FrequenceActuelle } from '../../types/custom-program.ts';
import type { Equipment } from '../../types/equipment.ts';

export const OBJECTIF_OPTIONS: { value: string }[] = [
  { value: 'perte_poids' },
  { value: 'prise_muscle' },
  { value: 'remise_forme' },
  { value: 'force' },
  { value: 'endurance' },
  { value: 'performance_sportive' },
  { value: 'bien_etre' },
  { value: 'souplesse' },
];

export const EXPERIENCE_OPTIONS: { value: ExperienceDuree }[] = [
  { value: 'debutant' },
  { value: 'six_mois_deux_ans' },
  { value: 'plus_deux_ans' },
];

export const FREQUENCE_OPTIONS: { value: FrequenceActuelle }[] = [
  { value: 'jamais' },
  { value: 'une_deux' },
  { value: 'trois_quatre' },
  { value: 'cinq_plus' },
];

export const BLESSURE_OPTIONS: { value: string }[] = [
  { value: 'genou' },
  { value: 'dos' },
  { value: 'epaule' },
  { value: 'cheville' },
  { value: 'poignet' },
  { value: 'cervicales' },
  { value: 'hanche' },
  { value: 'autre' },
];

/** Equipment options for program creation — subset relevant for structured programs + gym option */
export const MATERIEL_OPTIONS: { value: Equipment | 'salle' }[] = [
  { value: 'poids_du_corps' },
  { value: 'halteres' },
  { value: 'barre_disques' },
  { value: 'kettlebell' },
  { value: 'elastiques' },
  { value: 'banc' },
  { value: 'barre_traction' },
  { value: 'trx' },
  { value: 'corde_a_sauter' },
  { value: 'medecine_ball' },
  { value: 'salle' },
];

export const DUREE_OPTIONS: { value: 4 | 8 | 12; recommended?: boolean }[] = [
  { value: 4 },
  { value: 8, recommended: true },
  { value: 12 },
];

export const LOADING_PHASES_COUNT = 4;
