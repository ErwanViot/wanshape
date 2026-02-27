const PROGRAM_IMAGES: Record<string, string> = {
  'debutant-4-semaines': '/images/fullbody.webp',
  'remise-en-forme': '/images/endurance.webp',
  'cardio-express': '/images/cardio.webp',
};

const DEFAULT_IMAGE = '/images/fullbody.webp';

export function getProgramImage(slug: string): string {
  return PROGRAM_IMAGES[slug] ?? DEFAULT_IMAGE;
}
