/**
 * Seed script — inserts the recipe library into Supabase for one locale at
 * a time. Defaults to seeding both fr + en sequentially.
 *
 * Usage:
 *   npx tsx scripts/seed-recipes.ts          # seeds fr then en
 *   npx tsx scripts/seed-recipes.ts fr       # seeds fr only
 *   npx tsx scripts/seed-recipes.ts en       # seeds en only
 *
 * Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 *
 * Idempotent via UPSERT on the (recipe_key, locale) primary key.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import type {
  RecipeCategory,
  RecipeDifficulty,
  RecipeIngredient,
  RecipeLocale,
  RecipeNutrition,
} from '../src/types/recipe.ts';
import { slugify } from '../src/utils/slug.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

interface SeedRecipe {
  id: string;
  category: RecipeCategory;
  name: string;
  description: string;
  /** May be missing on future entries; the DB column is nullable. */
  prepTime?: number | null;
  difficulty?: RecipeDifficulty | null;
  servings: number;
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  /** Optional free-form tip (lighter variant, pairing, batch advice…). */
  tip?: string | null;
}

/**
 * Some seed entries use `qty` as free-form seasoning text with an empty `item`
 * (e.g. `{ qty: "Sel, poivre, paprika fumé", item: "" }`). The UI iterates on
 * `item` to render the ingredient name, which would print blank rows.
 * Normalise these into `{ qty: "", item: "<text>" }` so consumers stay simple.
 */
function normaliseIngredients(ingredients: RecipeIngredient[]): RecipeIngredient[] {
  return ingredients.map((ing) => {
    if ((!ing.item || ing.item.trim() === '') && ing.qty?.trim()) {
      return { qty: '', item: ing.qty.trim() };
    }
    return ing;
  });
}

interface SeedFile {
  version: string;
  generated: string;
  recipes: SeedRecipe[];
}

const supabase = createClient(url, serviceKey);

async function seedLocale(locale: RecipeLocale): Promise<{ ok: number; failed: number }> {
  const seedPath = join(__dirname, 'data', `recipes_${locale}_seed.json`);
  const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as SeedFile;
  console.log(`[seed-recipes] loaded ${seed.recipes.length} ${locale.toUpperCase()} recipes`);

  // Pre-flight slug-collision detection per locale (the UNIQUE constraint is
  // (locale, slug), so a collision in the same locale is what would fail PG).
  const slugIndex = new Map<string, string>();
  for (const r of seed.recipes) {
    const s = slugify(r.name);
    const previous = slugIndex.get(s);
    if (previous) {
      throw new Error(`slug collision in ${locale}: "${s}" produced by both ${previous} and ${r.id}`);
    }
    slugIndex.set(s, r.id);
  }

  let ok = 0;
  let failed = 0;
  for (const r of seed.recipes) {
    const row = {
      recipe_key: r.id,
      locale,
      slug: slugify(r.name),
      category: r.category,
      name: r.name,
      description: r.description,
      prep_time_min: r.prepTime ?? null,
      difficulty: r.difficulty ?? null,
      servings: r.servings,
      nutrition: r.nutrition,
      ingredients: normaliseIngredients(r.ingredients),
      steps: r.steps,
      tags: r.tags,
      tip: r.tip ?? null,
      is_published: true,
    };

    const { error } = await supabase.from('recipes').upsert(row, { onConflict: 'recipe_key,locale' });
    if (error) {
      failed++;
      console.error(`  ✗ ${r.id}: ${error.message}`);
    } else {
      ok++;
      process.stdout.write(`\r[seed-recipes:${locale}] ${ok}/${seed.recipes.length} upserted`);
    }
  }
  console.log(`\n[seed-recipes:${locale}] ok=${ok} failed=${failed}`);
  return { ok, failed };
}

async function main() {
  const arg = process.argv[2] as RecipeLocale | undefined;
  const locales: RecipeLocale[] = arg ? [arg] : ['fr', 'en'];

  if (arg && arg !== 'fr' && arg !== 'en') {
    console.error(`unknown locale "${arg}" — accepted: fr | en`);
    process.exit(1);
  }

  let totalFailed = 0;
  for (const locale of locales) {
    const { failed } = await seedLocale(locale);
    totalFailed += failed;
  }
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[seed-recipes] fatal:', err);
  process.exit(1);
});
