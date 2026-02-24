import type { Session, Block } from '../types/session.ts';
import type { AtomicStep } from '../types/player.ts';
import { expandWarmup } from './interpreters/warmup.ts';
import { expandClassic } from './interpreters/classic.ts';
import { expandCircuit } from './interpreters/circuit.ts';
import { expandHIIT } from './interpreters/hiit.ts';
import { expandTabata } from './interpreters/tabata.ts';
import { expandEMOM } from './interpreters/emom.ts';
import { expandAMRAP } from './interpreters/amrap.ts';
import { expandSuperset } from './interpreters/superset.ts';
import { expandPyramid } from './interpreters/pyramid.ts';
import { FIRST_TRANSITION_DURATION, INTER_BLOCK_REST, BLOCK_COLORS } from './constants.ts';

function expandBlock(block: Block, blockIndex: number, totalBlocks: number): AtomicStep[] {
  switch (block.type) {
    case "warmup":
    case "cooldown":
      return expandWarmup(block, blockIndex, totalBlocks);
    case "classic":
      return expandClassic(block, blockIndex, totalBlocks);
    case "circuit":
      return expandCircuit(block, blockIndex, totalBlocks);
    case "hiit":
      return expandHIIT(block, blockIndex, totalBlocks);
    case "tabata":
      return expandTabata(block, blockIndex, totalBlocks);
    case "emom":
      return expandEMOM(block, blockIndex, totalBlocks);
    case "amrap":
      return expandAMRAP(block, blockIndex, totalBlocks);
    case "superset":
      return expandSuperset(block, blockIndex, totalBlocks);
    case "pyramid":
      return expandPyramid(block, blockIndex, totalBlocks);
  }
}

function needsInterBlockRest(current: Block, next: Block): boolean {
  return current.type !== 'warmup' && current.type !== 'cooldown' && next.type !== 'cooldown';
}

export function compileSession(session: Session): AtomicStep[] {
  const totalBlocks = session.blocks.length;
  const allSteps: AtomicStep[] = [];

  for (let i = 0; i < session.blocks.length; i++) {
    const blockSteps = expandBlock(session.blocks[i], i, totalBlocks);
    allSteps.push(...blockSteps);

    // Insert inter-block rest between active blocks
    const nextBlock = session.blocks[i + 1];
    if (nextBlock && needsInterBlockRest(session.blocks[i], nextBlock)) {
      allSteps.push({
        id: `inter-block-rest-${i}`,
        phase: "rest",
        timerMode: "countdown",
        duration: INTER_BLOCK_REST,
        exerciseName: "Repos entre blocs",
        instructions: `Prochain bloc : ${nextBlock.name}`,
        blockName: session.blocks[i].name,
        blockType: session.blocks[i].type,
        blockColor: BLOCK_COLORS[session.blocks[i].type],
        blockIndex: i,
        totalBlocks,
        estimatedDuration: INTER_BLOCK_REST,
      });
    }
  }

  // Inject nextStepPreview for the last step of each block (cross-block preview)
  for (let i = 0; i < allSteps.length; i++) {
    if (allSteps[i].isLastInBlock && !allSteps[i].nextStepPreview && i < allSteps.length - 1) {
      const next = allSteps[i + 1];
      if (next.phase === "transition" || next.phase === "rest") {
        allSteps[i].nextStepPreview = {
          exerciseName: next.exerciseName,
          description: next.instructions,
        };
      }
    }
  }

  // Patch first transition step to 8s for health disclaimer
  if (allSteps.length > 0 && allSteps[0].phase === 'transition') {
    allSteps[0].duration = FIRST_TRANSITION_DURATION;
    allSteps[0].estimatedDuration = FIRST_TRANSITION_DURATION;
  }

  return allSteps;
}

export function getTotalEstimatedDuration(steps: AtomicStep[]): number {
  return steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
}
