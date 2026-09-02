import type { Program } from '../types/completion.ts';
import type { ProgramStatus } from '../types/custom-program.ts';

/**
 * A `generating` row older than this is considered stale: the server budget
 * for one generation is ~5 minutes (see generate-program/index.ts), so past
 * 8 minutes the background task is dead. Mirrors
 * `program_generation_is_stale` in migration 029 — keep both in sync.
 */
export const STALE_GENERATION_MS = 8 * 60 * 1000;

type StatusFields = Pick<Program, 'status'> & { generation_started_at?: string | null };

export function isStaleGenerating(program: StatusFields, now = Date.now()): boolean {
  if (program.status !== 'generating') return false;
  if (!program.generation_started_at) return false;
  const started = Date.parse(program.generation_started_at);
  if (Number.isNaN(started)) return false;
  return now - started > STALE_GENERATION_MS;
}

/**
 * Status as the UI should treat it: legacy rows (no status) are `ready`, a
 * stale `generating` row is `failed` (the server reaps it lazily on the next
 * generation, but the client must not wait for that to offer a way out).
 */
export function effectiveProgramStatus(program: StatusFields, now = Date.now()): ProgramStatus {
  const status = program.status ?? 'ready';
  if (status === 'generating' && isStaleGenerating(program, now)) return 'failed';
  return status;
}

/** Counts against the 3-active-programs cap (mirrors the DB trigger). */
export function isActiveProgram(program: StatusFields, now = Date.now()): boolean {
  return effectiveProgramStatus(program, now) !== 'failed';
}
