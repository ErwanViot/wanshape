import { EXERCISES_DATA } from '../data/exercises.ts';
import { FORMATS_DATA } from '../data/formats.ts';

export interface SeoRoute {
  path: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
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

  return [...STATIC_ROUTES, ...formatRoutes, ...exerciseRoutes, ...programRoutes];
}
