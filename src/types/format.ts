import type { BlockType } from './session.ts';

export interface FormatData {
  type: BlockType;
  slug: string;
  duration: string;
  intensity: number;
  image: string;
}
