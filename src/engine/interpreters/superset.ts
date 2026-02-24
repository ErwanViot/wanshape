import type { AtomicStep } from '../../types/player.ts';
import type { SupersetBlock } from '../../types/session.ts';
import { BLOCK_COLORS, DEFAULT_REST_FOR_REPS, TRANSITION_DURATION } from '../constants.ts';

export function expandSuperset(block: SupersetBlock, blockIndex: number, totalBlocks: number): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.superset;
  const base = { blockName: block.name, blockType: block.type, blockColor: color, blockIndex, totalBlocks };

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: 'transition',
    timerMode: 'countdown',
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${block.sets} séries - ${block.pairs.length} paire${block.pairs.length > 1 ? 's' : ''}`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  for (let set = 0; set < block.sets; set++) {
    const setInfo = { current: set + 1, total: block.sets };
    const isLastSet = set === block.sets - 1;

    for (let pairIdx = 0; pairIdx < block.pairs.length; pairIdx++) {
      const pair = block.pairs[pairIdx];
      const isLastPair = pairIdx === block.pairs.length - 1;

      for (let exIdx = 0; exIdx < pair.exercises.length; exIdx++) {
        const ex = pair.exercises[exIdx];
        const isLastExInPair = exIdx === pair.exercises.length - 1;

        const nextEx = !isLastExInPair
          ? pair.exercises[exIdx + 1]
          : !isLastPair
            ? block.pairs[pairIdx + 1].exercises[0]
            : undefined;

        steps.push({
          id: `block-${blockIndex}-set-${set}-pair-${pairIdx}-ex-${exIdx}-work`,
          phase: 'work',
          timerMode: 'manual',
          duration: null,
          exerciseName: ex.name,
          instructions: ex.instructions,
          repTarget: ex.reps,
          ...base,
          setInfo,
          isLastInBlock: isLastSet && isLastPair && isLastExInPair,
          nextStepPreview: nextEx ? { exerciseName: nextEx.name, description: `${nextEx.reps} reps` } : undefined,
          estimatedDuration: DEFAULT_REST_FOR_REPS,
        });
      }

      // Rest between pairs within a set
      if (!isLastPair && block.restBetweenPairs) {
        const nextPair = block.pairs[pairIdx + 1];
        steps.push({
          id: `block-${blockIndex}-set-${set}-pair-${pairIdx}-rest`,
          phase: 'rest',
          timerMode: 'countdown',
          duration: block.restBetweenPairs,
          exerciseName: 'Repos',
          instructions: `Prochain : ${nextPair.exercises[0].name}`,
          ...base,
          setInfo,
          estimatedDuration: block.restBetweenPairs,
        });
      }
    }

    // Rest between sets
    if (!isLastSet) {
      steps.push({
        id: `block-${blockIndex}-set-${set}-rest`,
        phase: 'rest',
        timerMode: 'countdown',
        duration: block.restBetweenSets,
        exerciseName: 'Repos',
        instructions: `Série ${set + 2}/${block.sets} dans...`,
        ...base,
        setInfo,
        estimatedDuration: block.restBetweenSets,
      });
    }
  }

  return steps;
}
