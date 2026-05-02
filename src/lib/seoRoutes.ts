/**
 * BUILD-TIME ONLY — do not import from any module shipped to the browser.
 * This file pulls in the recipe seed JSONs (~150 KB combined) to enumerate
 * sitemap entries; importing it client-side would bundle that payload.
 * The only legitimate consumer is `scripts/prerender.ts`.
 */
import enRecipes from '../../scripts/data/recipes_en_seed.json' with { type: 'json' };
import frRecipes from '../../scripts/data/recipes_fr_seed.json' with { type: 'json' };
import { EXERCISES_DATA } from '../data/exercises.ts';
import { FORMATS_DATA } from '../data/formats.ts';
import { slugify } from '../utils/slug.ts';

export type Hreflang = 'fr-FR' | 'en-US' | 'x-default';

export interface SeoAlternate {
  hreflang: Hreflang;
  /** Absolute path on this site, e.g. /en/nutrition/recipes/sweet-potato-toast. */
  href: string;
}

export interface SeoRoute {
  path: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
  /**
   * Alternate translations of this page. Emitted as `<xhtml:link rel="alternate"
   * hreflang="...">` in the sitemap so search engines can index both locales
   * and serve the right one to each user.
   */
  alternates?: SeoAlternate[];
}

const STATIC_ROUTES: SeoRoute[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/decouvrir', changefreq: 'monthly', priority: 0.5 },
  { path: '/formats', changefreq: 'monthly', priority: 0.8 },
  { path: '/exercices', changefreq: 'monthly', priority: 0.8 },
  { path: '/programmes', changefreq: 'monthly', priority: 0.8 },
  { path: '/tarifs', changefreq: 'monthly', priority: 0.8 },
  { path: '/premium', changefreq: 'monthly', priority: 0.7 },
  { path: '/a-propos', changefreq: 'monthly', priority: 0.6 },
  { path: '/legal/mentions', changefreq: 'yearly', priority: 0.3 },
  { path: '/legal/cgu', changefreq: 'yearly', priority: 0.3 },
  { path: '/legal/cgv', changefreq: 'yearly', priority: 0.3 },
  { path: '/legal/privacy', changefreq: 'yearly', priority: 0.3 },
];

export const FIXED_PROGRAM_SLUGS = ['debutant-4-semaines', 'remise-en-forme', 'cardio-express'] as const;

interface SeedRecipeMinimal {
  id: string;
  name: string;
}

interface SeedFile {
  recipes: SeedRecipeMinimal[];
}

const FR_SEED = frRecipes as SeedFile;
const EN_SEED = enRecipes as SeedFile;

/** Build a recipe_key → slug index per locale once at module load. */
function buildSlugIndex(seed: SeedFile): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of seed.recipes) map.set(r.id, slugify(r.name));
  return map;
}

const FR_SLUGS = buildSlugIndex(FR_SEED);
const EN_SLUGS = buildSlugIndex(EN_SEED);

export function getPublicRoutes(): SeoRoute[] {
  const formatRoutes: SeoRoute[] = FORMATS_DATA.map((f) => ({
    path: `/formats/${f.slug}`,
    changefreq: 'monthly',
    priority: 0.6,
  }));

  const exerciseRoutes: SeoRoute[] = EXERCISES_DATA.map((e) => ({
    path: `/exercices/${e.slug}`,
    changefreq: 'monthly',
    priority: 0.6,
  }));

  const programRoutes: SeoRoute[] = FIXED_PROGRAM_SLUGS.map((slug) => ({
    path: `/programme/${slug}`,
    changefreq: 'monthly',
    priority: 0.7,
  }));

  // Recipe listings (FR + EN) cross-link via hreflang.
  const recipeListingFr: SeoRoute = {
    path: '/nutrition/recettes',
    changefreq: 'weekly',
    priority: 0.8,
    alternates: [
      { hreflang: 'fr-FR', href: '/nutrition/recettes' },
      { hreflang: 'en-US', href: '/en/nutrition/recipes' },
      { hreflang: 'x-default', href: '/nutrition/recettes' },
    ],
  };
  const recipeListingEn: SeoRoute = {
    path: '/en/nutrition/recipes',
    changefreq: 'weekly',
    priority: 0.7,
    alternates: recipeListingFr.alternates,
  };

  // Per-recipe pages: one route per (recipe_key, locale). Each pair shares a
  // recipe_key so we can build the alternates link group across locales.
  const recipeDetailRoutes: SeoRoute[] = [];
  for (const [recipeKey, frSlug] of FR_SLUGS) {
    const enSlug = EN_SLUGS.get(recipeKey);
    const frPath = `/nutrition/recettes/${frSlug}`;
    const enPath = enSlug ? `/en/nutrition/recipes/${enSlug}` : null;
    const alternates: SeoAlternate[] = [
      { hreflang: 'fr-FR', href: frPath },
      ...(enPath ? [{ hreflang: 'en-US' as const, href: enPath }] : []),
      { hreflang: 'x-default', href: frPath },
    ];
    recipeDetailRoutes.push({ path: frPath, changefreq: 'monthly', priority: 0.6, alternates });
    if (enPath) {
      recipeDetailRoutes.push({ path: enPath, changefreq: 'monthly', priority: 0.5, alternates });
    }
  }

  return [
    ...STATIC_ROUTES,
    recipeListingFr,
    recipeListingEn,
    ...formatRoutes,
    ...exerciseRoutes,
    ...programRoutes,
    ...recipeDetailRoutes,
  ];
}
