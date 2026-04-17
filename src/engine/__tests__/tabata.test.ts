import { describe, expect, it } from 'vitest';
import type { TabataBlock } from '../../types/session.ts';
import { BLOCK_COLORS, TABATA_DEFAULTS, TRANSITION_DURATION } from '../constants.ts';
import { expandTabata } from '../interpreters/tabata.ts';

function makeTabataBlock(overrides?: Partial<TabataBlock>): TabataBlock {
  return {
    type: 'tabata',
    name: 'Tabata',
    exercises: [
      { name: 'Burpees', instructions: 'Full burpees' },
      { name: 'Mountain climbers', instructions: 'Vite' },
    ],
    ...overrides,
  };
}

describe('expandTabata', () => {
  it('starts with a transition step', () => {
    const block = makeTabataBlock();
    const steps = expandTabata(block, 0, 1);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
  });

  it('uses default values when not specified', () => {
    const block = makeTabataBlock();
    const steps = expandTabata(block, 0, 1);

    // Default: 1 set, 8 rounds, 20s work, 10s rest
    const workSteps = steps.filter((s) => s.phase === 'work');
    const restSteps = steps.filter((s) => s.phase === 'rest');

    // 1 set * 8 rounds * 2 exercises = 16 work steps
    expect(workSteps).toHaveLength(16);

    // rest after every work except last = 15 rest steps
    expect(restSteps).toHaveLength(15);

    expect(workSteps[0].duration).toBe(TABATA_DEFAULTS.work);
    expect(restSteps[0].duration).toBe(TABATA_DEFAULTS.rest);
  });

  it('uses custom values when specified', () => {
    const block = makeTabataBlock({ sets: 2, rounds: 4, work: 30, rest: 15, restBetweenSets: 90 });
    const steps = expandTabata(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].duration).toBe(30);

    const restSteps = steps.filter((s) => s.phase === 'rest');
    // Regular rests should be 15s
    const regularRests = restSteps.filter((s) => s.duration === 15);
    expect(regularRests.length).toBeGreaterThan(0);
  });

  it('produces correct step count for single set single exercise', () => {
    const block = makeTabataBlock({
      sets: 1,
      rounds: 4,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandTabata(block, 0, 1);

    // 1 transition + 4 work + 3 rest = 8
    expect(steps).toHaveLength(8);
  });

  it('no rest after very last exercise', () => {
    const block = makeTabataBlock({
      sets: 1,
      rounds: 2,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandTabata(block, 0, 1);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('work');
    expect(lastStep.isLastInBlock).toBe(true);
  });

  it('inserts restBetweenSets at set boundaries', () => {
    const block = makeTabataBlock({
      sets: 2,
      rounds: 1,
      restBetweenSets: 90,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandTabata(block, 0, 1);

    // transition, work(set0/round0), rest(betweenSets=90), work(set1/round0)
    const restSteps = steps.filter((s) => s.phase === 'rest');
    expect(restSteps).toHaveLength(1);
    expect(restSteps[0].duration).toBe(90);
    expect(restSteps[0].estimatedDuration).toBe(90);
  });

  it('sets roundInfo correctly', () => {
    const block = makeTabataBlock({
      rounds: 3,
      exercises: [{ name: 'Burpees', instructions: 'Go' }],
    });
    const steps = expandTabata(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    expect(workSteps[0].roundInfo).toEqual({ current: 1, total: 3 });
    expect(workSteps[1].roundInfo).toEqual({ current: 2, total: 3 });
    expect(workSteps[2].roundInfo).toEqual({ current: 3, total: 3 });
  });

  it('sets setInfo only when multiple sets', () => {
    const singleSet = makeTabataBlock({ sets: 1, rounds: 1 });
    const multiSet = makeTabataBlock({ sets: 2, rounds: 1 });

    const singleSteps = expandTabata(singleSet, 0, 1);
    const multiSteps = expandTabata(multiSet, 0, 1);

    const singleWork = singleSteps.find((s) => s.phase === 'work');
    const multiWork = multiSteps.find((s) => s.phase === 'work');

    expect(singleWork!.setInfo).toBeUndefined();
    expect(multiWork!.setInfo).toBeDefined();
    expect(multiWork!.setInfo).toEqual({ current: 1, total: 2 });
  });

  it('marks last exercise of last round as isLastInRound', () => {
    const block = makeTabataBlock({
      rounds: 2,
      exercises: [
        { name: 'A', instructions: 'Go' },
        { name: 'B', instructions: 'Go' },
      ],
    });
    const steps = expandTabata(block, 0, 1);

    const workSteps = steps.filter((s) => s.phase === 'work');
    // Round 1: A (not last), B (last in round)
    // Round 2: A (not last), B (last in round)
    expect(workSteps[0].isLastInRound).toBeFalsy();
    expect(workSteps[1].isLastInRound).toBe(true);
    expect(workSteps[2].isLastInRound).toBeFalsy();
    expect(workSteps[3].isLastInRound).toBe(true);
  });

  it('uses tabata block color', () => {
    const block = makeTabataBlock();
    const steps = expandTabata(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.tabata);
    }
  });

  it('transition instructions show set count when multiple sets', () => {
    const block = makeTabataBlock({ sets: 3, rounds: 4, work: 20, rest: 10 });
    const steps = expandTabata(block, 0, 1);

    expect(steps[0].instructions).toBe('3 sets x 4 rounds - 20s/10s');
  });

  it('transition instructions omit set count when single set', () => {
    const block = makeTabataBlock({ sets: 1, rounds: 8, work: 20, rest: 10 });
    const steps = expandTabata(block, 0, 1);

    expect(steps[0].instructions).toBe('8 rounds - 20s/10s');
  });
});
