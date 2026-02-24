import type { Session } from '../../types/session.ts';
import { cardioExpressSessions } from './cardio-express.ts';
import { debutant4SemainesSessions } from './debutant-4-semaines.ts';
import { remiseEnFormeSessions } from './remise-en-forme.ts';

export interface ProgramSeed {
  slug: string;
  sessionsPerWeek: number;
  sessions: { weekNumber: number; sessionOrder: number; data: Session }[];
}

function mapSessions(sessions: Session[], perWeek: number) {
  return sessions.map((s, i) => ({
    weekNumber: Math.floor(i / perWeek) + 1,
    sessionOrder: i + 1,
    data: s,
  }));
}

export const PROGRAM_SEEDS: ProgramSeed[] = [
  {
    slug: 'debutant-4-semaines',
    sessionsPerWeek: 3,
    sessions: mapSessions(debutant4SemainesSessions, 3),
  },
  {
    slug: 'remise-en-forme',
    sessionsPerWeek: 4,
    sessions: mapSessions(remiseEnFormeSessions, 4),
  },
  {
    slug: 'cardio-express',
    sessionsPerWeek: 3,
    sessions: mapSessions(cardioExpressSessions, 3),
  },
];
