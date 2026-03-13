import { describe, expect, it } from 'vitest';
import type { PyramidBlock } from '../../types/session.ts';
import { expandPyramid } from '../interpreters/pyramid.ts';
import { BLOCK_COLORS, DEFAULT_REST_FOR_REPS, TRANSITION_DURATION } from '../constants.ts';

function makePyramidBlock(overrides?: Partial<PyramidBlock>): PyramidBlock {
  return {
    type: 'pyramid',
    name: 'Pyramide Force',
    pattern: [6, 8, 10, 8, 6],
    restBetweenSets: 30,
    exercises: [
      { name: 'Squat', instructions: 'Full depth' },
      { name: 'Developpe couche', instructions: 'Controler' },
    ],
    ...overrides,
  };
}

describe('expandPyramid', () => {
  it('starts with a transition step', () => {
    const block = makePyramidBlock();
    const steps = expandPyramid(block, 0, 1);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toBe('Pyramide : 6-8-10-8-6');
  });

  it('produces correct step count for single exercise', () => {
    const block = makePyramidBlock({
      pattern: [6, 8, 10],
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    // 1 transition
    // 3 work + 2 rest-between-levels (not after last)
    // Total: 1 + 3 + 2 = 6
    expect(steps).toHaveLength(6);
  });

  it('produces correct step count for two exercises', () => {
    const block = makePyramidBlock({
      pattern: [6, 8, 10],
      exercises: [
        { name: 'Squat', instructions: 'Go' },
        { name: 'Bench', instructions: 'Go' },
      ],
    });
    const steps = expandPyramid(block, 0, 1);

    // 1 transition
    // Exercise 1: 3 work + 2 rest-between-levels = 5
    // 1 rest-between-exercises
    // Exercise 2: 3 work + 2 rest-between-levels = 5
    // Total: 1 + 5 + 1 + 5 = 12
    expect(steps).toHaveLength(12);
  });

  it('work steps use manual timerMode with null duration', () => {
    const block = makePyramidBlock();
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.timerMode).toBe('manual');
      expect(step.duration).toBeNull();
    }
  });

  it('sets repTarget from pattern values', () => {
    const block = makePyramidBlock({
      pattern: [4, 8, 12],
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].repTarget).toBe(4);
    expect(workSteps[1].repTarget).toBe(8);
    expect(workSteps[2].repTarget).toBe(12);
  });

  it('rest between levels uses restBetweenSets', () => {
    const block = makePyramidBlock({
      pattern: [6, 10],
      restBetweenSets: 45,
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    expect(restSteps).toHaveLength(1);
    expect(restSteps[0].duration).toBe(45);
    expect(restSteps[0].instructions).toContain('10 reps');
  });

  it('rest between exercises defaults to restBetweenSets * 2', () => {
    const block = makePyramidBlock({
      pattern: [6],
      restBetweenSets: 30,
    });
    const steps = expandPyramid(block, 0, 1);

    const restBetweenEx = steps.find((s) => s.id.includes('rest-between'));
    expect(restBetweenEx).toBeDefined();
    expect(restBetweenEx!.duration).toBe(60); // 30 * 2
  });

  it('uses custom restBetweenExercises when provided', () => {
    const block = makePyramidBlock({
      pattern: [6],
      restBetweenSets: 30,
      restBetweenExercises: 120,
    });
    const steps = expandPyramid(block, 0, 1);

    const restBetweenEx = steps.find((s) => s.id.includes('rest-between'));
    expect(restBetweenEx).toBeDefined();
    expect(restBetweenEx!.duration).toBe(120);
  });

  it('no rest after last level of last exercise', () => {
    const block = makePyramidBlock({
      pattern: [6, 8],
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('work');
  });

  it('sets setInfo with pattern index', () => {
    const block = makePyramidBlock({
      pattern: [4, 8, 12],
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].setInfo).toEqual({ current: 1, total: 3 });
    expect(workSteps[1].setInfo).toEqual({ current: 2, total: 3 });
    expect(workSteps[2].setInfo).toEqual({ current: 3, total: 3 });
  });

  it('sets exerciseInfo correctly', () => {
    const block = makePyramidBlock({
      pattern: [6],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].exerciseInfo).toEqual({ current: 1, total: 2 });
    expect(workSteps[1].exerciseInfo).toEqual({ current: 2, total: 2 });
  });

  it('marks only last level of last exercise as isLastInBlock', () => {
    const block = makePyramidBlock({
      pattern: [6, 8],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.isLastInBlock).toBe(true);

    const otherWorks = workSteps.slice(0, -1);
    for (const step of otherWorks) {
      expect(step.isLastInBlock).toBeFalsy();
    }
  });

  it('provides nextStepPreview within same exercise', () => {
    const block = makePyramidBlock({
      pattern: [6, 10],
      exercises: [{ name: 'Squat', instructions: 'Go' }],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Squat');
    expect(workSteps[0].nextStepPreview!.description).toBe('10 reps');
  });

  it('provides nextStepPreview to next exercise at last level', () => {
    const block = makePyramidBlock({
      pattern: [6],
    });
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // Squat level 1 (only level) → should preview Developpe couche
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Developpe couche');
    expect(workSteps[0].nextStepPreview!.description).toBe('6 reps');
  });

  it('no nextStepPreview on very last step', () => {
    const block = makePyramidBlock();
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.nextStepPreview).toBeUndefined();
  });

  it('uses pyramid block color', () => {
    const block = makePyramidBlock();
    const steps = expandPyramid(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.pyramid);
    }
  });

  it('sets estimatedDuration to DEFAULT_REST_FOR_REPS for work steps', () => {
    const block = makePyramidBlock();
    const steps = expandPyramid(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.estimatedDuration).toBe(DEFAULT_REST_FOR_REPS);
    }
  });

  it('rest-between-exercises instruction mentions next exercise', () => {
    const block = makePyramidBlock({
      pattern: [6],
    });
    const steps = expandPyramid(block, 0, 1);

    const restBetweenEx = steps.find((s) => s.id.includes('rest-between'));
    expect(restBetweenEx!.instructions).toContain('Developpe couche');
  });
});
