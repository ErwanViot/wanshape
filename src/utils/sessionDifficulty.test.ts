import { describe, it, expect } from 'vitest';
import { computeDifficulty } from './sessionDifficulty.ts';
import type { Session } from '../types/session.ts';

function makeSession(blocks: Session['blocks'], estimatedDuration = 30): Session {
  return {
    date: '24022026',
    title: 'Test',
    description: 'Test session',
    estimatedDuration,
    focus: ['Test'],
    blocks,
  };
}

describe('computeDifficulty', () => {
  it('returns accessible for warmup/cooldown only', () => {
    const session = makeSession([
      { type: 'warmup', name: 'Échauffement', exercises: [] },
      { type: 'cooldown', name: 'Retour au calme', exercises: [] },
    ]);
    const result = computeDifficulty(session);
    expect(result.level).toBe('accessible');
    expect(result.score).toBe(0);
  });

  it('returns accessible for single classic block', () => {
    const session = makeSession([
      { type: 'warmup', name: 'Échauffement', exercises: [] },
      { type: 'classic', name: 'Renforcement', restBetweenExercises: 30, exercises: [] },
      { type: 'cooldown', name: 'Retour au calme', exercises: [] },
    ]);
    const result = computeDifficulty(session);
    expect(result.level).toBe('accessible');
    expect(result.score).toBe(1);
  });

  it('returns modere for pyramid + classic', () => {
    const session = makeSession([
      { type: 'warmup', name: 'Échauffement', exercises: [] },
      { type: 'pyramid', name: 'Pyramide', pattern: [2, 4, 6, 4, 2], restBetweenSets: 15, exercises: [] },
      { type: 'classic', name: 'Renforcement', restBetweenExercises: 30, exercises: [] },
      { type: 'cooldown', name: 'Retour au calme', exercises: [] },
    ]);
    const result = computeDifficulty(session);
    // avg(2.5 + 1)/2 = 1.75 + 0.3 (multi-block) = 2.05 → modere
    expect(result.level).toBe('modere');
  });

  it('returns intense for HIIT + Tabata', () => {
    const session = makeSession([
      { type: 'warmup', name: 'Échauffement', exercises: [] },
      { type: 'hiit', name: 'HIIT', rounds: 8, work: 30, rest: 15, exercises: [] },
      { type: 'tabata', name: 'Tabata', exercises: [] },
      { type: 'cooldown', name: 'Retour au calme', exercises: [] },
    ]);
    const result = computeDifficulty(session);
    // avg(4 + 4.5)/2 = 4.25 + 0.5 (HIIT work/rest=2) + 0.5 (Tabata work/rest=2) + 0.3 (multi-block) = 5.55
    expect(result.level).toBe('intense');
    expect(result.score).toBeGreaterThanOrEqual(4);
  });

  it('adds long session bonus', () => {
    const short = makeSession([
      { type: 'classic', name: 'Renforcement', restBetweenExercises: 30, exercises: [] },
    ], 30);
    const long = makeSession([
      { type: 'classic', name: 'Renforcement', restBetweenExercises: 30, exercises: [] },
    ], 40);
    expect(computeDifficulty(long).score).toBeGreaterThan(computeDifficulty(short).score);
  });

  it('returns label in French', () => {
    const session = makeSession([
      { type: 'emom', name: 'EMOM', minutes: 12, exercises: [] },
    ]);
    const result = computeDifficulty(session);
    expect(result.label).toBe('Modéré');
  });
});
