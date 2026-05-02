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
