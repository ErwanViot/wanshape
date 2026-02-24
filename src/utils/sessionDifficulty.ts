import type { Session, Block } from '../types/session.ts';

export type DifficultyLevel = 'accessible' | 'modere' | 'intense';

export interface Difficulty {
  level: DifficultyLevel;
  label: string;
  score: number;
}

const BLOCK_WEIGHTS: Record<string, number> = {
  classic: 1,
  circuit: 2,
  superset: 2,
  pyramid: 2.5,
  emom: 3,
  hiit: 4,
  tabata: 4.5,
  amrap: 4,
};

const LABELS: Record<DifficultyLevel, string> = {
  accessible: 'Accessible',
  modere: 'Modéré',
  intense: 'Intense',
};

function getWorkRestRatio(block: Block): number | null {
  if (block.type === 'hiit') return block.work / block.rest;
  if (block.type === 'tabata') {
    const work = block.work ?? 20;
    const rest = block.rest ?? 10;
    return work / rest;
  }
  return null;
}

export function computeDifficulty(session: Session): Difficulty {
  const activeBlocks = session.blocks.filter(
    (b) => b.type !== 'warmup' && b.type !== 'cooldown',
  );

  if (activeBlocks.length === 0) {
    return { level: 'accessible', label: LABELS.accessible, score: 0 };
  }

  // Weighted average of block weights
  const totalWeight = activeBlocks.reduce(
    (sum, b) => sum + (BLOCK_WEIGHTS[b.type] ?? 1),
    0,
  );
  let score = totalWeight / activeBlocks.length;

  // Bonus: harsh work/rest ratio on HIIT/Tabata
  for (const block of activeBlocks) {
    const ratio = getWorkRestRatio(block);
    if (ratio !== null && ratio >= 1.5) {
      score += 0.5;
    }
  }

  // Bonus: multiple active blocks
  if (activeBlocks.length > 1) {
    score += 0.3 * (activeBlocks.length - 1);
  }

  // Bonus: long session
  if (session.estimatedDuration > 35) {
    score += 0.3;
  }

  // Map to level
  let level: DifficultyLevel;
  if (score <= 2) level = 'accessible';
  else if (score < 4) level = 'modere';
  else level = 'intense';

  return { level, label: LABELS[level], score: Math.round(score * 100) / 100 };
}
