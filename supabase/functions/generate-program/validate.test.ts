import { describe, expect, it } from 'vitest';
import { validateProgram, validateSession } from './validate.ts';

/** Minimal valid embedded session (shared by the program payload). */
function embeddedSession(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Séance A',
    description: 'Jambes et cardio',
    estimatedDuration: 30,
    focus: ['jambes'],
    blocks: [
      { type: 'warmup', name: 'Échauffement', exercises: [{ name: 'Mobilité', duration: 60, instructions: 'Relax' }] },
      {
        type: 'classic',
        name: 'Force',
        restBetweenExercises: 30,
        exercises: [
          {
            name: 'Squats',
            sets: 3,
            reps: 10,
            restBetweenSets: 60,
            instructions: 'Descendre lentement',
          },
        ],
      },
      { type: 'cooldown', name: 'Récup', exercises: [{ name: 'Étirement', duration: 60, instructions: 'Respirer' }] },
    ],
    ...overrides,
  };
}

function baseProgram(overrides: Record<string, unknown> = {}) {
  return {
    titre: 'Programme Test',
    description: 'Description du programme de test',
    niveau: 'intermediaire',
    note_coach: "Note du coach pour l'utilisateur, en 3 phrases au moins.",
    progression: { logique: 'Progression classique sur 4 semaines' },
    sessions: {
      A: embeddedSession({ title: 'Séance A' }),
      B: embeddedSession({ title: 'Séance B', focus: ['haut du corps'] }),
    },
    calendrier: [{ semaines: [1, 2, 3, 4], sequence: ['A', 'B'] }],
    consignes_semaine: { '1': 'Prendre ses marques', '2-4': 'Monter en intensité' },
    ...overrides,
  };
}

describe('validateProgram — happy path', () => {
  it('accepts a well-formed 4-week program with 2 sessions', () => {
    const result = validateProgram(baseProgram(), 4, 3);
    expect(result.valid).toBe(true);
  });
});

describe('validateProgram — off-topic', () => {
  it('reports off-topic distinctly', () => {
    expect(validateProgram({ error: 'off_topic' }, 4, 3)).toEqual({ valid: false, error: 'off_topic' });
  });
});

describe('validateProgram — top-level fields', () => {
  it.each([
    ['titre', 'titre is required'],
    ['description', 'description is required'],
  ])('requires %s', (field, error) => {
    expect(validateProgram(baseProgram({ [field]: undefined }), 4, 3)).toEqual({ valid: false, error });
  });

  it('requires niveau to be one of debutant/intermediaire/avance', () => {
    expect(validateProgram(baseProgram({ niveau: 'expert' }), 4, 3).valid).toBe(false);
  });

  it('requires a non-empty note_coach', () => {
    expect(validateProgram(baseProgram({ note_coach: '' }), 4, 3)).toEqual({
      valid: false,
      error: 'note_coach is required',
    });
  });
});

