import { describe, expect, it } from 'vitest';
import { validateSession } from './validate.ts';

/** Minimal session skeleton accepted by the validator. */
function baseSession(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Séance cardio',
    description: 'Une séance rapide pour transpirer',
    estimatedDuration: 30,
    focus: ['cardio'],
    blocks: [
      {
        type: 'warmup',
        name: 'Échauffement',
        exercises: [
          { name: 'Jumping jacks', duration: 60, instructions: 'Rester léger' },
        ],
      },
      {
        type: 'classic',
        name: 'Force',
        restBetweenExercises: 30,
        exercises: [
          {
            name: 'Squats',
            sets: 3,
            reps: 12,
            restBetweenSets: 60,
            instructions: 'Descendre jusquà la parallèle',
          },
        ],
      },
      {
        type: 'cooldown',
        name: 'Récup',
        exercises: [
          { name: 'Étirements', duration: 120, instructions: 'Respirer lentement' },
        ],
      },
    ],
    ...overrides,
  };
}

describe('validateSession — structural checks', () => {
  it('accepts a well-formed session', () => {
    expect(validateSession(baseSession()).valid).toBe(true);
  });

  it('rejects non-objects', () => {
    expect(validateSession(null).valid).toBe(false);
    expect(validateSession('string').valid).toBe(false);
    expect(validateSession(42).valid).toBe(false);
  });

  it('reports off-topic responses distinctly', () => {
    expect(validateSession({ error: 'off_topic' })).toEqual({ valid: false, error: 'off_topic' });
  });

  it.each([
    ['title', 'title is required'],
    ['description', 'description is required'],
  ])('requires a string %s', (field, error) => {
    const session = baseSession({ [field]: undefined });
    expect(validateSession(session)).toEqual({ valid: false, error });
  });

  it('requires a numeric estimatedDuration', () => {
    expect(validateSession(baseSession({ estimatedDuration: '30' })).valid).toBe(false);
    expect(validateSession(baseSession({ estimatedDuration: Number.NaN })).valid).toBe(false);
  });

  it('rejects an estimatedDuration far from the requested one', () => {
    const result = validateSession(baseSession({ estimatedDuration: 45 }), 30);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too far from requested');
  });

  it('allows estimatedDuration ±10 minutes from requested', () => {
    expect(validateSession(baseSession({ estimatedDuration: 40 }), 30).valid).toBe(true);
    expect(validateSession(baseSession({ estimatedDuration: 20 }), 30).valid).toBe(true);
  });

  it('rejects estimatedDuration at exactly diff = 11 (off-by-one guard)', () => {
    expect(validateSession(baseSession({ estimatedDuration: 41 }), 30).valid).toBe(false);
    expect(validateSession(baseSession({ estimatedDuration: 19 }), 30).valid).toBe(false);
  });

  it('requires a non-empty focus array', () => {
    expect(validateSession(baseSession({ focus: [] })).valid).toBe(false);
    expect(validateSession(baseSession({ focus: 'cardio' })).valid).toBe(false);
  });

  it('requires at least 2 blocks', () => {
    const [warmup] = baseSession().blocks as Array<Record<string, unknown>>;
    expect(validateSession(baseSession({ blocks: [warmup] })).valid).toBe(false);
  });

  it('requires the first block to be warmup', () => {
    const session = baseSession();
    const firstBlock = (session.blocks as Array<Record<string, unknown>>)[0];
    firstBlock.type = 'classic';
    expect(validateSession(session).error).toContain('First block must be warmup');
  });

  it('requires the last block to be cooldown', () => {
    const session = baseSession();
    const blocks = session.blocks as Array<Record<string, unknown>>;
    blocks[blocks.length - 1].type = 'classic';
    // Also fix the payload so we get the cooldown error, not a block-validity one
    blocks[blocks.length - 1].restBetweenExercises = 30;
    expect(validateSession(session).error).toContain('Last block must be cooldown');
  });

  it('rejects unknown block types', () => {
    const session = baseSession();
    (session.blocks as Array<Record<string, unknown>>)[1].type = 'crossfit';
    expect(validateSession(session).error).toContain('invalid type');
  });
});

