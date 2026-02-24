import type { BlockType } from '../types/session.ts';

export const BLOCK_COLORS: Record<BlockType, string> = {
  warmup: '#F97316',
  cooldown: '#0EA5E9',
  classic: '#6366F1',
  circuit: '#7C3AED',
  hiit: '#DC2626',
  tabata: '#B91C1C',
  emom: '#0D9488',
  amrap: '#D97706',
  superset: '#4F46E5',
  pyramid: '#9333EA',
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  warmup: 'Échauffement',
  cooldown: 'Retour au calme',
  classic: 'Renforcement',
  circuit: 'Circuit',
  hiit: 'HIIT',
  tabata: 'Tabata',
  emom: 'EMOM',
  amrap: 'AMRAP',
  superset: 'Superset',
  pyramid: 'Pyramide',
};

export const TABATA_DEFAULTS = {
  sets: 1,
  rounds: 8,
  work: 20,
  rest: 10,
  restBetweenSets: 60,
} as const;

export const TRANSITION_DURATION = 4;
export const FIRST_TRANSITION_DURATION = 8;
export const INTER_BLOCK_REST = 60;
export const PREPARE_COUNTDOWN = 3;
export const DEFAULT_REST_FOR_REPS = 5;
