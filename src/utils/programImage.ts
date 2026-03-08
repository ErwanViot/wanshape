const PROGRAM_IMAGES: Record<string, string> = {
  'debutant-4-semaines': '/images/program-debutant.webp',
  'remise-en-forme': '/images/program-remise-en-forme.webp',
  'cardio-express': '/images/program-cardio-express.webp',
};

const DEFAULT_IMAGE = '/images/fullbody.webp';

export function getProgramImage(slug: string): string {
  return PROGRAM_IMAGES[slug] ?? DEFAULT_IMAGE;
}
