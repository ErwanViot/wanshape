import type { WarmupBlock, CooldownBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';

export function expandWarmup(
  block: WarmupBlock | CooldownBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS[block.type];
  const base = { blockName: block.name, blockType: block.type, blockColor: color, blockIndex, totalBlocks };

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${block.exercises.length} exercices`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  const totalExercises = block.exercises.length;

  for (let i = 0; i < totalExercises; i++) {
    const ex = block.exercises[i];
    const totalDuration = ex.bilateral ? ex.duration * 2 : ex.duration;
    const isLast = i === totalExercises - 1;
    const exerciseInfo = { current: i + 1, total: totalExercises };

    const next = !isLast ? block.exercises[i + 1] : undefined;

    steps.push({
      id: `block-${blockIndex}-ex-${i}-work`,
      phase: "work",
      timerMode: "countdown",
      duration: totalDuration,
      exerciseName: ex.name,
      instructions: ex.bilateral
        ? `${ex.instructions} (${ex.duration}s par cote)`
        : ex.instructions,
      ...base,
      exerciseInfo,
      isLastInBlock: isLast,
      nextStepPreview: next
        ? { exerciseName: next.name, description: `${next.bilateral ? next.duration * 2 : next.duration}s` }
        : undefined,
      estimatedDuration: totalDuration,
    });
  }

  return steps;
}
