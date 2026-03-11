import { describe, expect, it } from 'vitest';
import type { ClassicBlock } from '../../types/session.ts';
import { expandClassic } from '../interpreters/classic.ts';
import { BLOCK_COLORS, DEFAULT_REST_FOR_REPS, TRANSITION_DURATION } from '../constants.ts';

function makeClassicBlock(overrides?: Partial<ClassicBlock>): ClassicBlock {
  return {
    type: 'classic',
    name: 'Renforcement',
    restBetweenExercises: 60,
    exercises: [
      { name: 'Squat', sets: 3, reps: 12, restBetweenSets: 45, instructions: 'Descendre bas' },
      { name: 'Pompes', sets: 2, reps: 10, restBetweenSets: 30, instructions: 'Gainé' },
    ],
    ...overrides,
  };
}

describe('expandClassic', () => {
  it('starts with a transition step', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 3);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toBe('2 exercices');
  });

  it('produces correct step count for one exercise with multiple sets', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 3, reps: 12, restBetweenSets: 45, instructions: 'Go' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    // 1 transition + 3 work + 2 rest (between sets, not after last) = 6
    expect(steps).toHaveLength(6);
  });

  it('produces correct step count for two exercises', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    // 1 transition
    // Squat: 3 work + 2 rest-between-sets = 5
    // 1 rest-between-exercises
    // Pompes: 2 work + 1 rest-between-sets = 3
    // Total: 1 + 5 + 1 + 3 = 10
    expect(steps).toHaveLength(10);
  });

  it('work steps use manual timerMode with null duration', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.timerMode).toBe('manual');
      expect(step.duration).toBeNull();
    }
  });

  it('rest steps use countdown timerMode with correct duration', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 2, reps: 10, restBetweenSets: 45, instructions: 'Go' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    expect(restSteps).toHaveLength(1);
    expect(restSteps[0].timerMode).toBe('countdown');
    expect(restSteps[0].duration).toBe(45);
  });

  it('no rest after last set of last exercise', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 2, reps: 10, restBetweenSets: 45, instructions: 'Go' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('work');
  });

  it('inserts rest between exercises with correct duration', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    // After Squat (3 sets), there should be a rest step before Pompes
    // Steps: transition, squat-w, squat-r, squat-w, squat-r, squat-w, rest-between-ex, pompes-w, pompes-r, pompes-w
    const restBetweenEx = steps.find((s) => s.id.includes('transition-rest'));
    expect(restBetweenEx).toBeDefined();
    expect(restBetweenEx!.duration).toBe(60);
    expect(restBetweenEx!.instructions).toContain('Pompes');
  });

  it('sets repTarget correctly including max reps', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Pull-ups', sets: 2, reps: 'max', restBetweenSets: 60, instructions: 'Max reps' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.repTarget).toBe('max');
    }
  });

  it('sets tempo when provided', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 1, reps: 10, restBetweenSets: 30, tempo: '3-1-2', instructions: 'Tempo' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const workStep = steps.find((s) => s.phase === 'work');
    expect(workStep!.tempo).toBe('3-1-2');
  });

  it('sets setInfo with current and total', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 3, reps: 12, restBetweenSets: 45, instructions: 'Go' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].setInfo).toEqual({ current: 1, total: 3 });
    expect(workSteps[1].setInfo).toEqual({ current: 2, total: 3 });
    expect(workSteps[2].setInfo).toEqual({ current: 3, total: 3 });
  });

  it('marks only last set of last exercise as isLastInBlock', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    const otherWorks = workSteps.slice(0, -1);

    expect(lastWork.isLastInBlock).toBe(true);
    for (const step of otherWorks) {
      expect(step.isLastInBlock).toBeFalsy();
    }
  });

  it('provides nextStepPreview between sets', () => {
    const block = makeClassicBlock({
      exercises: [
        { name: 'Squat', sets: 2, reps: 12, restBetweenSets: 45, instructions: 'Go' },
      ],
    });
    const steps = expandClassic(block, 0, 1);

    const firstWork = steps.find((s) => s.phase === 'work');
    expect(firstWork!.nextStepPreview).toBeDefined();
    expect(firstWork!.nextStepPreview!.exerciseName).toBe('Squat');
    expect(firstWork!.nextStepPreview!.description).toContain('2/2');
  });

  it('provides nextStepPreview to next exercise after last set', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    // The last work step of Squat (set 3) should preview Pompes
    // work steps: squat s1, squat s2, squat s3, pompes s1, pompes s2
    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastSquatWork = workSteps[2]; // 3rd set of squat
    expect(lastSquatWork.nextStepPreview).toBeDefined();
    expect(lastSquatWork.nextStepPreview!.exerciseName).toBe('Pompes');
  });

  it('sets estimatedDuration to DEFAULT_REST_FOR_REPS for work steps', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.estimatedDuration).toBe(DEFAULT_REST_FOR_REPS);
    }
  });

  it('uses classic block color', () => {
    const block = makeClassicBlock();
    const steps = expandClassic(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.classic);
    }
  });
});
