import type { ExerciseData } from '../types/exercise.ts';

export const EXERCISES_DATA: ExerciseData[] = [
  // ─── Haut du corps ──────────────────────────────────────────────
  {
    slug: 'pompes-classiques',
    category: 'upper',
    difficulty: 2,
    image: '/images/upper.webp',
    video: '/videos/pompes-classiques.mp4',
    variantVideos: {
      2: '/videos/pompes-declinees.mp4',
      6: '/videos/pompes-hindu.mp4',
      7: '/videos/pompes-larges.mp4',
      9: '/videos/scapular-push-ups.mp4',
    },
  },
  {
    slug: 'dips-sur-chaise',
    category: 'upper',
    difficulty: 2,
    image: '/images/upper.webp',
    video: '/videos/dips-sur-chaise.mp4',
  },
  {
    slug: 'rowing-inverse',
    category: 'upper',
    difficulty: 2,
    image: '/images/upper.webp',
    variantVideos: {
      0: '/videos/face-pulls-au-sol.mp4',
    },
  },

  // ─── Bas du corps ───────────────────────────────────────────────
  {
    slug: 'squats',
    category: 'lower',
    difficulty: 1,
    image: '/images/explosive.webp',
    variantVideos: {
      4: '/videos/squats-1-5.mp4',
    },
  },
  {
    slug: 'fentes',
    category: 'lower',
    difficulty: 2,
    image: '/images/lower.webp',
    variantVideos: {
      6: '/videos/fentes-marchees.mp4',
    },
  },
  {
    slug: 'glute-bridge',
    category: 'lower',
    difficulty: 1,
    image: '/images/lower.webp',
    video: '/videos/glute-bridge.mp4',
  },
  {
    slug: 'box-jumps',
    category: 'lower',
    difficulty: 2,
    image: '/images/explosive.webp',
  },
  {
    slug: 'good-morning',
    category: 'lower',
    difficulty: 2,
    image: '/images/lower.webp',
  },

  // ─── Core ───────────────────────────────────────────────────────
  {
    slug: 'gainage-planche',
    category: 'core',
    difficulty: 1,
    image: '/images/core.webp',
  },
  {
    slug: 'crunchs',
    category: 'core',
    difficulty: 1,
    image: '/images/core.webp',
    variantVideos: {
      1: '/videos/sit-ups.mp4',
      2: '/videos/v-ups.mp4',
    },
  },
  {
    slug: 'superman',
    category: 'core',
    difficulty: 1,
    image: '/images/core.webp',
    variantVideos: {
      0: '/videos/superman-alterne.mp4',
      4: '/videos/prone-t-raises.mp4',
    },
  },
  {
    slug: 'leg-raises',
    category: 'core',
    difficulty: 2,
    image: '/images/core.webp',
  },
  {
    slug: 'dead-bug',
    category: 'core',
    difficulty: 1,
    image: '/images/core.webp',
  },

  // ─── Cardio ─────────────────────────────────────────────────────
  {
    slug: 'mountain-climbers',
    category: 'cardio',
    difficulty: 2,
    image: '/images/cardio.webp',
  },
  {
    slug: 'jumping-jacks',
    category: 'cardio',
    difficulty: 1,
    image: '/images/cardio.webp',
    video: '/videos/jumping-jacks.mp4',
  },
  {
    slug: 'high-knees',
    category: 'cardio',
    difficulty: 2,
    image: '/images/cardio.webp',
  },
  {
    slug: 'skaters',
    category: 'cardio',
    difficulty: 2,
    image: '/images/explosive.webp',
    variantVideos: {
      1: '/videos/pas-chasses.mp4',
    },
  },

  // ─── Full body ──────────────────────────────────────────────────
  {
    slug: 'burpees',
    category: 'full-body',
    difficulty: 3,
    image: '/images/cardio.webp',
  },
  {
    slug: 'inchworms',
    category: 'full-body',
    difficulty: 1,
    image: '/images/fullbody.webp',
    video: '/videos/inchworms.mp4',
  },

  // ─── Mobilité & Échauffement ───────────────────────────────────
  {
    slug: 'etirements',
    category: 'mobility',
    difficulty: 1,
    image: '/images/core.webp',
    variantVideos: {
      2: '/videos/etirement-psoas.mp4',
      4: '/videos/etirement-triceps.mp4',
    },
  },
  {
    slug: 'mobilite',
    category: 'mobility',
    difficulty: 1,
    image: '/images/core.webp',
    variantVideos: {
      0: '/videos/cat-cow.mp4',
      1: '/videos/childs-pose.mp4',
      2: '/videos/deep-squat-hold.mp4',
      5: '/videos/scorpion-stretch.mp4',
      6: '/videos/worlds-greatest-stretch.mp4',
    },
  },
  {
    slug: 'echauffement',
    category: 'mobility',
    difficulty: 1,
    image: '/images/cardio.webp',
    variantVideos: {
      0: '/videos/rotations-articulaires.mp4',
    },
  },
];

export function getExerciseBySlug(slug: string): ExerciseData | undefined {
  return EXERCISES_DATA.find((e) => e.slug === slug);
}
