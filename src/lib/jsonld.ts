export const SITE_URL = 'https://www.wan2fit.fr';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export interface HowToInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  totalTime?: string;
  supply?: string[];
  steps: { name?: string; text: string }[];
}

export function howToJsonLd(input: HowToInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    image: input.image ? absoluteUrl(input.image) : undefined,
    totalTime: input.totalTime,
    supply: input.supply?.map((s) => ({ '@type': 'HowToSupply', name: s })),
    step: input.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name ?? `Étape ${i + 1}`,
      text: s.text,
    })),
    url: `${SITE_URL}${input.url}`,
  };
}

export interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
}

export function articleJsonLd(input: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    image: input.image ? absoluteUrl(input.image) : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.inLanguage ?? 'fr-FR',
    author: { '@type': 'Organization', name: 'WAN SOFT' },
    publisher: {
      '@type': 'Organization',
      name: 'Wan2Fit',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${input.url}` },
  };
}

export interface CourseInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  duration?: string;
  inLanguage?: string;
}

export function courseJsonLd(input: CourseInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.url}`,
    image: input.image ? absoluteUrl(input.image) : undefined,
    inLanguage: input.inLanguage ?? 'fr-FR',
    provider: { '@type': 'Organization', name: 'Wan2Fit', sameAs: SITE_URL },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: input.duration,
    },
  };
}

function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface RecipeJsonLdInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  inLanguage?: string;
  recipeCategory?: string;
  recipeYield?: number;
  /** ISO 8601 duration, e.g. "PT15M". Built by `minutesToISODuration` below. */
  totalTime?: string;
  recipeIngredient: string[];
  recipeInstructions: string[];
  nutrition?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    /** Servings the nutrition values reference, used to fill `servingSize`. */
    servings: number;
  };
  keywords?: string[];
}

/** Convert a positive minute count to an ISO 8601 duration ("PT15M"). */
export function minutesToISODuration(minutes: number | null | undefined): string | undefined {
  if (minutes == null || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

export function recipeJsonLd(input: RecipeJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: input.name,
    description: input.description,
    image: input.image ? absoluteUrl(input.image) : undefined,
    inLanguage: input.inLanguage ?? 'fr-FR',
    recipeCategory: input.recipeCategory,
    recipeYield: input.recipeYield,
    totalTime: input.totalTime,
    recipeIngredient: input.recipeIngredient,
    recipeInstructions: input.recipeInstructions.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    nutrition: input.nutrition
      ? {
          '@type': 'NutritionInformation',
          calories: `${input.nutrition.calories} kcal`,
          proteinContent: `${input.nutrition.protein_g} g`,
          carbohydrateContent: `${input.nutrition.carbs_g} g`,
          fatContent: `${input.nutrition.fat_g} g`,
          fiberContent: input.nutrition.fiber_g != null ? `${input.nutrition.fiber_g} g` : undefined,
          servingSize: `1 of ${input.nutrition.servings}`,
        }
      : undefined,
    keywords: input.keywords?.length ? input.keywords.join(', ') : undefined,
    url: `${SITE_URL}${input.url}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${input.url}` },
  };
}
