import { describe, expect, it } from 'vitest';
import type { Session } from '../../types/session.ts';
import { FIRST_TRANSITION_DURATION, INTER_BLOCK_REST, TRANSITION_DURATION } from '../constants.ts';
import { compileSession } from '../interpreter.ts';

function makeSession(blocks: Session['blocks']): Session {
  return {
    date: '11032026',
    title: 'Test Session',
    description: 'Session de test',
    estimatedDuration: 30,
    focus: ['Full body'],
    blocks,
  };
}

describe('compileSession', () => {
  it('produces non-empty steps for a session with blocks', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'Rotation epaules', duration: 30, instructions: 'Grandes rotations' }],
      },
    ]);
    const steps = compileSession(session);

    expect(steps.length).toBeGreaterThan(0);
  });

  it('handles empty blocks array', () => {
    const session = makeSession([]);
    const steps = compileSession(session);

    expect(steps).toHaveLength(0);
  });

  it('warmup-only session produces warmup steps', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [
          { name: 'A', duration: 20, instructions: 'Go' },
          { name: 'B', duration: 30, instructions: 'Go' },
        ],
      },
    ]);
    const steps = compileSession(session);

    for (const step of steps) {
      expect(step.blockType).toBe('warmup');
    }
  });

  it('multi-block session produces steps in correct block order', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [{ name: 'C', duration: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const blockTypes = steps.map((s) => s.blockType);
    const firstClassicIdx = blockTypes.indexOf('classic');
    const lastWarmupIdx = blockTypes.lastIndexOf('warmup');
    const firstCooldownIdx = blockTypes.indexOf('cooldown');

    expect(lastWarmupIdx).toBeLessThan(firstClassicIdx);
    expect(firstClassicIdx).toBeLessThan(firstCooldownIdx);
  });

  it('tags each step with correct blockIndex', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const warmupSteps = steps.filter((s) => s.blockType === 'warmup');
    const classicSteps = steps.filter((s) => s.blockType === 'classic');

    for (const step of warmupSteps) {
      expect(step.blockIndex).toBe(0);
    }
    for (const step of classicSteps) {
      expect(step.blockIndex).toBe(1);
    }
  });

  it('inserts inter-block rest between active blocks', () => {
    const session = makeSession([
      {
        type: 'classic',
        name: 'Block A',
        restBetweenExercises: 30,
        exercises: [{ name: 'A', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'circuit',
        name: 'Block B',
        rounds: 1,
        restBetweenExercises: 15,
        restBetweenRounds: 60,
        exercises: [{ name: 'B', mode: 'reps', reps: 10, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const interBlockRest = steps.find((s) => s.id.startsWith('inter-block-rest'));
    expect(interBlockRest).toBeDefined();
    expect(interBlockRest!.duration).toBe(INTER_BLOCK_REST);
    expect(interBlockRest!.exerciseName).toBe('Repos entre blocs');
    expect(interBlockRest!.instructions).toContain('Block B');
  });

  it('does not insert inter-block rest after warmup', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const interBlockRests = steps.filter((s) => s.id.startsWith('inter-block-rest'));
    expect(interBlockRests).toHaveLength(0);
  });

  it('does not insert inter-block rest before cooldown', () => {
    const session = makeSession([
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'A', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [{ name: 'B', duration: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const interBlockRests = steps.filter((s) => s.id.startsWith('inter-block-rest'));
    expect(interBlockRests).toHaveLength(0);
  });

  it('patches first transition step duration to FIRST_TRANSITION_DURATION', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(FIRST_TRANSITION_DURATION);
    expect(steps[0].estimatedDuration).toBe(FIRST_TRANSITION_DURATION);
  });

  it('does not patch non-first transition steps', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    const transitions = steps.filter((s) => s.phase === 'transition');
    // Second transition should keep original TRANSITION_DURATION
    expect(transitions[1].duration).toBe(TRANSITION_DURATION);
  });

  it('sets totalBlocks correctly on all steps', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renforcement',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [{ name: 'C', duration: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    for (const step of steps) {
      expect(step.totalBlocks).toBe(3);
    }
  });

  it('injects nextStepPreview for last step of block when followed by rest/transition', () => {
    const session = makeSession([
      {
        type: 'classic',
        name: 'Block A',
        restBetweenExercises: 30,
        exercises: [{ name: 'A', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Block B',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    // The last step of Block A (isLastInBlock=true) should get nextStepPreview
    const lastInBlockA = steps.find((s) => s.isLastInBlock && s.blockIndex === 0);
    expect(lastInBlockA).toBeDefined();
    // Next step after it should be inter-block-rest or transition
    const lastIdx = steps.indexOf(lastInBlockA!);
    const nextStep = steps[lastIdx + 1];
    if (nextStep.phase === 'rest' || nextStep.phase === 'transition') {
      expect(lastInBlockA!.nextStepPreview).toBeDefined();
    }
  });

  it('handles session with all block types', () => {
    const session = makeSession([
      {
        type: 'warmup',
        name: 'Echauffement',
        exercises: [{ name: 'A', duration: 20, instructions: 'Go' }],
      },
      {
        type: 'classic',
        name: 'Renfo',
        restBetweenExercises: 30,
        exercises: [{ name: 'B', sets: 1, reps: 10, restBetweenSets: 30, instructions: 'Go' }],
      },
      {
        type: 'hiit',
        name: 'HIIT',
        rounds: 1,
        work: 20,
        rest: 10,
        exercises: [{ name: 'C', instructions: 'Go' }],
      },
      {
        type: 'cooldown',
        name: 'Retour au calme',
        exercises: [{ name: 'D', duration: 30, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    expect(steps.length).toBeGreaterThan(0);

    const blockTypes = [...new Set(steps.map((s) => s.blockType))];
    expect(blockTypes).toContain('warmup');
    expect(blockTypes).toContain('classic');
    expect(blockTypes).toContain('hiit');
    expect(blockTypes).toContain('cooldown');
  });

  it('single exercise block produces steps', () => {
    const session = makeSession([
      {
        type: 'amrap',
        name: 'AMRAP',
        duration: 300,
        exercises: [{ name: 'Burpees', reps: 5, instructions: 'Go' }],
      },
    ]);
    const steps = compileSession(session);

    expect(steps).toHaveLength(2); // transition + work
    expect(steps[0].phase).toBe('transition');
    expect(steps[1].phase).toBe('work');
  });
});
