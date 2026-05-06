import type { TFunction } from 'i18next';
import type { Block, Session } from '../types/session.ts';

interface I18nAlternative {
  name?: string;
  equipment?: string;
  instructions?: string;
}

interface I18nExercise {
  name?: string;
  instructions?: string;
  alternative?: I18nAlternative;
}

interface I18nPair {
  exercises?: I18nExercise[];
}

interface I18nBlock {
  name?: string;
  exercises?: I18nExercise[];
  pairs?: I18nPair[];
}

interface I18nSession {
  title?: string;
  description?: string;
  focus?: string[];
  blocks?: I18nBlock[];
}

function isI18nSession(value: unknown): value is I18nSession {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Merge a DB exercise with its localised counterpart. Structural fields
// (sets, reps, duration, bilateral, mode, etc.) come from the DB. Only
// `name`, `instructions` and `alternative.{name,equipment,instructions}`
// are overridden when an i18n entry is present.
function mergeExercise<T extends { name: string; instructions?: string; alternative?: unknown }>(
  dbEx: T,
  i18nEx: I18nExercise | undefined,
): T {
  if (!i18nEx) return dbEx;
  const merged: T = { ...dbEx };
  if (typeof i18nEx.name === 'string' && i18nEx.name.length > 0) {
    (merged as { name: string }).name = i18nEx.name;
  }
  if (typeof i18nEx.instructions === 'string' && i18nEx.instructions.length > 0) {
    (merged as { instructions?: string }).instructions = i18nEx.instructions;
  }
  if (i18nEx.alternative && dbEx.alternative && typeof dbEx.alternative === 'object') {
    const dbAlt = dbEx.alternative as { name: string; equipment?: string; instructions?: string };
    const altMerged = { ...dbAlt };
    if (typeof i18nEx.alternative.name === 'string') altMerged.name = i18nEx.alternative.name;
    if (typeof i18nEx.alternative.equipment === 'string') altMerged.equipment = i18nEx.alternative.equipment;
    if (typeof i18nEx.alternative.instructions === 'string') altMerged.instructions = i18nEx.alternative.instructions;
    (merged as { alternative?: unknown }).alternative = altMerged;
  }
  return merged;
}

function mergeBlock(dbBlock: Block, i18nBlock: I18nBlock | undefined): Block {
  if (!i18nBlock) return dbBlock;
  const result: Block = { ...dbBlock };
  if (typeof i18nBlock.name === 'string' && i18nBlock.name.length > 0) {
    result.name = i18nBlock.name;
  }
  if (result.type === 'superset') {
    if (Array.isArray(i18nBlock.pairs)) {
      result.pairs = result.pairs.map((dbPair, idx) => {
        const i18nPair = i18nBlock.pairs?.[idx];
        if (!i18nPair?.exercises) return dbPair;
        return {
          ...dbPair,
          exercises: dbPair.exercises.map((dbEx, exIdx) => mergeExercise(dbEx, i18nPair.exercises?.[exIdx])),
        };
      });
    }
    return result;
  }
  if ('exercises' in result && Array.isArray(result.exercises) && Array.isArray(i18nBlock.exercises)) {
    // Block is one of the variants whose `exercises` field is mutable; we
    // type-cast through unknown because TS can't narrow across the union.
    const dbExs = result.exercises as { name: string; instructions?: string; alternative?: unknown }[];
    const i18nExs = i18nBlock.exercises;
    (result as unknown as { exercises: typeof dbExs }).exercises = dbExs.map((dbEx, idx) =>
      mergeExercise(dbEx, i18nExs[idx]),
    );
  }
  return result;
}

const FIXED_PROGRAM_SLUGS = new Set(['debutant-4-semaines', 'remise-en-forme', 'cardio-express']);

// Fixed (seed) programs were inserted in migration 002 with French-only
// session_data JSONB. The localised content lives in
// src/i18n/locales/{fr,en}/sessions_data.json keyed by
// `<programSlug>.<sessionOrder>`. AI-generated user programs already store
// locale-native content, so they're returned as-is.
//
// Only the translatable fields are overridden — structural fields (sets,
// reps, durations, etc.) always come from the DB so the runtime engine
// stays in sync with the data the user actually completed.
export function localizedSessionData(
  programSlug: string,
  sessionOrder: number,
  dbSession: Session,
  t: TFunction,
): Session {
  if (!FIXED_PROGRAM_SLUGS.has(programSlug)) return dbSession;

  const raw = t(`sessions_data:${programSlug}.${sessionOrder}`, {
    returnObjects: true,
    defaultValue: null,
  });
  if (!isI18nSession(raw)) return dbSession;

  const out: Session = { ...dbSession };
  if (typeof raw.title === 'string' && raw.title.length > 0) out.title = raw.title;
  if (typeof raw.description === 'string' && raw.description.length > 0) out.description = raw.description;
  if (Array.isArray(raw.focus)) out.focus = raw.focus.filter((f): f is string => typeof f === 'string');
  if (Array.isArray(raw.blocks)) {
    out.blocks = dbSession.blocks.map((dbBlock, idx) => mergeBlock(dbBlock, raw.blocks?.[idx]));
  }
  return out;
}
