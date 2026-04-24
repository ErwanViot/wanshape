export type ExerciseCategory = 'upper' | 'lower' | 'core' | 'cardio' | 'full-body' | 'mobility';

export interface ExerciseData {
  slug: string;
  name: string;
  aliases: string[];
  category: ExerciseCategory;
  muscles: string[];
  difficulty: 1 | 2 | 3;
  image: string;
  video?: string;
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
