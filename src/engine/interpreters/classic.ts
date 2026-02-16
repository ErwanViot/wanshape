import type { ClassicBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION, DEFAULT_REST_FOR_REPS } from '../constants.ts';

export function expandClassic(
  block: ClassicBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.classic;
  const base = { blockName: block.name, blockType: block.type as const, blockColor: color, blockIndex, totalBlocks };

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

  for (let exIdx = 0; exIdx < block.exercises.length; exIdx++) {
    const ex = block.exercises[exIdx];
    const isLastExercise = exIdx === block.exercises.length - 1;

    for (let set = 0; set < ex.sets; set++) {
      const isLastSet = set === ex.sets - 1;
      const setInfo = { current: set + 1, total: ex.sets };

      // Work step
      const repsLabel = ex.reps === "max" ? "max reps" : `${ex.reps} reps`;
      steps.push({
        id: `block-${blockIndex}-ex-${exIdx}-set-${set}-work`,
        phase: "work",
        timerMode: "manual",
        duration: null,
        exerciseName: ex.name,
        instructions: ex.instructions,
        repTarget: ex.reps,
        tempo: ex.tempo,
        ...base,
        setInfo,
        isLastInBlock: isLastExercise && isLastSet,
        nextStepPreview: !isLastSet
          ? { exerciseName: ex.name, description: `Série ${set + 2}/${ex.sets} - ${repsLabel}` }
          : !isLastExercise
            ? { exerciseName: block.exercises[exIdx + 1].name, description: `${block.exercises[exIdx + 1].reps === "max" ? "max" : block.exercises[exIdx + 1].reps} reps` }
            : undefined,
        estimatedDuration: DEFAULT_REST_FOR_REPS,
      });

      // Rest after set (not after last set of exercise)
      if (!isLastSet) {
        steps.push({
          id: `block-${blockIndex}-ex-${exIdx}-set-${set}-rest`,
          phase: "rest",
          timerMode: "countdown",
          duration: ex.restBetweenSets,
          exerciseName: "Repos",
          instructions: `Prochain : ${ex.name} - Série ${set + 2}/${ex.sets}`,
          ...base,
          setInfo,
          estimatedDuration: ex.restBetweenSets,
        });
      }
    }

    // Rest between exercises (not after last exercise)
    if (!isLastExercise) {
      const nextEx = block.exercises[exIdx + 1];
      steps.push({
        id: `block-${blockIndex}-ex-${exIdx}-transition-rest`,
        phase: "rest",
        timerMode: "countdown",
        duration: block.restBetweenExercises,
        exerciseName: "Repos",
        instructions: `Prochain : ${nextEx.name}`,
        ...base,
        estimatedDuration: block.restBetweenExercises,
      });
    }
  }

  return steps;
}
