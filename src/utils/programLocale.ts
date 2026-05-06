import type { TFunction } from 'i18next';

export interface LocalizedProgramFields {
  title: string;
  description: string | null;
  goals: string[];
}

interface ProgramFieldsInput {
  slug: string;
  title: string;
  description?: string | null;
  goals?: string[] | null;
  /** snake_case from DB rows. */
  is_fixed?: boolean;
  /** camelCase from the active-program RPC. */
  isFixed?: boolean;
}

// The 3 seed programs were inserted in migration 002 with French-only
// title/description/goals columns. The localised content lives instead
// in src/i18n/locales/{fr,en}/programs_data.json under the `programs_data`
// namespace (see src/data/programContent.ts comment for the convention).
// AI-generated user programs already store locale-native content in the
// DB (Claude generates in the user's locale), so they're returned as-is.
//
// Falls back to the DB row values when a key is missing — defensive,
// the i18n entries should always exist for fixed programs.
export function localizedProgramFields(program: ProgramFieldsInput, t: TFunction): LocalizedProgramFields {
  const fixed = program.is_fixed ?? program.isFixed ?? false;
  const fallbackTitle = program.title;
  const fallbackDescription = program.description ?? null;
  const fallbackGoals = program.goals ?? [];

  if (!fixed) {
    return { title: fallbackTitle, description: fallbackDescription, goals: fallbackGoals };
  }

  const titleRaw = t(`programs_data:${program.slug}.title`, { defaultValue: fallbackTitle });
  const descriptionRaw = t(`programs_data:${program.slug}.description`, {
    defaultValue: fallbackDescription ?? '',
  });
  const goalsRaw = t(`programs_data:${program.slug}.goals`, {
    returnObjects: true,
    defaultValue: fallbackGoals,
  });
  const title = typeof titleRaw === 'string' && titleRaw.length > 0 ? titleRaw : fallbackTitle;
  const description = typeof descriptionRaw === 'string' && descriptionRaw.length > 0 ? descriptionRaw : null;
  const goals = Array.isArray(goalsRaw) ? (goalsRaw as string[]) : fallbackGoals;
  return { title, description, goals };
}
