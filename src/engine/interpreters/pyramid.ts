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

  for (let i = 0; i < block.pattern.length; i++) {
    const reps = block.pattern[i];
    const isLast = i === block.pattern.length - 1;
    const setInfo = { current: i + 1, total: block.pattern.length };

    // Cycle through exercises
    const exIdx = i % block.exercises.length;
    const ex = block.exercises[exIdx];

    steps.push({
      id: `block-${blockIndex}-step-${i}-work`,
      phase: "work",
      timerMode: "manual",
      duration: null,
      exerciseName: ex.name,
      instructions: ex.instructions,
      repTarget: reps,
      ...base,
      setInfo,
      isLastInBlock: isLast,
      nextStepPreview: !isLast
        ? { exerciseName: block.exercises[(i + 1) % block.exercises.length].name, description: `${block.pattern[i + 1]} reps` }
        : undefined,
      estimatedDuration: DEFAULT_REST_FOR_REPS,
    });

    if (!isLast) {
      steps.push({
        id: `block-${blockIndex}-step-${i}-rest`,
        phase: "rest",
        timerMode: "countdown",
        duration: block.restBetweenSets,
        exerciseName: "Repos",
        instructions: `Prochain : ${block.pattern[i + 1]} reps`,
        ...base,
        setInfo,
        estimatedDuration: block.restBetweenSets,
      });
    }
  }

  return steps;
}
