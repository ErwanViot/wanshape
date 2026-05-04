import { describe, expect, it } from 'vitest';
import { getRecipeLocaleFromPath, recipeListingUrlForLocale, recipeUrlForLocale } from './localePath.ts';

describe('getRecipeLocaleFromPath', () => {
  it('returns en when path is under /en/', () => {
    expect(getRecipeLocaleFromPath('/en/nutrition/recipes')).toBe('en');
    expect(getRecipeLocaleFromPath('/en/nutrition/recipes/sweet-potato-toast')).toBe('en');
  });

  it('returns fr for canonical FR paths', () => {
    expect(getRecipeLocaleFromPath('/nutrition/recettes')).toBe('fr');
    expect(getRecipeLocaleFromPath('/nutrition/recettes/toast-patate-douce')).toBe('fr');
    expect(getRecipeLocaleFromPath('/')).toBe('fr');
  });

  it('does not match a path that merely contains "en/"', () => {
    expect(getRecipeLocaleFromPath('/contenu/en/something')).toBe('fr');
    expect(getRecipeLocaleFromPath('/en')).toBe('fr');
  });
});

describe('recipeUrlForLocale', () => {
  it('builds the canonical FR URL', () => {
    expect(recipeUrlForLocale('fr', 'porridge-banane-miel')).toBe('/nutrition/recettes/porridge-banane-miel');
  });

  it('builds the EN URL with the /en/ prefix and the English path', () => {
    expect(recipeUrlForLocale('en', 'porridge-banana-honey')).toBe('/en/nutrition/recipes/porridge-banana-honey');
  });
});

describe('recipeListingUrlForLocale', () => {
  it('points to the FR listing by default', () => {
    expect(recipeListingUrlForLocale('fr')).toBe('/nutrition/recettes');
  });

  it('points to the EN listing under /en/', () => {
    expect(recipeListingUrlForLocale('en')).toBe('/en/nutrition/recipes');
  });
});
