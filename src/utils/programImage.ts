const PROGRAM_IMAGES: Record<string, string> = {
  'debutant-4-semaines': '/images/program-debutant.webp',
  'remise-en-forme': '/images/program-remise-en-forme.webp',
  'cardio-express': '/images/program-cardio-express.webp',
};

const GOAL_IMAGES: Record<string, string> = {
  perte_poids: '/images/goal-perte-poids.webp',
  prise_muscle: '/images/goal-prise-muscle.webp',
  remise_forme: '/images/goal-remise-forme.webp',
  force: '/images/goal-force.webp',
  endurance: '/images/goal-endurance.webp',
  performance_sportive: '/images/goal-performance.webp',
  bien_etre: '/images/goal-bien-etre.webp',
  souplesse: '/images/goal-souplesse.webp',
};

const DEFAULT_IMAGE = '/images/fullbody.webp';

export function getProgramImage(slug: string, goals?: string[]): string {
  if (PROGRAM_IMAGES[slug]) return PROGRAM_IMAGES[slug];
  if (goals) {
    for (const g of goals) {
      if (GOAL_IMAGES[g]) return GOAL_IMAGES[g];
    }
  }
  return DEFAULT_IMAGE;
}
