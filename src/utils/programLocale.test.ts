import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { localizedProgramFields } from './programLocale.ts';

// Minimal stub matching the slice of i18next's TFunction the helper actually
// invokes. The helper calls `t(key, options)`; we look up `options.defaultValue`
// or pull from a fake i18n catalog keyed by the same composite key.
function makeT(catalog: Record<string, unknown>): TFunction {
  return ((key: string, options?: { defaultValue?: unknown; returnObjects?: boolean }) => {
    if (key in catalog) return catalog[key];
    return options?.defaultValue ?? key;
  }) as unknown as TFunction;
}

describe('localizedProgramFields', () => {
  it('returns DB values verbatim for non-fixed programs (passthrough)', () => {
    const t = makeT({});
    const program = {
      slug: 'my-ai-program',
      title: 'My AI Program',
      description: 'Generated for me',
      goals: ['Get strong'],
      is_fixed: false,
    };
    expect(localizedProgramFields(program, t)).toEqual({
      title: 'My AI Program',
      description: 'Generated for me',
      goals: ['Get strong'],
    });
  });

  it('returns DB values when neither is_fixed nor isFixed is set', () => {
    const t = makeT({});
    const program = {
      slug: 'whatever',
      title: 'X',
      description: 'Y',
      goals: ['Z'],
    };
    expect(localizedProgramFields(program, t)).toEqual({
      title: 'X',
      description: 'Y',
      goals: ['Z'],
    });
  });

  it('overrides DB values with i18n entries for fixed programs (snake_case is_fixed)', () => {
    const t = makeT({
      'programs_data:cardio-express.title': 'Cardio Express EN',
      'programs_data:cardio-express.description': 'Short and intense',
      'programs_data:cardio-express.goals': ['Improve cardio', 'Maximize time'],
    });
    const program = {
      slug: 'cardio-express',
      title: 'Cardio Express',
      description: 'Sessions courtes',
      goals: ['Améliorer le cardio', 'Maximiser le temps'],
      is_fixed: true,
    };
    expect(localizedProgramFields(program, t)).toEqual({
      title: 'Cardio Express EN',
      description: 'Short and intense',
      goals: ['Improve cardio', 'Maximize time'],
    });
  });

  it('overrides DB values for fixed programs flagged with camelCase isFixed (active program shape)', () => {
    const t = makeT({
      'programs_data:debutant-4-semaines.title': 'Beginner 4 weeks',
      'programs_data:debutant-4-semaines.goals': ['Discover basics'],
    });
    const activeProgram = {
      slug: 'debutant-4-semaines',
      title: 'Débutant 4 semaines',
      goals: ['Découvrir'],
      isFixed: true,
    };
    const result = localizedProgramFields(activeProgram, t);
    expect(result.title).toBe('Beginner 4 weeks');
    expect(result.goals).toEqual(['Discover basics']);
  });

  it('falls back to DB values when an i18n key is missing for a fixed program', () => {
    const t = makeT({
      'programs_data:remise-en-forme.title': 'Get back in shape',
      // description and goals intentionally absent
    });
    const program = {
      slug: 'remise-en-forme',
      title: 'Remise en forme',
      description: 'Programme complet',
      goals: ['Retrouver la forme'],
      is_fixed: true,
    };
    expect(localizedProgramFields(program, t)).toEqual({
      title: 'Get back in shape',
      description: 'Programme complet',
      goals: ['Retrouver la forme'],
    });
  });

  it('treats an empty i18n title as missing and keeps the DB title', () => {
    const t = makeT({
      'programs_data:cardio-express.title': '',
      'programs_data:cardio-express.goals': ['x'],
    });
    const program = {
      slug: 'cardio-express',
      title: 'Cardio Express',
      description: null,
      goals: ['y'],
      is_fixed: true,
    };
    expect(localizedProgramFields(program, t).title).toBe('Cardio Express');
  });

  it('returns null description when neither i18n nor DB provide one', () => {
    const t = makeT({});
    const program = {
      slug: 'cardio-express',
      title: 'Cardio Express',
      description: null,
      goals: [],
      is_fixed: true,
    };
    expect(localizedProgramFields(program, t).description).toBeNull();
  });

  it('handles null/undefined goals on the input', () => {
    const t = makeT({});
    const program = {
      slug: 'unknown',
      title: 'X',
      description: 'D',
      // goals omitted
      is_fixed: false,
    };
    expect(localizedProgramFields(program, t).goals).toEqual([]);
  });

  it('falls back to DB goals when the i18n entry is not an array', () => {
    const t = makeT({
      'programs_data:cardio-express.title': 'Cardio Express',
      'programs_data:cardio-express.goals': 'not-an-array',
    });
    const program = {
      slug: 'cardio-express',
      title: 'X',
      description: null,
      goals: ['db-goal'],
      is_fixed: true,
    };
    expect(localizedProgramFields(program, t).goals).toEqual(['db-goal']);
  });
});
