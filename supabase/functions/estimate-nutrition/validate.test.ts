import { describe, expect, it } from 'vitest';
import { validateOverflowInsight, validateTextEstimate } from './validate.ts';

describe('validateTextEstimate', () => {
  const baseValid = {
    name: 'Salade de lentilles',
    calories: 320,
    protein_g: 18,
    carbs_g: 45,
    fat_g: 8,
    confidence: 'medium' as const,
  };

  it('returns ok on a fully valid payload', () => {
    const result = validateTextEstimate(baseValid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Salade de lentilles');
      expect(result.value.calories).toBe(320);
      expect(result.value.confidence).toBe('medium');
    }
  });

  it('rounds numeric fields to one decimal', () => {
    const result = validateTextEstimate({ ...baseValid, calories: 123.456, protein_g: 7.89 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.calories).toBe(123.5);
      expect(result.value.protein_g).toBe(7.9);
    }
  });

  it('accepts null macros', () => {
    const result = validateTextEstimate({ ...baseValid, protein_g: null, carbs_g: null, fat_g: null });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.protein_g).toBeNull();
      expect(result.value.carbs_g).toBeNull();
      expect(result.value.fat_g).toBeNull();
    }
  });

  it('rejects non-objects', () => {
    expect(validateTextEstimate(null)).toEqual({ ok: false, error: 'not_object' });
    expect(validateTextEstimate('hello')).toEqual({ ok: false, error: 'not_object' });
    expect(validateTextEstimate(42)).toEqual({ ok: false, error: 'not_object' });
  });

  it('rejects missing or empty name', () => {
    expect(validateTextEstimate({ ...baseValid, name: '' })).toEqual({ ok: false, error: 'missing_name' });
    expect(validateTextEstimate({ ...baseValid, name: '   ' })).toEqual({ ok: false, error: 'missing_name' });
    const { name: _name, ...noName } = baseValid;
    expect(validateTextEstimate(noName)).toEqual({ ok: false, error: 'missing_name' });
  });

  it('rejects name longer than 120 characters', () => {
    const longName = 'a'.repeat(121);
    expect(validateTextEstimate({ ...baseValid, name: longName })).toEqual({ ok: false, error: 'name_too_long' });
  });

  it('rejects calories that are not a finite positive number ≤ 5000', () => {
    expect(validateTextEstimate({ ...baseValid, calories: -1 }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, calories: 5001 }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, calories: Number.NaN }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, calories: Number.POSITIVE_INFINITY }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, calories: '320' }).ok).toBe(false);
  });

  it('rejects macros out of [0, 500] (hallucination guard)', () => {
    expect(validateTextEstimate({ ...baseValid, protein_g: 501 }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, protein_g: -1 }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, carbs_g: 9999 }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, fat_g: 501 }).ok).toBe(false);
  });

  it('rejects unknown confidence values', () => {
    expect(validateTextEstimate({ ...baseValid, confidence: 'very-high' }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, confidence: '' }).ok).toBe(false);
    expect(validateTextEstimate({ ...baseValid, confidence: undefined }).ok).toBe(false);
  });

  it('trims the name', () => {
    const result = validateTextEstimate({ ...baseValid, name: '  Poulet rôti  ' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe('Poulet rôti');
  });
});

describe('validateOverflowInsight', () => {
  it('accepts a valid insight', () => {
    const result = validateOverflowInsight({
      summary: 'Tu es au-dessus de ta cible calorique, principalement à cause des glucides du midi.',
      suggestions: ['Réduire les pâtes de 50g demain', 'Ajouter des légumes verts'],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects non-objects', () => {
    expect(validateOverflowInsight(null)).toEqual({ ok: false, error: 'not_object' });
    expect(validateOverflowInsight(12)).toEqual({ ok: false, error: 'not_object' });
  });

  it('rejects missing or empty summary', () => {
    expect(validateOverflowInsight({ suggestions: [] })).toEqual({ ok: false, error: 'missing_summary' });
    expect(validateOverflowInsight({ summary: '   ', suggestions: [] })).toEqual({
      ok: false,
      error: 'missing_summary',
    });
  });

  it('rejects a summary longer than 2000 characters', () => {
    const result = validateOverflowInsight({ summary: 'a'.repeat(2001), suggestions: [] });
    expect(result).toEqual({ ok: false, error: 'summary_too_long' });
  });

  it('trims the summary', () => {
    const result = validateOverflowInsight({ summary: '  OK  ', suggestions: [] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.summary).toBe('OK');
  });

  it('caps suggestions at 3 and drops empty / over-long entries', () => {
    const result = validateOverflowInsight({
      summary: 'Résumé valide',
      suggestions: ['', 'OK-1', '   ', 'OK-2', 'a'.repeat(301), 'OK-3', 'OK-4'],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.suggestions).toEqual(['OK-1', 'OK-2', 'OK-3']);
    }
  });

  it('tolerates non-string entries in suggestions', () => {
    const result = validateOverflowInsight({
      summary: 'Résumé',
      suggestions: ['ok', 42, null, 'also-ok'],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.suggestions).toEqual(['ok', 'also-ok']);
  });

  it('trims suggestion entries', () => {
    const result = validateOverflowInsight({ summary: 'ok', suggestions: ['  spaced  '] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.suggestions).toEqual(['spaced']);
  });

  it('handles missing suggestions array gracefully (returns empty)', () => {
    const result = validateOverflowInsight({ summary: 'only summary' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.suggestions).toEqual([]);
  });
});
