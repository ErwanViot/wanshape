import { describe, expect, it } from 'vitest';
import type { SupersetBlock } from '../../types/session.ts';
import { BLOCK_COLORS, DEFAULT_REST_FOR_REPS, TRANSITION_DURATION } from '../constants.ts';
import { expandSuperset } from '../interpreters/superset.ts';

function makeSupersetBlock(overrides?: Partial<SupersetBlock>): SupersetBlock {
  return {
    type: 'superset',
    name: 'Superset Haut du corps',
    sets: 3,
    restBetweenSets: 90,
    restBetweenPairs: 30,
    pairs: [
      {
        exercises: [
          { name: 'Developpe couche', reps: 10, instructions: 'Controler' },
          { name: 'Rowing', reps: 10, instructions: 'Tirer coudes' },
        ],
      },
      {
        exercises: [
          { name: 'Developpe epaules', reps: 8, instructions: 'Pousser' },
          { name: 'Tirage menton', reps: 12, instructions: 'Monter coudes' },
        ],
      },
    ],
    ...overrides,
  };
}

describe('expandSuperset', () => {
  it('starts with a transition step', () => {
    const block = makeSupersetBlock();
    const steps = expandSuperset(block, 0, 1);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].instructions).toBe('3 séries - 2 paires');
  });

  it('pluralizes "paire" correctly', () => {
    const singlePair = makeSupersetBlock({
      pairs: [{ exercises: [{ name: 'A', reps: 10, instructions: 'Go' }] }],
    });
    const steps = expandSuperset(singlePair, 0, 1);
    expect(steps[0].instructions).toBe('3 séries - 1 paire');
  });

  it('produces correct step count for simple case', () => {
    const block = makeSupersetBlock({
      sets: 2,
      pairs: [
        {
          exercises: [
            { name: 'A', reps: 10, instructions: 'Go' },
            { name: 'B', reps: 10, instructions: 'Go' },
          ],
        },
      ],
    });
    const steps = expandSuperset(block, 0, 1);

    // 1 transition
    // Set 1: A-work + B-work = 2
    // 1 rest-between-sets
    // Set 2: A-work + B-work = 2
    // Total: 1 + 2 + 1 + 2 = 6
    expect(steps).toHaveLength(6);
  });

  it('inserts rest between pairs when restBetweenPairs is defined', () => {
    const block = makeSupersetBlock({ sets: 1 });
    const steps = expandSuperset(block, 0, 1);

    // 1 transition
    // Pair 1: A-work + B-work = 2
    // 1 rest-between-pairs
    // Pair 2: C-work + D-work = 2
    // No rest-between-sets (only 1 set)
    // Total: 1 + 2 + 1 + 2 = 6
    expect(steps).toHaveLength(6);
    const restPair = steps.find((s) => s.id.includes('pair-0-rest'));
    expect(restPair).toBeDefined();
    expect(restPair!.duration).toBe(30);
  });

  it('does not insert rest between pairs when restBetweenPairs is undefined', () => {
    const block = makeSupersetBlock({
      sets: 1,
      restBetweenPairs: undefined,
    });
    const steps = expandSuperset(block, 0, 1);

    const pairRests = steps.filter((s) => s.id.includes('pair-') && s.id.endsWith('-rest'));
    expect(pairRests).toHaveLength(0);
  });

  it('inserts rest between sets', () => {
    const block = makeSupersetBlock({
      sets: 2,
      pairs: [
        {
          exercises: [{ name: 'A', reps: 10, instructions: 'Go' }],
        },
      ],
    });
    const steps = expandSuperset(block, 0, 1);

    const setRests = steps.filter((s) => s.id.endsWith('-rest') && s.id.includes('set-') && !s.id.includes('pair-'));
    expect(setRests).toHaveLength(1);
    expect(setRests[0].duration).toBe(90);
    expect(setRests[0].instructions).toContain('Série 2/2');
  });

  it('no rest after last set', () => {
    const block = makeSupersetBlock({ sets: 1 });
    const steps = expandSuperset(block, 0, 1);

    const setRests = steps.filter((s) => s.id.match(/set-\d+-rest$/));
    expect(setRests).toHaveLength(0);
  });

  it('work steps use manual timerMode with null duration', () => {
    const block = makeSupersetBlock();
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.timerMode).toBe('manual');
      expect(step.duration).toBeNull();
    }
  });

  it('sets repTarget correctly', () => {
    const block = makeSupersetBlock({
      sets: 1,
      pairs: [
        {
          exercises: [
            { name: 'A', reps: 8, instructions: 'Go' },
            { name: 'B', reps: 12, instructions: 'Go' },
          ],
        },
      ],
    });
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].repTarget).toBe(8);
    expect(workSteps[1].repTarget).toBe(12);
  });

  it('sets setInfo correctly', () => {
    const block = makeSupersetBlock({ sets: 3 });
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // First set exercises
    expect(workSteps[0].setInfo).toEqual({ current: 1, total: 3 });
    // Last set exercises
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.setInfo).toEqual({ current: 3, total: 3 });
  });

  it('marks only last exercise of last pair of last set as isLastInBlock', () => {
    const block = makeSupersetBlock();
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    const lastWork = workSteps[workSteps.length - 1];
    expect(lastWork.isLastInBlock).toBe(true);

    const otherWorks = workSteps.slice(0, -1);
    for (const step of otherWorks) {
      expect(step.isLastInBlock).toBeFalsy();
    }
  });

  it('provides nextStepPreview within pair', () => {
    const block = makeSupersetBlock({
      sets: 1,
      pairs: [
        {
          exercises: [
            { name: 'A', reps: 10, instructions: 'Go' },
            { name: 'B', reps: 8, instructions: 'Go' },
          ],
        },
      ],
    });
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].nextStepPreview).toBeDefined();
    expect(workSteps[0].nextStepPreview!.exerciseName).toBe('B');
    expect(workSteps[0].nextStepPreview!.description).toBe('8 reps');
  });

  it('provides nextStepPreview across pairs', () => {
    const block = makeSupersetBlock({ sets: 1 });
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // Last exercise of pair 0 should preview first exercise of pair 1
    expect(workSteps[1].nextStepPreview).toBeDefined();
    expect(workSteps[1].nextStepPreview!.exerciseName).toBe('Developpe epaules');
  });

  it('uses superset block color', () => {
    const block = makeSupersetBlock();
    const steps = expandSuperset(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.superset);
    }
  });

  it('sets estimatedDuration to DEFAULT_REST_FOR_REPS for work steps', () => {
    const block = makeSupersetBlock();
    const steps = expandSuperset(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    for (const step of workSteps) {
      expect(step.estimatedDuration).toBe(DEFAULT_REST_FOR_REPS);
    }
  });
});
