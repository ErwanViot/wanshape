import type { AtomicStep } from '../../types/player.ts';
import type { TabataBlock } from '../../types/session.ts';
import { BLOCK_COLORS, TABATA_DEFAULTS, TRANSITION_DURATION } from '../constants.ts';

export function expandTabata(block: TabataBlock, blockIndex: number, totalBlocks: number): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.tabata;
  const base = { blockName: block.name, blockType: block.type, blockColor: color, blockIndex, totalBlocks };

  const sets = block.sets ?? TABATA_DEFAULTS.sets;
  const rounds = block.rounds ?? TABATA_DEFAULTS.rounds;
  const work = block.work ?? TABATA_DEFAULTS.work;
  const rest = block.rest ?? TABATA_DEFAULTS.rest;
  const restBetweenSets = block.restBetweenSets ?? TABATA_DEFAULTS.restBetweenSets;

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: 'transition',
    timerMode: 'countdown',
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${sets > 1 ? `${sets} sets x ` : ''}${rounds} rounds - ${work}s/${rest}s`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  for (let set = 0; set < sets; set++) {
    const setInfo = sets > 1 ? { current: set + 1, total: sets } : undefined;
    const isLastSet = set === sets - 1;

    for (let round = 0; round < rounds; round++) {
      const roundInfo = { current: round + 1, total: rounds };
      const isLastRound = round === rounds - 1;

      for (let exIdx = 0; exIdx < block.exercises.length; exIdx++) {
        const ex = block.exercises[exIdx];
        const isLastExercise = exIdx === block.exercises.length - 1;
        const nextEx = !isLastExercise ? block.exercises[exIdx + 1] : block.exercises[0];
        const isVeryLast = isLastSet && isLastRound && isLastExercise;

        steps.push({
          id: `block-${blockIndex}-set-${set}-round-${round}-ex-${exIdx}-work`,
          phase: 'work',
          timerMode: 'countdown',
          duration: work,
          exerciseName: ex.name,
          instructions: ex.instructions,
          ...base,
          setInfo,
          roundInfo,
          isLastInBlock: isVeryLast,
          isLastInRound: isLastExercise,
          estimatedDuration: work,
        });

        // Rest after each exercise, except after the very last exercise of the very last round/set
        if (!isVeryLast) {
          const isEndOfRound = isLastExercise;
          const nextLabel = isEndOfRound
            ? isLastRound
              ? `Set ${set + 2}/${sets} dans...`
              : `Round ${round + 2}/${rounds} - ${block.exercises[0].name}`
            : `${nextEx!.name}`;

          steps.push({
            id: `block-${blockIndex}-set-${set}-round-${round}-ex-${exIdx}-rest`,
            phase: 'rest',
            timerMode: 'countdown',
            duration:
              isEndOfRound && !isLastRound ? rest : isEndOfRound && isLastRound && !isLastSet ? restBetweenSets : rest,
            exerciseName: 'Repos',
            instructions: `Prochain : ${nextLabel}`,
            ...base,
            setInfo,
            roundInfo,
            estimatedDuration: isEndOfRound && isLastRound && !isLastSet ? restBetweenSets : rest,
          });
        }
      }
    }
  }

  return steps;
}
