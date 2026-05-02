import { describe, expect, it } from 'vitest';
import { minutesToISODuration, recipeJsonLd, stepName } from './jsonld.ts';

describe('minutesToISODuration', () => {
  it('formats positive minutes as ISO 8601', () => {
    expect(minutesToISODuration(15)).toBe('PT15M');
    expect(minutesToISODuration(90)).toBe('PT90M');
  });

  it('rounds fractional minutes', () => {
    expect(minutesToISODuration(15.4)).toBe('PT15M');
    expect(minutesToISODuration(15.6)).toBe('PT16M');
  });

  it('returns undefined for null/undefined/non-positive values', () => {
    expect(minutesToISODuration(null)).toBeUndefined();
    expect(minutesToISODuration(undefined)).toBeUndefined();
    expect(minutesToISODuration(0)).toBeUndefined();
    expect(minutesToISODuration(-5)).toBeUndefined();
  });
});

describe('stepName', () => {
  it('returns the full step text when short enough', () => {
    expect(stepName('Toaster les tranches.', 1)).toBe('Toaster les tranches');
  });

  it('extracts the first sentence when text contains multiple sentences', () => {
    expect(stepName('Toaster les tranches. Réserver.', 1)).toBe('Toaster les tranches');
    expect(stepName('Mélanger ! Cuire à feu doux.', 1)).toBe('Mélanger');
  });

  it('truncates long single sentences with an ellipsis', () => {
    const long = 'a'.repeat(80);
    const out = stepName(long, 1);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith('…')).toBe(true);
  });

  it('falls back to an indexed placeholder for empty/whitespace input', () => {
    expect(stepName('', 1)).toBe('Étape 1');
    expect(stepName('   ', 3)).toBe('Étape 3');
  });
});

describe('recipeJsonLd', () => {
  const baseInput = {
    name: 'Toast & œuf',
    description: 'Toast complet avec un œuf mollet.',
    url: '/nutrition/recettes/toast-oeuf',
    recipeIngredient: ['2 tranches Pain complet', '1 Œuf'],
    recipeInstructions: ['Toaster le pain.', 'Cuire l’œuf 6 min.'],
  };

  it('emits the canonical schema.org Recipe envelope', () => {
    const out = recipeJsonLd(baseInput);
    expect(out['@context']).toBe('https://schema.org');
    expect(out['@type']).toBe('Recipe');
    expect(out.name).toBe(baseInput.name);
    expect(out.url).toMatch(/^https:\/\/.*\/nutrition\/recettes\/toast-oeuf$/);
    expect(out.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': expect.stringMatching(/\/nutrition\/recettes\/toast-oeuf$/),
    });
  });

  it('defaults inLanguage to fr-FR', () => {
    expect(recipeJsonLd(baseInput).inLanguage).toBe('fr-FR');
  });

  it('honours an explicit inLanguage', () => {
    expect(recipeJsonLd({ ...baseInput, inLanguage: 'en-US' }).inLanguage).toBe('en-US');
  });

  it('expands recipeInstructions into HowToStep with name + position + text', () => {
    const out = recipeJsonLd(baseInput);
    expect(out.recipeInstructions).toEqual([
      { '@type': 'HowToStep', position: 1, name: 'Toaster le pain', text: 'Toaster le pain.' },
      { '@type': 'HowToStep', position: 2, name: 'Cuire l’œuf 6 min', text: 'Cuire l’œuf 6 min.' },
    ]);
  });

  it('emits NutritionInformation with the canonical "1 serving" servingSize', () => {
    const out = recipeJsonLd({
      ...baseInput,
      nutrition: { calories: 320, protein_g: 18, carbs_g: 30, fat_g: 12, fiber_g: 4, servings: 2 },
    });
    expect(out.nutrition).toEqual({
      '@type': 'NutritionInformation',
      calories: '320 kcal',
      proteinContent: '18 g',
      carbohydrateContent: '30 g',
      fatContent: '12 g',
      fiberContent: '4 g',
      servingSize: '1 serving',
    });
  });

  it('omits fiberContent when fiber is missing', () => {
    const out = recipeJsonLd({
      ...baseInput,
      nutrition: { calories: 320, protein_g: 18, carbs_g: 30, fat_g: 12, servings: 1 },
    });
    expect(out.nutrition?.fiberContent).toBeUndefined();
  });

  it('joins keywords with commas (omits when empty)', () => {
    expect(recipeJsonLd({ ...baseInput, keywords: ['quick', 'high-protein'] }).keywords).toBe('quick, high-protein');
    expect(recipeJsonLd({ ...baseInput, keywords: [] }).keywords).toBeUndefined();
    expect(recipeJsonLd(baseInput).keywords).toBeUndefined();
  });
});
