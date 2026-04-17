import type { ExperienceDuree, FrequenceActuelle } from '../../types/custom-program.ts';
import type { Equipment } from '../../types/equipment.ts';

export const OBJECTIF_OPTIONS = [
  { value: 'perte_poids', label: 'Perte de poids' },
  { value: 'prise_muscle', label: 'Prise de muscle' },
  { value: 'remise_forme', label: 'Remise en forme' },
  { value: 'force', label: 'Force' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'performance_sportive', label: 'Performance sportive' },
  { value: 'bien_etre', label: 'Bien-être' },
  { value: 'souplesse', label: 'Souplesse' },
];

export const EXPERIENCE_OPTIONS: { value: ExperienceDuree; label: string; desc: string }[] = [
  { value: 'debutant', label: 'Débutant', desc: 'Moins de 6 mois' },
  { value: 'six_mois_deux_ans', label: '6 mois - 2 ans', desc: 'Pratique régulière' },
  { value: 'plus_deux_ans', label: '+2 ans', desc: 'Expérimenté' },
];

export const FREQUENCE_OPTIONS: { value: FrequenceActuelle; label: string }[] = [
  { value: 'jamais', label: 'Jamais' },
  { value: 'une_deux', label: '1-2x / sem' },
  { value: 'trois_quatre', label: '3-4x / sem' },
  { value: 'cinq_plus', label: '5+ / sem' },
];

export const BLESSURE_OPTIONS = [
  { value: 'genou', label: 'Genou' },
  { value: 'dos', label: 'Dos / Lombaires' },
  { value: 'epaule', label: 'Épaule' },
  { value: 'cheville', label: 'Cheville' },
  { value: 'poignet', label: 'Poignet' },
  { value: 'cervicales', label: 'Cervicales' },
  { value: 'hanche', label: 'Hanche' },
  { value: 'autre', label: 'Autre' },
];

/** Equipment options for program creation — subset relevant for structured programs + gym option */
export const MATERIEL_OPTIONS: { value: Equipment | 'salle'; label: string }[] = [
  { value: 'poids_du_corps', label: 'Poids du corps' },
  { value: 'halteres', label: 'Haltères' },
  { value: 'barre_disques', label: 'Barre & disques' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'elastiques', label: 'Élastiques' },
  { value: 'banc', label: 'Banc' },
  { value: 'barre_traction', label: 'Barre de traction' },
  { value: 'trx', label: 'TRX / Sangles' },
  { value: 'corde_a_sauter', label: 'Corde à sauter' },
  { value: 'medecine_ball', label: 'Medicine ball' },
  { value: 'salle', label: 'Salle de sport (machines)' },
];

export const DUREE_OPTIONS: { value: 4 | 8 | 12; label: string; recommended?: boolean }[] = [
  { value: 4, label: '4 semaines' },
  { value: 8, label: '8 semaines', recommended: true },
  { value: 12, label: '12 semaines' },
];

export const LOADING_PHASES = [
  { text: 'Analyse de ton profil...', duration: 5000 },
  { text: 'Conception des séances...', duration: 20000 },
  { text: 'Planification du calendrier...', duration: 10000 },
  { text: 'Dernières vérifications...', duration: 10000 },
];
