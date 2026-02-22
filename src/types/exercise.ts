export interface ExerciseData {
  slug: string;
  name: string;
  aliases: string[];
  category: 'upper' | 'lower' | 'core' | 'cardio' | 'full-body' | 'mobility';
  muscles: string[];
  difficulty: 1 | 2 | 3;
  image: string;
  shortDescription: string;
  execution: string;
  breathing: string;
  benefits: string[];
  variants: { name: string; description: string }[];
  tips: string[];
  commonMistakes: string[];
}
