import { describe, expect, it } from 'vitest';
import type { Recipe } from '../types/recipe.ts';
import { applyFilters } from './useRecipes.ts';

function r(overrides: Partial<Recipe>): Recipe {
  return {
    recipe_key: 'k',
    locale: 'fr',
    slug: 's',
    category: 'main',
    name: 'Burger maison',
    description: 'Boeuf, cheddar, pain brioché',
    prep_time_min: 15,
    difficulty: 'facile',
    servings: 1,
    nutrition: { calories: 600, protein: 30, carbs: 50, fat: 30 },
    ingredients: [],
    steps: [],
    tags: ['protéiné', 'rapide'],
    tip: null,
    is_published: true,
    created_at: '2026-05-02T00:00:00Z',
    updated_at: '2026-05-02T00:00:00Z',
    ...overrides,
  };
}

describe('applyFilters', () => {
  const all = [
    r({
      recipe_key: 'a',
      category: 'main',
      name: 'Burger maison',
      description: 'Boeuf, cheddar, pain brioché',
      tags: ['protéiné', 'rapide'],
    }),
    r({
      recipe_key: 'b',
      category: 'breakfast',
      name: 'Porridge banane',
      description: 'Petit-dej facile et complet',
      tags: ['végétarien', 'rapide'],
    }),
    r({
      recipe_key: 'c',
      category: 'main',
      name: 'Salade quinoa',
      description: 'Bowl léger riche en protéines',
      tags: ['végétarien', 'fibres'],
    }),
  ];

  it('returns everything with no filters', () => {
    expect(applyFilters(all, {})).toHaveLength(3);
  });

  it('filters by category', () => {
    expect(applyFilters(all, { category: 'main' })).toHaveLength(2);
    expect(applyFilters(all, { category: 'breakfast' }).map((r) => r.recipe_key)).toEqual(['b']);
  });

  it('filters by single tag', () => {
    expect(applyFilters(all, { tags: ['rapide'] }).map((r) => r.recipe_key)).toEqual(['a', 'b']);
  });

  it('treats multiple tags as AND, not OR', () => {
    expect(applyFilters(all, { tags: ['végétarien', 'rapide'] }).map((r) => r.recipe_key)).toEqual(['b']);
  });

  it('search matches name (case-insensitive)', () => {
    expect(applyFilters(all, { search: 'burger' }).map((r) => r.recipe_key)).toEqual(['a']);
    expect(applyFilters(all, { search: 'BURGER' }).map((r) => r.recipe_key)).toEqual(['a']);
  });

  it('search matches description', () => {
    expect(applyFilters(all, { search: 'cheddar' }).map((r) => r.recipe_key)).toEqual(['a']);
  });

  it('search matches tags', () => {
    expect(applyFilters(all, { search: 'fibres' }).map((r) => r.recipe_key)).toEqual(['c']);
  });

  it('combines filters with AND semantics', () => {
    expect(applyFilters(all, { category: 'main', tags: ['végétarien'] }).map((r) => r.recipe_key)).toEqual(['c']);
  });

  it('ignores blank search strings', () => {
    expect(applyFilters(all, { search: '   ' })).toHaveLength(3);
  });
});
