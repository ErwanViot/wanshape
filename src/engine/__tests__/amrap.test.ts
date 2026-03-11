import { describe, expect, it } from 'vitest';
import type { AMRAPBlock } from '../../types/session.ts';
import { expandAMRAP } from '../interpreters/amrap.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';

function makeAMRAPBlock(overrides?: Partial<AMRAPBlock>): AMRAPBlock {
  return {
    type: 'amrap',
    name: 'AMRAP 12',
    duration: 720, // 12 minutes in seconds
    exercises: [
      { name: 'Pull-ups', reps: 5, instructions: 'Strict' },
      { name: 'Push-ups', reps: 10, instructions: 'Full range' },
      { name: 'Air squats', reps: 15, instructions: 'Below parallel' },
    ],
    ...overrides,
  };
}

describe('expandAMRAP', () => {
  it('produces exactly 2 steps: transition + work', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps).toHaveLength(2);
    expect(steps[0].phase).toBe('transition');
    expect(steps[1].phase).toBe('work');
  });

  it('transition step shows duration in minutes', () => {
    const block = makeAMRAPBlock({ duration: 600 }); // 10 min
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[0].instructions).toBe('10 min - Max de rounds');
  });

  it('work step uses amrap timerMode', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[1].timerMode).toBe('amrap');
    expect(steps[1].duration).toBe(720);
  });

  it('work step includes exercises summary in instructions', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[1].instructions).toBe('5 Pull-ups + 10 Push-ups + 15 Air squats');
  });

  it('populates amrapExercises with name and reps', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[1].amrapExercises).toEqual([
      { name: 'Pull-ups', reps: 5 },
      { name: 'Push-ups', reps: 10 },
      { name: 'Air squats', reps: 15 },
    ]);
  });

  it('marks work step as isLastInBlock', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[1].isLastInBlock).toBe(true);
  });

  it('sets estimatedDuration equal to total duration', () => {
    const block = makeAMRAPBlock({ duration: 480 });
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[1].estimatedDuration).toBe(480);
  });

  it('uses amrap block color', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.amrap);
    }
  });

  it('tags steps with correct blockIndex and totalBlocks', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 3, 5);

    for (const step of steps) {
      expect(step.blockIndex).toBe(3);
      expect(step.totalBlocks).toBe(5);
    }
  });

  it('transition step has correct duration', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].timerMode).toBe('countdown');
  });

  it('has no rest steps', () => {
    const block = makeAMRAPBlock();
    const steps = expandAMRAP(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    expect(restSteps).toHaveLength(0);
  });
});
