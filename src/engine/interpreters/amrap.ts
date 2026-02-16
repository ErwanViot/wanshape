import type { AMRAPBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';

export function expandAMRAP(
  block: AMRAPBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.amrap;
  const base = { blockName: block.name, blockType: block.type as const, blockColor: color, blockIndex, totalBlocks };

  const exercisesSummary = block.exercises
    .map(ex => `${ex.reps} ${ex.name}`)
    .join(" + ");

  const durationMin = Math.floor(block.duration / 60);

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${durationMin} min - Max de rounds`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  steps.push({
    id: `block-${blockIndex}-amrap`,
    phase: "work",
    timerMode: "amrap",
    duration: block.duration,
    exerciseName: block.name,
    instructions: exercisesSummary,
    ...base,
    amrapExercises: block.exercises.map(ex => ({ name: ex.name, reps: ex.reps })),
    isLastInBlock: true,
    estimatedDuration: block.duration,
  });

  return steps;
}
