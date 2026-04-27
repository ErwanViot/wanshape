export type ExerciseCategory = 'upper' | 'lower' | 'core' | 'cardio' | 'full-body' | 'mobility';

export interface ExerciseData {
  slug: string;
  category: ExerciseCategory;
  difficulty: 1 | 2 | 3;
  image: string;
  video?: string;
  /** Video URLs for variants, keyed by variant index. Only present when a variant has a video. */
  variantVideos?: Record<number, string>;
}

/** Full exercise data as returned to the view layer (static fields + i18n-resolved text). */
export interface ExerciseView extends ExerciseData {
  name: string;
  aliases: string[];
  muscles: string[];
  shortDescription: string;
  execution: string;
  breathing: string;
  benefits: string[];
  variants: { name: string; description: string; video?: string }[];
  tips: string[];
  commonMistakes: string[];
}

export const CATEGORY_ORDER: ExerciseCategory[] = ['upper', 'lower', 'core', 'cardio', 'full-body', 'mobility'];

export const DIFFICULTY_COLORS = [
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'bg-red-500/15 text-red-400 border-red-500/20',
] as const;
