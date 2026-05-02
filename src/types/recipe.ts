/**
 * Recipe domain types — shared between hooks, components, seed script, and
 * SEO JSON-LD generation. Mirrors the `recipes` Supabase schema 1:1.
 */

export type RecipeLocale = 'fr' | 'en';

export type RecipeCategory =
  | 'pre' // pré-entraînement
  | 'post' // post-entraînement
  | 'breakfast'
  | 'recovery'
  | 'snack'
  | 'main' // plats du quotidien
  | 'dessert'
  | 'base'; // bases & pâtes

export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile';

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface RecipeIngredient {
  qty: string;
  item: string;
}

export interface Recipe {
  recipe_key: string;
  locale: RecipeLocale;
  slug: string;
  category: RecipeCategory;
  name: string;
  description: string;
  prep_time_min: number | null;
  difficulty: RecipeDifficulty | null;
  servings: number;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeFavorite {
  user_id: string;
  recipe_key: string;
  created_at: string;
}
