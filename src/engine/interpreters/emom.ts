import type { EMOMBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';

export function expandEMOM(
  block: EMOMBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.emom;
  const base = { blockName: block.name, blockType: block.type, blockColor: color, blockIndex, totalBlocks };
  const intervalDuration = block.intervalDuration ?? 60;

  const exercisesSummary = block.exercises
    .map(ex => `${ex.reps} ${ex.name}`)
    .join(" + ");

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${block.minutes} minutes - ${exercisesSummary}`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  for (let min = 0; min < block.minutes; min++) {
    const roundInfo = { current: min + 1, total: block.minutes };
    const isLast = min === block.minutes - 1;

    steps.push({
      id: `block-${blockIndex}-min-${min}`,
      phase: "work",
      timerMode: "emom",
      duration: intervalDuration,
      exerciseName: `Minute ${min + 1}/${block.minutes}`,
      instructions: exercisesSummary,
      ...base,
      roundInfo,
      emomExercises: block.exercises.map(ex => ({ name: ex.name, reps: ex.reps })),
      isLastInBlock: isLast,
      nextStepPreview: !isLast
        ? { exerciseName: `Minute ${min + 2}/${block.minutes}`, description: exercisesSummary }
        : undefined,
      estimatedDuration: intervalDuration,
    });
  }

  return steps;
}
