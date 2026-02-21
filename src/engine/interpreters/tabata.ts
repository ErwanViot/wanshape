import type { TabataBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION, PREPARE_COUNTDOWN, TABATA_DEFAULTS } from '../constants.ts';

export function expandTabata(
  block: TabataBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
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
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${sets > 1 ? `${sets} sets x ` : ""}${rounds} rounds - ${work}s/${rest}s`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  for (let set = 0; set < sets; set++) {
    const setInfo = sets > 1 ? { current: set + 1, total: sets } : undefined;
    const isLastSet = set === sets - 1;

    for (let exIdx = 0; exIdx < block.exercises.length; exIdx++) {
      const ex = block.exercises[exIdx];
      const isLastExercise = exIdx === block.exercises.length - 1;
      const nextEx = !isLastExercise ? block.exercises[exIdx + 1] : undefined;

      steps.push({
        id: `block-${blockIndex}-set-${set}-ex-${exIdx}-prepare`,
        phase: "prepare",
        timerMode: "countdown",
        duration: PREPARE_COUNTDOWN,
        exerciseName: ex.name,
        instructions: `${ex.name} - ${rounds} rounds de ${work}s/${rest}s`,
        ...base,
        setInfo,
        estimatedDuration: PREPARE_COUNTDOWN,
      });

      for (let round = 0; round < rounds; round++) {
        const roundInfo = { current: round + 1, total: rounds };
        const isLastRound = round === rounds - 1;

        steps.push({
          id: `block-${blockIndex}-set-${set}-ex-${exIdx}-round-${round}-work`,
          phase: "work",
          timerMode: "countdown",
          duration: work,
          exerciseName: ex.name,
          instructions: ex.instructions,
          ...base,
          setInfo,
          roundInfo,
          isLastInBlock: isLastSet && isLastExercise && isLastRound,
          isLastInRound: isLastRound,
          estimatedDuration: work,
        });

        if (!isLastRound) {
          steps.push({
            id: `block-${blockIndex}-set-${set}-ex-${exIdx}-round-${round}-rest`,
            phase: "rest",
            timerMode: "countdown",
            duration: rest,
            exerciseName: "Repos",
            instructions: `${ex.name} - Round ${round + 2}/${rounds}`,
            ...base,
            setInfo,
            roundInfo,
            estimatedDuration: rest,
          });
        }
      }

      // Rest between exercises (within same set)
      if (!isLastExercise) {
        steps.push({
          id: `block-${blockIndex}-set-${set}-ex-${exIdx}-rest-between`,
          phase: "rest",
          timerMode: "countdown",
          duration: restBetweenSets,
          exerciseName: "Repos",
          instructions: nextEx ? `Prochain : ${nextEx.name}` : "",
          ...base,
          setInfo,
          estimatedDuration: restBetweenSets,
        });
      } else if (!isLastSet) {
        // Rest between sets
        steps.push({
          id: `block-${blockIndex}-set-${set}-rest-between-sets`,
          phase: "rest",
          timerMode: "countdown",
          duration: restBetweenSets,
          exerciseName: "Repos entre sets",
          instructions: `Set ${set + 2}/${sets} dans...`,
          ...base,
          setInfo,
          isLastInRound: true,
          estimatedDuration: restBetweenSets,
        });
      }
    }
  }

  return steps;
}
