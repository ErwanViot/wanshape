import { describe, expect, it } from 'vitest';
import { getRecipeLocaleFromPath, recipeListingUrlForLocale, recipeUrlForLocale, twinPath } from './localePath.ts';

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

describe('twinPath', () => {
  it('maps the four acquisition landings between FR and EN', () => {
    expect(twinPath('/decouvrir/seances', 'en')).toBe('/en/discover/sessions');
    expect(twinPath('/decouvrir/programmes', 'en')).toBe('/en/discover/programs');
    expect(twinPath('/decouvrir/nutrition', 'en')).toBe('/en/discover/nutrition');
    expect(twinPath('/decouvrir/suivi', 'en')).toBe('/en/discover/tracking');

    expect(twinPath('/en/discover/sessions', 'fr')).toBe('/decouvrir/seances');
    expect(twinPath('/en/discover/programs', 'fr')).toBe('/decouvrir/programmes');
    expect(twinPath('/en/discover/nutrition', 'fr')).toBe('/decouvrir/nutrition');
    expect(twinPath('/en/discover/tracking', 'fr')).toBe('/decouvrir/suivi');
  });

  it('maps the recipe listing between FR and EN', () => {
    expect(twinPath('/nutrition/recettes', 'en')).toBe('/en/nutrition/recipes');
    expect(twinPath('/en/nutrition/recipes', 'fr')).toBe('/nutrition/recettes');
  });

  it('falls back to the listing for recipe detail pages (slugs differ across locales)', () => {
    expect(twinPath('/nutrition/recettes/toast-patate-douce', 'en')).toBe('/en/nutrition/recipes');
    expect(twinPath('/en/nutrition/recipes/sweet-potato-toast', 'fr')).toBe('/nutrition/recettes');
  });

  it('returns null when there is no twin (Home, Player, programmes, etc.)', () => {
    expect(twinPath('/', 'en')).toBeNull();
    expect(twinPath('/seance/play', 'en')).toBeNull();
    expect(twinPath('/programme/debutant-4-semaines', 'en')).toBeNull();
    expect(twinPath('/login', 'fr')).toBeNull();
    expect(twinPath('/legal/privacy', 'fr')).toBeNull();
  });

  it('returns null when the requested target equals the current locale', () => {
    expect(twinPath('/decouvrir/seances', 'fr')).toBeNull();
    expect(twinPath('/en/discover/sessions', 'en')).toBeNull();
  });
});
