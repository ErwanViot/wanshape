import type { CircuitBlock } from '../../types/session.ts';
import type { AtomicStep } from '../../types/player.ts';
import { BLOCK_COLORS, TRANSITION_DURATION, PREPARE_COUNTDOWN, DEFAULT_REST_FOR_REPS } from '../constants.ts';

export function expandCircuit(
  block: CircuitBlock,
  blockIndex: number,
  totalBlocks: number
): AtomicStep[] {
  const steps: AtomicStep[] = [];
  const color = BLOCK_COLORS.circuit;
  const base = { blockName: block.name, blockType: block.type as const, blockColor: color, blockIndex, totalBlocks };

  steps.push({
    id: `block-${blockIndex}-transition`,
    phase: "transition",
    timerMode: "countdown",
    duration: TRANSITION_DURATION,
    exerciseName: block.name,
    instructions: `${block.rounds} rounds - ${block.exercises.length} exercices`,
    ...base,
    estimatedDuration: TRANSITION_DURATION,
  });

  for (let round = 0; round < block.rounds; round++) {
    const roundInfo = { current: round + 1, total: block.rounds };
    const isLastRound = round === block.rounds - 1;

    for (let exIdx = 0; exIdx < block.exercises.length; exIdx++) {
      const ex = block.exercises[exIdx];
      const isLastExInRound = exIdx === block.exercises.length - 1;
      const isTimed = ex.mode === "timed";

      // Prepare countdown for first timed exercise of first round
      if (round === 0 && exIdx === 0 && isTimed) {
        steps.push({
          id: `block-${blockIndex}-prepare`,
          phase: "prepare",
          timerMode: "countdown",
          duration: PREPARE_COUNTDOWN,
          exerciseName: ex.name,
          instructions: "Préparez-vous !",
          ...base,
          roundInfo,
          estimatedDuration: PREPARE_COUNTDOWN,
        });
      }

      const duration = isTimed ? (ex.bilateral ? (ex.duration ?? 30) * 2 : (ex.duration ?? 30)) : null;
      const description = isTimed
        ? `${duration}s`
        : `${ex.reps} reps`;

      steps.push({
        id: `block-${blockIndex}-round-${round}-ex-${exIdx}-work`,
        phase: "work",
        timerMode: isTimed ? "countdown" : "manual",
        duration,
        exerciseName: ex.name,
        instructions: ex.instructions,
        repTarget: !isTimed ? ex.reps : undefined,
        ...base,
        roundInfo,
        isLastInBlock: isLastRound && isLastExInRound,
        isLastInRound: isLastExInRound,
        nextStepPreview: !isLastExInRound
          ? { exerciseName: block.exercises[exIdx + 1].name, description: block.exercises[exIdx + 1].mode === "timed" ? `${block.exercises[exIdx + 1].duration}s` : `${block.exercises[exIdx + 1].reps} reps` }
          : !isLastRound
            ? { exerciseName: block.exercises[0].name, description: `Round ${round + 2}/${block.rounds}` }
            : undefined,
        estimatedDuration: duration ?? DEFAULT_REST_FOR_REPS,
      });

      // Rest between exercises (not after last in round)
      if (!isLastExInRound) {
        steps.push({
          id: `block-${blockIndex}-round-${round}-ex-${exIdx}-rest`,
          phase: "rest",
          timerMode: "countdown",
          duration: block.restBetweenExercises,
          exerciseName: "Repos",
          instructions: `Prochain : ${block.exercises[exIdx + 1].name}`,
          ...base,
          roundInfo,
          estimatedDuration: block.restBetweenExercises,
        });
      }
    }

    // Rest between rounds (not after last round)
    if (!isLastRound) {
      steps.push({
        id: `block-${blockIndex}-round-${round}-rest`,
        phase: "rest",
        timerMode: "countdown",
        duration: block.restBetweenRounds,
        exerciseName: "Repos",
        instructions: `Fin du round ${round + 1} - Round ${round + 2} dans...`,
        ...base,
        roundInfo,
        isLastInRound: true,
        estimatedDuration: block.restBetweenRounds,
      });
    }
  }

  return steps;
}
