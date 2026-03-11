import { describe, expect, it } from 'vitest';
import type { HIITBlock } from '../../types/session.ts';
import { expandHIIT } from '../interpreters/hiit.ts';
import { BLOCK_COLORS, PREPARE_COUNTDOWN, TRANSITION_DURATION } from '../constants.ts';

function makeHIITBlock(overrides?: Partial<HIITBlock>): HIITBlock {
  return {
    type: 'hiit',
    name: 'HIIT Cardio',
    rounds: 3,
    work: 30,
    rest: 15,
    exercises: [
      { name: 'Burpees', instructions: 'Full burpees' },
      { name: 'Jump squats', instructions: 'Explosif' },
    ],
    ...overrides,
  };
}

describe('expandHIIT', () => {
  it('starts with transition then prepare step', () => {
    const block = makeHIITBlock();
    const steps = expandHIIT(block, 0, 1);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toBe('3 rounds - 30s/15s');

    expect(steps[1].phase).toBe('prepare');
    expect(steps[1].duration).toBe(PREPARE_COUNTDOWN);
    expect(steps[1].exerciseName).toBe('Burpees');
  });

  it('produces correct step count', () => {
    const block = makeHIITBlock({ rounds: 2 });
    const steps = expandHIIT(block, 0, 1);

    // totalIntervals = 2 rounds * 2 exercises = 4
    // 1 transition + 1 prepare
    // 4 work + 3 rest (not after last interval)
    // Total: 1 + 1 + 4 + 3 = 9
    expect(steps).toHaveLength(9);
  });

  it('alternates work and rest phases', () => {
    const block = makeHIITBlock({
      rounds: 1,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandHIIT(block, 0, 1);

    // transition, prepare, work (only interval, no rest after last)
    expect(steps).toHaveLength(3);
    expect(steps[2].phase).toBe('work');
  });

  it('work steps use countdown with correct work duration', () => {
    const block = makeHIITBlock({ work: 40 });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.timerMode).toBe('countdown');
      expect(step.duration).toBe(40);
    }
  });

  it('rest steps use countdown with correct rest duration', () => {
    const block = makeHIITBlock({ rest: 20 });
    const steps = expandHIIT(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    for (const step of restSteps) {
      expect(step.timerMode).toBe('countdown');
      expect(step.duration).toBe(20);
    }
  });

  it('no rest after last interval', () => {
    const block = makeHIITBlock();
    const steps = expandHIIT(block, 0, 1);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('work');
    expect(lastStep.isLastInBlock).toBe(true);
  });

  it('sets intervalInfo correctly', () => {
    const block = makeHIITBlock({
      rounds: 2,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].intervalInfo).toEqual({ current: 1, total: 2 });
    expect(workSteps[1].intervalInfo).toEqual({ current: 2, total: 2 });
  });

  it('sets roundInfo correctly', () => {
    const block = makeHIITBlock({ rounds: 2 });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // Round 1: exercises 0, 1; Round 2: exercises 0, 1
    expect(workSteps[0].roundInfo).toEqual({ current: 1, total: 2 });
    expect(workSteps[1].roundInfo).toEqual({ current: 1, total: 2 });
    expect(workSteps[2].roundInfo).toEqual({ current: 2, total: 2 });
    expect(workSteps[3].roundInfo).toEqual({ current: 2, total: 2 });
  });

  it('provides nextStepPreview to next exercise', () => {
    const block = makeHIITBlock({ rounds: 1 });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Jump squats');
    expect(workSteps[0].nextStepPreview!.description).toBe('30s');
  });

  it('provides nextStepPreview across rounds', () => {
    const block = makeHIITBlock({
      rounds: 2,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // First round last exercise should preview first exercise of next round
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Burpees');
  });

  it('no nextStepPreview on last interval', () => {
    const block = makeHIITBlock();
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.nextStepPreview).toBeUndefined();
  });

  it('uses hiit block color', () => {
    const block = makeHIITBlock();
    const steps = expandHIIT(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.hiit);
    }
  });

  it('sets estimatedDuration equal to work duration for work steps', () => {
    const block = makeHIITBlock({ work: 25 });
    const steps = expandHIIT(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.estimatedDuration).toBe(25);
    }
  });
});
