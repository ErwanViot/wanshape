import type { BlockType } from './session.ts';

export interface FormatData {
  type: BlockType;
  slug: string;
  name: string;
  subtitle: string;
  duration: string;
  intensity: number;
  image: string;
  shortDescription: string;
  principle: string;
  protocol: string;
  benefits: string[];
  targetAudience: string;
  tips: string[];
  commonMistakes: string[];
}
