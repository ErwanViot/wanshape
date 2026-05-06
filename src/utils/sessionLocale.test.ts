import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { Session } from '../types/session.ts';
import { localizedSessionData } from './sessionLocale.ts';

function makeT(catalog: Record<string, unknown>): TFunction {
  return ((key: string, options?: { defaultValue?: unknown }) => {
    if (key in catalog) return catalog[key];
    return options?.defaultValue ?? null;
  }) as unknown as TFunction;
}

const baseSession: Session = {
  date: '2026-05-06',
  title: 'Découverte Full-Body',
  description: 'Premiers mouvements',
  estimatedDuration: 25,
  focus: ['full-body', 'mobilité'],
  blocks: [
    {
      type: 'warmup',
      name: 'Échauffement',
      exercises: [
        { name: 'Jumping jacks', duration: 30, instructions: 'Rythme soutenu' },
        { name: 'Cercles épaules', duration: 30, instructions: 'Mouvement contrôlé' },
      ],
    },
    {
      type: 'classic',
      name: 'Renforcement bas du corps',
      restBetweenExercises: 30,
      exercises: [{ name: 'Squats', sets: 3, reps: 12, restBetweenSets: 60, instructions: 'Dos droit' }],
    },
  ],
};

describe('localizedSessionData', () => {
  it('returns the DB session unchanged for an unknown program slug (AI-generated programs)', () => {
    const t = makeT({});
    const result = localizedSessionData('user-ai-program', 1, baseSession, t);
    expect(result).toBe(baseSession); // identity, no clone
  });

  it('returns the DB session unchanged when no i18n entry exists for that fixed program/order', () => {
    const t = makeT({}); // catalog empty
    const result = localizedSessionData('cardio-express', 99, baseSession, t);
    expect(result).toEqual(baseSession);
  });

  it('overrides title, description and focus when i18n provides them', () => {
    const t = makeT({
      'sessions_data:debutant-4-semaines.1': {
        title: 'Discovery Full-Body',
        description: 'First moves',
        focus: ['full-body', 'mobility'],
      },
    });
    const result = localizedSessionData('debutant-4-semaines', 1, baseSession, t);
    expect(result.title).toBe('Discovery Full-Body');
    expect(result.description).toBe('First moves');
    expect(result.focus).toEqual(['full-body', 'mobility']);
  });

  it('preserves DB structural fields (sets, reps, duration, restBetween*, type) under i18n merge', () => {
    const t = makeT({
      'sessions_data:debutant-4-semaines.1': {
        title: 'Discovery Full-Body',
        blocks: [
          {
            name: 'Warm-up',
            exercises: [
              { name: 'Jumping jacks EN', instructions: 'Steady pace' },
              { name: 'Shoulder circles', instructions: 'Controlled' },
            ],
          },
          {
            name: 'Lower-body strength',
            exercises: [{ name: 'Squats', instructions: 'Back straight' }],
          },
        ],
      },
    });
    const result = localizedSessionData('debutant-4-semaines', 1, baseSession, t);
    // Block names overridden
    expect(result.blocks[0].name).toBe('Warm-up');
    expect(result.blocks[1].name).toBe('Lower-body strength');
    // Block types unchanged
    expect(result.blocks[0].type).toBe('warmup');
    expect(result.blocks[1].type).toBe('classic');
    // Exercise names/instructions overridden
    const warmup = result.blocks[0] as { exercises: { name: string; instructions: string; duration: number }[] };
    expect(warmup.exercises[0].name).toBe('Jumping jacks EN');
    expect(warmup.exercises[0].instructions).toBe('Steady pace');
    expect(warmup.exercises[0].duration).toBe(30); // structural, untouched
    // Classic block keeps sets/reps/rest from DB
    const classic = result.blocks[1] as {
      restBetweenExercises: number;
      exercises: { sets: number; reps: number; restBetweenSets: number }[];
    };
    expect(classic.restBetweenExercises).toBe(30);
    expect(classic.exercises[0].sets).toBe(3);
    expect(classic.exercises[0].reps).toBe(12);
    expect(classic.exercises[0].restBetweenSets).toBe(60);
  });

  it('leaves DB blocks intact when i18n has fewer blocks than DB', () => {
    const t = makeT({
      'sessions_data:cardio-express.1': {
        title: 'Cardio',
        blocks: [{ name: 'Warm-up only' }], // only 1 block, DB has 2
      },
    });
    const result = localizedSessionData('cardio-express', 1, baseSession, t);
    expect(result.blocks[0].name).toBe('Warm-up only');
    expect(result.blocks[1].name).toBe('Renforcement bas du corps'); // DB FR preserved
  });

  it('leaves DB exercises intact when i18n has fewer exercises than DB inside a block', () => {
    const t = makeT({
      'sessions_data:cardio-express.1': {
        title: 'Cardio',
        blocks: [
          {
            name: 'Warm-up',
            exercises: [{ name: 'Jumping jacks EN', instructions: 'Steady pace' }],
            // i18n has only 1 exercise, DB has 2
          },
        ],
      },
    });
    const result = localizedSessionData('cardio-express', 1, baseSession, t);
    const warmup = result.blocks[0] as { exercises: { name: string; instructions: string }[] };
    expect(warmup.exercises[0].name).toBe('Jumping jacks EN');
    expect(warmup.exercises[1].name).toBe('Cercles épaules'); // DB FR preserved
  });

  it('merges superset pairs without losing structural fields', () => {
    const supersetSession: Session = {
      ...baseSession,
      blocks: [
        {
          type: 'superset',
          name: 'Pectoraux & dos',
          sets: 3,
          restBetweenSets: 60,
          pairs: [
            {
              exercises: [
                { name: 'Pompes', reps: 10, instructions: 'Coudes serrés' },
                { name: 'Tractions', reps: 8, instructions: 'Mouvement complet' },
              ],
            },
          ],
        },
      ],
    };
    const t = makeT({
      'sessions_data:remise-en-forme.3': {
        title: 'Chest & back',
        blocks: [
          {
            name: 'Chest & back',
            pairs: [
              {
                exercises: [
                  { name: 'Push-ups', instructions: 'Elbows tight' },
                  { name: 'Pull-ups', instructions: 'Full range' },
                ],
              },
            ],
          },
        ],
      },
    });
    const result = localizedSessionData('remise-en-forme', 3, supersetSession, t);
    const block = result.blocks[0] as {
      type: 'superset';
      name: string;
      sets: number;
      restBetweenSets: number;
      pairs: { exercises: { name: string; instructions: string; reps: number }[] }[];
    };
    expect(block.type).toBe('superset');
    expect(block.name).toBe('Chest & back');
    expect(block.sets).toBe(3); // structural, untouched
    expect(block.restBetweenSets).toBe(60);
    expect(block.pairs[0].exercises[0].name).toBe('Push-ups');
    expect(block.pairs[0].exercises[0].reps).toBe(10);
    expect(block.pairs[0].exercises[1].name).toBe('Pull-ups');
  });

  it('does not mutate the input DB session', () => {
    const t = makeT({
      'sessions_data:cardio-express.1': {
        title: 'Cardio',
        blocks: [{ name: 'Warm-up EN' }],
      },
    });
    const original = JSON.parse(JSON.stringify(baseSession)) as Session;
    localizedSessionData('cardio-express', 1, baseSession, t);
    expect(baseSession).toEqual(original);
  });

  it('falls back to DB title when i18n title is empty string', () => {
    const t = makeT({
      'sessions_data:cardio-express.1': {
        title: '',
      },
    });
    const result = localizedSessionData('cardio-express', 1, baseSession, t);
    expect(result.title).toBe('Découverte Full-Body');
  });
});
