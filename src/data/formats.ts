import type { FormatData } from '../types/format.ts';

export const FORMATS_DATA: FormatData[] = [
  {
    type: 'pyramid',
    slug: 'pyramide',
    duration: '30-38',
    intensity: 1,
    image: '/images/explosive.webp',
  },
  {
    type: 'classic',
    slug: 'renforcement',
    duration: '30-35',
    intensity: 2,
    image: '/images/upper.webp',
  },
  {
    type: 'superset',
    slug: 'superset',
    duration: '30-35',
    intensity: 2,
    image: '/images/fullbody.webp',
  },
  {
    type: 'emom',
    slug: 'emom',
    duration: '28-32',
    intensity: 2,
    image: '/images/endurance.webp',
  },
  {
    type: 'circuit',
    slug: 'circuit',
    duration: '30-38',
    intensity: 3,
    image: '/images/fullbody.webp',
  },
  {
    type: 'amrap',
    slug: 'amrap',
    duration: '28-32',
    intensity: 3,
    image: '/images/endurance.webp',
  },
  {
    type: 'hiit',
    slug: 'hiit',
    duration: '25-30',
    intensity: 4,
    image: '/images/cardio.webp',
  },
  {
    type: 'tabata',
    slug: 'tabata',
    duration: '25-28',
    intensity: 5,
    image: '/images/cardio.webp',
  },
];

export function getFormatBySlug(slug: string): FormatData | undefined {
  return FORMATS_DATA.find((f) => f.slug === slug);
}