describe('validateSession — per-block requirements', () => {
  it('warmup: exercise needs name + duration + instructions', () => {
    const session = baseSession();
    const warmup = (session.blocks as Array<Record<string, unknown>>)[0];
    warmup.exercises = [{ name: 'Jumping', duration: 60 }];
    expect(validateSession(session).error).toContain('instructions required');
  });

  it('classic: exercise needs sets + reps + restBetweenSets', () => {
    const session = baseSession();
    const classic = (session.blocks as Array<Record<string, unknown>>)[1];
    (classic.exercises as Array<Record<string, unknown>>)[0].reps = undefined;
    expect(validateSession(session).error).toContain('reps required');
  });

  it('classic: accepts reps === "max" as a sentinel', () => {
    const session = baseSession();
    const classic = (session.blocks as Array<Record<string, unknown>>)[1];
    (classic.exercises as Array<Record<string, unknown>>)[0].reps = 'max';
    expect(validateSession(session).valid).toBe(true);
  });

  it('circuit: exercise mode must be timed or reps', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'circuit',
          name: 'C',
          rounds: 3,
          restBetweenExercises: 15,
          restBetweenRounds: 45,
          exercises: [{ name: 'Burpees', mode: 'both', instructions: 'Go' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('mode must be timed or reps');
  });

  it('superset: pair.exercises must not be empty', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'superset',
          name: 'S',
          sets: 3,
          restBetweenSets: 60,
          pairs: [{ exercises: [] }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('pair exercises required');
  });

  it('pyramid: pattern must be a non-empty array', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'pyramid',
          name: 'P',
          pattern: [],
          restBetweenSets: 30,
          exercises: [{ name: 'Ex', instructions: 'Do it' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('pattern required');
  });

  it('hiit: rounds + work + rest are required', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'hiit',
          name: 'H',
          // missing `rounds`
          work: 30,
          rest: 15,
          exercises: [{ name: 'Sprints', instructions: 'Fort' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('hiit: rounds required');
  });

  it('tabata: exercise instructions are required', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'tabata',
          name: 'T',
          exercises: [{ name: 'Burpees' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('tabata: exercise instructions required');
  });

  it('emom: minutes + exercise reps are required', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'emom',
          name: 'E',
          // missing `minutes`
          exercises: [{ name: 'Kettlebell swings', reps: 10, instructions: 'Explosif' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('emom: minutes required');
  });

  it('amrap: duration + exercise reps are required', () => {
    const session = baseSession({
      blocks: [
        { type: 'warmup', name: 'W', exercises: [{ name: 'X', duration: 30, instructions: 'Y' }] },
        {
          type: 'amrap',
          name: 'A',
          duration: 600,
          // exercise missing `reps`
          exercises: [{ name: 'Squats', instructions: 'Forme avant vitesse' }],
        },
        { type: 'cooldown', name: 'Cd', exercises: [{ name: 'Stretch', duration: 60, instructions: 'Breathe' }] },
      ],
    });
    expect(validateSession(session).error).toContain('amrap: exercise reps required');
  });
});

describe('validateSession — sanitization', () => {
  it('strips HTML tags and URLs from title / description / exercise instructions', () => {
    const session = baseSession({
      title: 'Séance <script>alert(1)</script>',
      description: 'Voir https://evil.example plus de détails',
    });
    (session.blocks as Array<Record<string, unknown>>)[0].name = 'Chauffe <b>rapide</b>';
    const warmupEx = ((session.blocks as Array<Record<string, unknown>>)[0].exercises as Array<
      Record<string, unknown>
    >)[0];
    warmupEx.name = 'Jumping <img src=x>';
    warmupEx.instructions = 'Suis https://bad.link attentivement';

    const result = validateSession(session);
    expect(result.valid).toBe(true);
    expect(session.title).toBe('Séance alert(1)');
    expect(session.description).toBe('Voir  plus de détails');
    expect((session.blocks as Array<Record<string, unknown>>)[0].name).toBe('Chauffe rapide');
    expect(warmupEx.name).toBe('Jumping ');
    expect(warmupEx.instructions).toBe('Suis  attentivement');
  });

  it('truncates strings beyond 500 characters', () => {
    const long = 'x'.repeat(700);
    const session = baseSession({ title: long });
    expect(validateSession(session).valid).toBe(true);
    expect((session.title as string).length).toBe(500);
  });
});
