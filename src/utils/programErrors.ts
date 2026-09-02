import type { TFunction } from 'i18next';

/**
 * Machine codes stored in programs.error_reason by the generate-program edge
 * function (and by the reaper in migration 029). Anything else is legacy
 * French prose written before the codes existed — render it as-is.
 */
export const PROGRAM_ERROR_CODES = [
  'timeout',
  'parse',
  'truncation',
  'network',
  'api_overloaded',
  'api_unavailable',
  'api_auth',
  'api_rejected',
  'api_error',
  'invalid_program',
  'sessions_invalid',
  'save_failed',
  'started_during_revision',
  'stale',
  'deleted',
  'unexpected',
] as const;

export type ProgramErrorCode = (typeof PROGRAM_ERROR_CODES)[number];

export function isProgramErrorCode(value: unknown): value is ProgramErrorCode {
  return typeof value === 'string' && (PROGRAM_ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Localised, user-facing message for a stored error_reason. `t` must be bound
 * to the `programs` namespace (keys live under `errors.*`).
 */
export function programErrorMessage(reason: string | null | undefined, t: TFunction, fallback: string): string {
  if (!reason) return fallback;
  if (isProgramErrorCode(reason)) return t(`errors.${reason}`);
  return reason;
}
