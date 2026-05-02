import { describe, expect, it } from 'vitest';
import type { Recipe } from '../types/recipe.ts';
import { pickRecipeByCategory } from './pickRecipe.ts';

function r(overrides: Partial<Recipe>): Recipe {
  return {
    recipe_key: 'k',
    locale: 'fr',
    slug: 's',
    category: 'main',
    name: 'n',
    description: 'd',
    prep_time_min: 10,
    difficulty: 'facile',
    servings: 1,
    nutrition: { calories: 100, protein: 0, carbs: 0, fat: 0 },
    ingredients: [],
    steps: [],
    tags: [],
    is_published: true,
    created_at: '2026-05-02T00:00:00Z',
    updated_at: '2026-05-02T00:00:00Z',
    ...overrides,
  };
}

describe('pickRecipeByCategory', () => {
  const recipes = [
    r({ recipe_key: 'p1', category: 'post' }),
    r({ recipe_key: 'p2', category: 'post' }),
    r({ recipe_key: 'p3', category: 'post' }),
    r({ recipe_key: 'r1', category: 'recovery' }),
    r({ recipe_key: 'm1', category: 'main' }),
  ];

  it('returns null when no recipe matches the categories', () => {
    expect(pickRecipeByCategory(recipes, ['breakfast'], 'seed')).toBeNull();
    expect(pickRecipeByCategory([], ['post'], 'seed')).toBeNull();
  });

  it('only picks from the matching subset', () => {
    for (let i = 0; i < 20; i++) {
      const picked = pickRecipeByCategory(recipes, ['post'], `seed-${i}`);
      expect(picked).not.toBeNull();
      expect(picked?.category).toBe('post');
    }
  });

  it('honours multiple categories (union)', () => {
    const picks = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const p = pickRecipeByCategory(recipes, ['post', 'recovery'], `seed-${i}`);
      if (p) picks.add(p.recipe_key);
    }
    expect(picks).toEqual(new Set(['p1', 'p2', 'p3', 'r1']));
  });

  it('is deterministic for the same seed', () => {
    const a = pickRecipeByCategory(recipes, ['post'], 'stable-seed');
    const b = pickRecipeByCategory(recipes, ['post'], 'stable-seed');
    expect(a).toBe(b);
  });

  it('different seeds explore different recipes', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const p = pickRecipeByCategory(recipes, ['post'], `seed-${i}`);
      if (p) seen.add(p.recipe_key);
    }
    // With 3 candidates and 50 seeds, we should hit at least 2 distinct picks.
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });
});
