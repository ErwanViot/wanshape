import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { isProgramErrorCode, programErrorMessage } from './programErrors.ts';

const t = ((key: string) => `T(${key})`) as unknown as TFunction;

describe('programErrors', () => {
  it('recognises machine codes', () => {
    expect(isProgramErrorCode('timeout')).toBe(true);
    expect(isProgramErrorCode('stale')).toBe(true);
    expect(isProgramErrorCode('La génération a pris trop de temps.')).toBe(false);
    expect(isProgramErrorCode(null)).toBe(false);
  });

  it('translates a code through the errors.* namespace', () => {
    expect(programErrorMessage('api_overloaded', t, 'fallback')).toBe('T(errors.api_overloaded)');
  });

  it('renders legacy prose verbatim', () => {
    expect(programErrorMessage('Erreur de sauvegarde du programme', t, 'fallback')).toBe(
      'Erreur de sauvegarde du programme',
    );
  });

  it('falls back when no reason is stored', () => {
    expect(programErrorMessage(null, t, 'fallback')).toBe('fallback');
    expect(programErrorMessage('', t, 'fallback')).toBe('fallback');
  });
});
