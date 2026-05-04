import { describe, expect, it } from 'vitest';
import { slugify } from './slug.ts';

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips French diacritics', () => {
    expect(slugify('Pâté de campagne')).toBe('pate-de-campagne');
    expect(slugify("Beurre d'amande")).toBe('beurre-d-amande');
  });

  it('expands non-decomposable ligatures so URLs stay readable', () => {
    expect(slugify('Œuf à la coque')).toBe('oeuf-a-la-coque');
    expect(slugify('Bœuf braisé')).toBe('boeuf-braise');
    expect(slugify('Cæsar salad')).toBe('caesar-salad');
    expect(slugify('Straße')).toBe('strasse');
  });

  it('strips parentheses and punctuation', () => {
    expect(slugify('Toast (banane & miel)')).toBe('toast-banane-miel');
    expect(slugify('Smoothie 100% fruit')).toBe('smoothie-100-fruit');
  });

  it('collapses multiple separators into a single hyphen', () => {
    expect(slugify('A   B---C__D')).toBe('a-b-c-d');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('   spaces  ')).toBe('spaces');
    expect(slugify('---dashes---')).toBe('dashes');
  });

  it('handles real seed names without collision', () => {
    expect(slugify('Toast patate douce & œuf mollet')).toBe('toast-patate-douce-oeuf-mollet');
    expect(slugify("Pain complet, beurre d'amande & banane")).toBe('pain-complet-beurre-d-amande-banane');
    expect(slugify('Yaourt grec + miel + flocons')).toBe('yaourt-grec-miel-flocons');
  });

  it('matches the CHECK constraint regex on recipes.slug', () => {
    const constraintRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const samples = [
      'Toast patate douce & œuf mollet',
      "Pain complet, beurre d'amande & banane",
      'Smoothie 100% protéiné post-effort',
      'Bowl quinoa & saumon (fumé)',
    ];
    for (const name of samples) {
      const slug = slugify(name);
      expect(constraintRegex.test(slug)).toBe(true);
    }
  });
});
