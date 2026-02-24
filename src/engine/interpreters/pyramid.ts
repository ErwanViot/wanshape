import type { PyramidBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION, DEFAULT_REST_FOR_REPS } from '../constants.ts';

export function expandPyramid(
  block: PyramidBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.pyramid;
  const base = { blockName: block.name, blockType: block.type, blockColor: color, blockIndex, totalBlocks };

  const patternStr = block.pattern.join("-");
  const restBetweenExercises = block.restBetweenExercises ?? block.restBetweenSets * 2;

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `Pyramide : ${patternStr}`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  const totalExercises = block.exercises.length;

  // Outer loop: each exercise completes the full pyramid pattern
  for (let exIdx = 0; exIdx < totalExercises; exIdx++) {
    const ex = block.exercises[exIdx];
    const isLastExercise = exIdx === totalExercises - 1;
    const exerciseInfo = { current: exIdx + 1, total: totalExercises };

    for (let i = 0; i < block.pattern.length; i++) {
      const reps = block.pattern[i];
      const isLastLevel = i === block.pattern.length - 1;
      const setInfo = { current: i + 1, total: block.pattern.length };

      const nextReps = !isLastLevel ? block.pattern[i + 1] : undefined;
      const nextPreviewInExercise = nextReps !== undefined
        ? { exerciseName: ex.name, description: `${nextReps} reps` }
        : undefined;

      // Preview for last level: next exercise's first level (if any)
      const nextPreviewCrossExercise = isLastLevel && !isLastExercise
        ? { exerciseName: block.exercises[exIdx + 1].name, description: `${block.pattern[0]} reps` }
        : undefined;

      steps.push({
        id: `block-${blockIndex}-ex-${exIdx}-step-${i}-work`,
        phase: "work",
        timerMode: "manual",
        duration: null,
        exerciseName: ex.name,
        instructions: ex.instructions,
        repTarget: reps,
        ...base,
        setInfo,
        exerciseInfo,
        isLastInBlock: isLastExercise && isLastLevel,
        nextStepPreview: nextPreviewInExercise ?? nextPreviewCrossExercise,
        estimatedDuration: DEFAULT_REST_FOR_REPS,
      });

      // Rest between levels (within same exercise)
      if (!isLastLevel) {
        steps.push({
          id: `block-${blockIndex}-ex-${exIdx}-step-${i}-rest`,
          phase: "rest",
          timerMode: "countdown",
          duration: block.restBetweenSets,
          exerciseName: "Repos",
          instructions: `Prochain : ${ex.name} — ${block.pattern[i + 1]} reps`,
          ...base,
          setInfo,
          exerciseInfo,
          estimatedDuration: block.restBetweenSets,
        });
      }
    }

    // Rest between exercises (after completing full pyramid for one exercise)
    if (!isLastExercise) {
      steps.push({
        id: `block-${blockIndex}-ex-${exIdx}-rest-between`,
        phase: "rest",
        timerMode: "countdown",
        duration: restBetweenExercises,
        exerciseName: "Repos",
        instructions: `Prochain exercice : ${block.exercises[exIdx + 1].name}`,
        ...base,
        exerciseInfo,
        estimatedDuration: restBetweenExercises,
      });
    }
  }

  return steps;
}