describe('validateProgram — sessions count bounds', () => {
  it('rejects fewer than 2 sessions', () => {
    const single = { A: embeddedSession() };
    const result = validateProgram(baseProgram({ sessions: single }), 4, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('sessions must have 2-5 entries');
  });

  it('rejects more than 5 sessions', () => {
    const six = Object.fromEntries(
      ['A', 'B', 'C', 'D', 'E', 'F'].map((k) => [k, embeddedSession({ title: `S ${k}` })]),
    );
    const result = validateProgram(baseProgram({ sessions: six }), 4, 6);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('sessions must have 2-5 entries');
  });

  it('rejects more sessions than maxSessionsPerWeek allows', () => {
    const four = Object.fromEntries(['A', 'B', 'C', 'D'].map((k) => [k, embeddedSession({ title: `S ${k}` })]));
    const result = validateProgram(
      baseProgram({ sessions: four, calendrier: [{ semaines: [1, 2, 3, 4], sequence: ['A', 'B', 'C', 'D'] }] }),
      4,
      3,
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds seances_par_semaine');
  });
});

describe('validateProgram — calendrier coverage', () => {
  it('rejects calendrier that misses a week', () => {
    const result = validateProgram(baseProgram({ calendrier: [{ semaines: [1, 2, 3], sequence: ['A', 'B'] }] }), 4, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('week 4 not covered');
  });

  it('rejects a session referenced in the sequence but absent from sessions', () => {
    const result = validateProgram(
      baseProgram({ calendrier: [{ semaines: [1, 2, 3, 4], sequence: ['A', 'B', 'GHOST'] }] }),
      4,
      3,
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain('"GHOST" not found');
  });

  it('rejects empty semaines or sequence', () => {
    const empty1 = validateProgram(
      baseProgram({ calendrier: [{ semaines: [], sequence: ['A'] }, { semaines: [1, 2, 3, 4], sequence: ['A', 'B'] }] }),
      4,
      3,
    );
    expect(empty1.valid).toBe(false);
    expect(empty1.error).toContain('semaines required');

    const empty2 = validateProgram(
      baseProgram({ calendrier: [{ semaines: [1], sequence: [] }, { semaines: [2, 3, 4], sequence: ['A', 'B'] }] }),
      4,
      3,
    );
    expect(empty2.valid).toBe(false);
    expect(empty2.error).toContain('sequence required');
  });

  it('accepts multiple calendrier entries covering disjoint week ranges', () => {
    const result = validateProgram(
      baseProgram({
        calendrier: [
          { semaines: [1, 2], sequence: ['A', 'B'] },
          { semaines: [3, 4], sequence: ['B', 'A'] },
        ],
      }),
      4,
      3,
    );
    expect(result.valid).toBe(true);
  });
});

describe('validateProgram — consignes_semaine', () => {
  it('requires at least one consigne entry', () => {
    const result = validateProgram(baseProgram({ consignes_semaine: {} }), 4, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least one entry');
  });

  it('rejects non-string consigne values', () => {
    const result = validateProgram(baseProgram({ consignes_semaine: { '1': 123 } }), 4, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a string');
  });
});

describe('validateProgram — sanitization', () => {
  it('strips HTML + URLs from top-level strings and note_coach (up to 2000 chars)', () => {
    const longNote = `Voir ${'https://evil.example '.repeat(60)} et <b>ok</b>`;
    const program = baseProgram({
      titre: 'Programme <script>evil</script>',
      description: 'Plan d\'attaque https://bad.example',
      note_coach: longNote,
    });
    const result = validateProgram(program, 4, 3);
    expect(result.valid).toBe(true);
    expect((program as Record<string, unknown>).titre).toBe('Programme evil');
    expect((program as Record<string, unknown>).description).toBe("Plan d'attaque ");
    const sanitizedNote = (program as Record<string, unknown>).note_coach as string;
    expect(sanitizedNote).not.toContain('<');
    expect(sanitizedNote).not.toContain('http');
    expect(sanitizedNote.length).toBeLessThanOrEqual(2000);
  });

  it('sanitizes progression.logique and consignes_semaine values', () => {
    const program = baseProgram({
      progression: { logique: 'On augmente <b>lourd</b> via https://x.y' },
      consignes_semaine: { '1': 'Attention <script>x</script>' },
    });
    const result = validateProgram(program, 4, 3);
    expect(result.valid).toBe(true);
    const progression = (program as Record<string, unknown>).progression as Record<string, unknown>;
    expect(progression.logique).toBe('On augmente lourd via ');
    const consignes = (program as Record<string, unknown>).consignes_semaine as Record<string, string>;
    expect(consignes['1']).toBe('Attention x');
  });

  it('sanitizes the optional progression.cible_semaine_X fields', () => {
    const program = baseProgram({
      progression: {
        logique: 'ok',
        cible_semaine_3: 'Objectif <b>clair</b> https://x.y',
        cible_semaine_8: 'Tenir <i>rythme</i>',
      },
    });
    const result = validateProgram(program, 4, 3);
    expect(result.valid).toBe(true);
    const progression = (program as Record<string, unknown>).progression as Record<string, unknown>;
    expect(progression.cible_semaine_3).toBe('Objectif clair ');
    expect(progression.cible_semaine_8).toBe('Tenir rythme');
  });
});

describe('validateSession (embedded)', () => {
  // Same structural rules as generate-session/validate.ts, just without the
  // requestedDuration cross-check (not relevant per-session in a program).
  it('accepts a valid embedded session', () => {
    expect(validateSession(embeddedSession()).valid).toBe(true);
  });

  it('rejects an embedded session with a missing title', () => {
    expect(validateSession(embeddedSession({ title: undefined })).valid).toBe(false);
  });
});
