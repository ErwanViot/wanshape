import { describe, expect, it } from 'vitest';
import type { CircuitBlock } from '../../types/session.ts';
import { expandCircuit } from '../interpreters/circuit.ts';
import { BLOCK_COLORS, DEFAULT_REST_FOR_REPS, PREPARE_COUNTDOWN, TRANSITION_DURATION } from '../constants.ts';

function makeCircuitBlock(overrides?: Partial<CircuitBlock>): CircuitBlock {
  return {
    type: 'circuit',
    name: 'Circuit Training',
    rounds: 3,
    restBetweenExercises: 15,
    restBetweenRounds: 60,
    exercises: [
      { name: 'Burpees', mode: 'timed', duration: 30, instructions: 'Full burpees' },
      { name: 'Mountain climbers', mode: 'timed', duration: 20, instructions: 'Vite' },
    ],
    ...overrides,
  };
}

describe('expandCircuit', () => {
  it('starts with a transition step', () => {
    const block = makeCircuitBlock();
    const steps = expandCircuit(block, 0, 3);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toBe('3 rounds - 2 exercices');
  });

  it('adds prepare countdown when first exercise is timed', () => {
    const block = makeCircuitBlock();
    const steps = expandCircuit(block, 0, 1);

    expect(steps[1].phase).toBe('prepare');
    expect(steps[1].duration).toBe(PREPARE_COUNTDOWN);
    expect(steps[1].instructions).toBe('Préparez-vous !');
  });

  it('does not add prepare countdown when first exercise is reps-based', () => {
    const block = makeCircuitBlock({
      exercises: [
        { name: 'Squats', mode: 'reps', reps: 15, instructions: 'Go' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    expect(steps[1].phase).not.toBe('prepare');
  });

  it('produces correct step count for timed exercises', () => {
    const block = makeCircuitBlock({
      rounds: 2,
      exercises: [
        { name: 'Burpees', mode: 'timed', duration: 30, instructions: 'Go' },
        { name: 'Plank', mode: 'timed', duration: 20, instructions: 'Hold' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    // 1 transition + 1 prepare
    // Round 1: work + rest + work = 3
    // 1 rest-between-rounds
    // Round 2: work + rest + work = 3
    // Total: 1 + 1 + 3 + 1 + 3 = 9
    expect(steps).toHaveLength(9);
  });

  it('uses countdown for timed exercises and manual for reps', () => {
    const block = makeCircuitBlock({
      rounds: 1,
      exercises: [
        { name: 'Burpees', mode: 'timed', duration: 30, instructions: 'Go' },
        { name: 'Squats', mode: 'reps', reps: 15, instructions: 'Deep' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].timerMode).toBe('countdown');
    expect(workSteps[0].duration).toBe(30);
    expect(workSteps[1].timerMode).toBe('manual');
    expect(workSteps[1].duration).toBeNull();
  });

  it('doubles duration for bilateral timed exercises', () => {
    const block = makeCircuitBlock({
      rounds: 1,
      exercises: [
        { name: 'Fentes', mode: 'timed', duration: 20, bilateral: true, instructions: 'Alterner' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    const workStep = steps.find((s) => s.phase === 'work');
    expect(workStep!.duration).toBe(40);
  });

  it('sets repTarget for reps-mode exercises', () => {
    const block = makeCircuitBlock({
      rounds: 1,
      exercises: [
        { name: 'Squats', mode: 'reps', reps: 15, instructions: 'Deep' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    const workStep = steps.find((s) => s.phase === 'work');
    expect(workStep!.repTarget).toBe(15);
  });

  it('rest between exercises has correct duration', () => {
    const block = makeCircuitBlock({ rounds: 1 });
    const steps = expandCircuit(block, 0, 1);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    if (restSteps.length > 0) {
      expect(restSteps[0].duration).toBe(15);
    }
  });

  it('rest between rounds has correct duration', () => {
    const block = makeCircuitBlock({ rounds: 2 });
    const steps = expandCircuit(block, 0, 1);

    const roundRestSteps = steps.filter((s) => s.id.includes('-round-') && s.id.endsWith('-rest') && !s.id.includes('-ex-'));
    expect(roundRestSteps).toHaveLength(1);
    expect(roundRestSteps[0].duration).toBe(60);
    expect(roundRestSteps[0].instructions).toContain('Round 2');
  });

  it('no rest after last exercise in last round', () => {
    const block = makeCircuitBlock({ rounds: 1 });
    const steps = expandCircuit(block, 0, 1);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('work');
  });

  it('sets roundInfo correctly', () => {
    const block = makeCircuitBlock({ rounds: 2 });
    const steps = expandCircuit(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].roundInfo).toEqual({ current: 1, total: 2 });
    expect(workSteps[workSteps.length - 1].roundInfo).toEqual({ current: 2, total: 2 });
  });

  it('marks last exercise of last round as isLastInBlock', () => {
    const block = makeCircuitBlock();
    const steps = expandCircuit(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.isLastInBlock).toBe(true);
  });

  it('provides nextStepPreview within round', () => {
    const block = makeCircuitBlock({ rounds: 1 });
    const steps = expandCircuit(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('Mountain climbers');
  });

  it('provides nextStepPreview across rounds', () => {
    const block = makeCircuitBlock({
      rounds: 2,
      exercises: [
        { name: 'Burpees', mode: 'timed', duration: 30, instructions: 'Go' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // First round last exercise should preview next round
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.description).toContain('Round 2/2');
  });

  it('uses circuit block color', () => {
    const block = makeCircuitBlock();
    const steps = expandCircuit(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.circuit);
    }
  });

  it('sets estimatedDuration for reps-mode to DEFAULT_REST_FOR_REPS', () => {
    const block = makeCircuitBlock({
      rounds: 1,
      exercises: [
        { name: 'Squats', mode: 'reps', reps: 15, instructions: 'Deep' },
      ],
    });
    const steps = expandCircuit(block, 0, 1);

    const workStep = steps.find((s) => s.phase === 'work');
    expect(workStep!.estimatedDuration).toBe(DEFAULT_REST_FOR_REPS);
  });
});
