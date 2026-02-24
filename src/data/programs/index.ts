import type { Session } from '../../types/session.ts';
import { cardioExpressSessions } from './cardio-express.ts';
import { debutant4SemainesSessions } from './debutant-4-semaines.ts';
import { remiseEnFormeSessions } from './remise-en-forme.ts';

export interface ProgramSeed {
  slug: string;
  sessions: { weekNumber: number; sessionOrder: number; data: Session }[];
}

export const PROGRAM_SEEDS: ProgramSeed[] = [
  {
    slug: 'debutant-4-semaines',
    sessions: debutant4SemainesSessions.map((s, i) => ({
      weekNumber: 1,
      sessionOrder: i + 1,
      data: s,
    })),
  },
  {
    slug: 'remise-en-forme',
    sessions: remiseEnFormeSessions.map((s, i) => ({
      weekNumber: 1,
      sessionOrder: i + 1,
      data: s,
    })),
  },
  {
    slug: 'cardio-express',
    sessions: cardioExpressSessions.map((s, i) => ({
      weekNumber: 1,
      sessionOrder: i + 1,
      data: s,
    })),
  },
];
