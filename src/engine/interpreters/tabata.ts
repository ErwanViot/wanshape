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

    steps.push({
      id: `block-${blockIndex}-set-${set}-prepare`,
      phase: "prepare",
      timerMode: "countdown",
      duration: PREPARE_COUNTDOWN,
      exerciseName: block.exercises[0].name,
      instructions: sets > 1 ? `Set ${set + 1}/${sets} - Préparez-vous !` : "Préparez-vous !",
      ...base,
      setInfo,
      estimatedDuration: PREPARE_COUNTDOWN,
    });

    for (let round = 0; round < rounds; round++) {
      const exIdx = round % block.exercises.length;
      const ex = block.exercises[exIdx];
      const roundInfo = { current: round + 1, total: rounds };
      const isLastRound = round === rounds - 1;

      const nextExIdx = (round + 1) % block.exercises.length;
      const nextEx = !isLastRound ? block.exercises[nextExIdx] : undefined;

      steps.push({
        id: `block-${blockIndex}-set-${set}-round-${round}-work`,
        phase: "work",
        timerMode: "countdown",
        duration: work,
        exerciseName: ex.name,
        instructions: ex.instructions,
        ...base,
        setInfo,
        roundInfo,
        isLastInBlock: isLastSet && isLastRound,
        isLastInRound: isLastRound,
        nextStepPreview: nextEx
          ? { exerciseName: nextEx.name, description: `${work}s` }
          : undefined,
        estimatedDuration: work,
      });

      if (!(isLastRound && isLastSet)) {
        if (!isLastRound) {
          steps.push({
            id: `block-${blockIndex}-set-${set}-round-${round}-rest`,
            phase: "rest",
            timerMode: "countdown",
            duration: rest,
            exerciseName: "Repos",
            instructions: nextEx ? `Prochain : ${nextEx.name}` : "",
            ...base,
            setInfo,
            roundInfo,
            estimatedDuration: rest,
          });
        } else if (!isLastSet) {
          steps.push({
            id: `block-${blockIndex}-set-${set}-rest-between`,
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
  }

  return steps;
}
