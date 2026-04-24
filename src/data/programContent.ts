/**
 * Metadata for fixed programs: non-translatable structural data (week numbers, format tags).
 * All translatable content (headline, intro, audience, etc.) lives in
 * src/i18n/locales/{fr,en}/programs_data.json under the `programs_data` namespace.
 */

export interface ProgramWeekMeta {
  week: number;
  formats: string[];
}

export interface ProgramContentMeta {
  slug: string;
  weeks: ProgramWeekMeta[];
}

export const PROGRAM_CONTENT_META: Record<string, ProgramContentMeta> = {
  'debutant-4-semaines': {
    slug: 'debutant-4-semaines',
    weeks: [
      { week: 1, formats: ['Classic', 'Pyramide'] },
      { week: 2, formats: ['Classic', 'Circuit'] },
      { week: 3, formats: ['Classic', 'EMOM'] },
      { week: 4, formats: ['Circuit', 'Superset'] },
    ],
  },

  'remise-en-forme': {
    slug: 'remise-en-forme',
    weeks: [
      { week: 1, formats: ['Classic', 'Circuit'] },
      { week: 2, formats: ['Superset', 'EMOM'] },
      { week: 3, formats: ['AMRAP', 'HIIT'] },
      { week: 4, formats: ['Circuit', 'Pyramide'] },
    ],
  },

  'cardio-express': {
    slug: 'cardio-express',
    weeks: [
      { week: 1, formats: ['HIIT', 'Circuit'] },
      { week: 2, formats: ['Tabata', 'EMOM'] },
      { week: 3, formats: ['HIIT', 'Tabata'] },
      { week: 4, formats: ['AMRAP', 'Tabata', 'HIIT'] },
    ],
  },
};
