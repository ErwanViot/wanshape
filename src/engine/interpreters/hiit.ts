import type { HIITBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION, PREPARE_COUNTDOWN } from '../constants.ts';

export function expandHIIT(
  block: HIITBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.hiit;
  const base = { blockName: block.name, blockType: block.type as const, blockColor: color, blockIndex, totalBlocks };
  const totalIntervals = block.rounds * block.exercises.length;

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${block.rounds} rounds - ${block.work}s/${block.rest}s`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  steps.push({
    id: `block-${blockIndex}-prepare`,
    phase: "prepare",
    timerMode: "countdown",
    duration: PREPARE_COUNTDOWN,
    exerciseName: block.exercises[0].name,
    instructions: "Préparez-vous !",
    ...base,
    estimatedDuration: PREPARE_COUNTDOWN,
  });

  let interval = 0;
  for (let round = 0; round < block.rounds; round++) {
    const roundInfo = { current: round + 1, total: block.rounds };
    const isLastRound = round === block.rounds - 1;

    for (let exIdx = 0; exIdx < block.exercises.length; exIdx++) {
      const ex = block.exercises[exIdx];
      interval++;
      const isLastInterval = interval === totalIntervals;
      const isLastExInRound = exIdx === block.exercises.length - 1;
      const intervalInfo = { current: interval, total: totalIntervals };

      const nextEx = !isLastExInRound
        ? block.exercises[exIdx + 1]
        : !isLastRound
          ? block.exercises[0]
          : undefined;

      steps.push({
        id: `block-${blockIndex}-round-${round}-ex-${exIdx}-work`,
        phase: "work",
        timerMode: "countdown",
        duration: block.work,
        exerciseName: ex.name,
        instructions: ex.instructions,
        ...base,
        roundInfo,
        intervalInfo,
        isLastInBlock: isLastInterval,
        isLastInRound: isLastExInRound,
        nextStepPreview: nextEx
          ? { exerciseName: nextEx.name, description: `${block.work}s` }
          : undefined,
        estimatedDuration: block.work,
      });

      if (!isLastInterval) {
        steps.push({
          id: `block-${blockIndex}-round-${round}-ex-${exIdx}-rest`,
          phase: "rest",
          timerMode: "countdown",
          duration: block.rest,
          exerciseName: "Repos",
          instructions: nextEx ? `Prochain : ${nextEx.name}` : "",
          ...base,
          roundInfo,
          intervalInfo,
          estimatedDuration: block.rest,
        });
      }
    }
  }

  return steps;
}
