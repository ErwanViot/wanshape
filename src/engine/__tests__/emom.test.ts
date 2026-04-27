import { describe, expect, it } from 'vitest';
import type { EMOMBlock } from '../../types/session.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';
import { expandEMOM } from '../interpreters/emom.ts';

function makeEMOMBlock(overrides?: Partial<EMOMBlock>): EMOMBlock {
  return {
    type: 'emom',
    name: 'EMOM 10',
    minutes: 10,
    exercises: [
      { name: 'Kettlebell swings', reps: 15, instructions: 'Hip hinge' },
      { name: 'Push-ups', reps: 10, instructions: 'Full range' },
    ],
    ...overrides,
  };
}

describe('expandEMOM', () => {
  it('starts with a transition step', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toContain('10 minutes');
    expect(steps[0].instructions).toContain('15 Kettlebell swings');
  });

  it('produces one work step per minute', () => {
    const block = makeEMOMBlock({ minutes: 5 });
    const steps = expandEMOM(block, 0, 1);

    // 1 transition + 5 work steps
    expect(steps).toHaveLength(6);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps).toHaveLength(5);
  });

  it('uses emom timerMode for work steps', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.timerMode).toBe('emom');
    }
  });

  it('defaults intervalDuration to 60 seconds', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.duration).toBe(60);
    }
  });

  it('uses custom intervalDuration when provided', () => {
    const block = makeEMOMBlock({ intervalDuration: 90 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.duration).toBe(90);
    }
  });

  it('sets exerciseName with minute counter', () => {
    const block = makeEMOMBlock({ minutes: 3 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].exerciseName).toBe('Minute 1/3');
    expect(workSteps[1].exerciseName).toBe('Minute 2/3');
    expect(workSteps[2].exerciseName).toBe('Minute 3/3');
  });

  it('includes exercises summary in instructions', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].instructions).toBe('15 Kettlebell swings + 10 Push-ups');
  });

  it('populates emomExercises with name and reps', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.emomExercises).toEqual([
        { name: 'Kettlebell swings', reps: 15 },
        { name: 'Push-ups', reps: 10 },
      ]);
    }
  });

  it('sets roundInfo correctly', () => {
    const block = makeEMOMBlock({ minutes: 3 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].roundInfo).toEqual({ current: 1, total: 3 });
    expect(workSteps[2].roundInfo).toEqual({ current: 3, total: 3 });
  });

  it('marks only last minute as isLastInBlock', () => {
    const block = makeEMOMBlock({ minutes: 3 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].isLastInBlock).toBeFalsy();
    expect(workSteps[1].isLastInBlock).toBeFalsy();
    expect(workSteps[2].isLastInBlock).toBe(true);
  });

  it('provides nextStepPreview for non-last minutes', () => {
    const block = makeEMOMBlock({ minutes: 2 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Minute 2/2');
    expect(workSteps[1].nextStepPreview).toBeUndefined();
  });

  it('uses emom block color', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.emom);
    }
  });

  it('sets estimatedDuration equal to intervalDuration', () => {
    const block = makeEMOMBlock({ intervalDuration: 45 });
    const steps = expandEMOM(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.estimatedDuration).toBe(45);
    }
  });

  it('has no rest steps (continuous flow)', () => {
    const block = makeEMOMBlock();
    const steps = expandEMOM(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    expect(restSteps).toHaveLength(0);
  });
});
