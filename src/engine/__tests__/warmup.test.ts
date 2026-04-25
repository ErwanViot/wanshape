import { describe, expect, it } from 'vitest';
import type { CooldownBlock, WarmupBlock } from '../../types/session.ts';
import { BLOCK_COLORS, TRANSITION_DURATION } from '../constants.ts';
import { expandWarmup } from '../interpreters/warmup.ts';

function makeWarmupBlock(overrides?: Partial<WarmupBlock>): WarmupBlock {
  return {
    type: 'warmup',
    name: 'Echauffement',
    exercises: [
      { name: 'Rotation epaules', duration: 30, instructions: 'Grandes rotations' },
      { name: 'Squats bodyweight', duration: 45, instructions: 'Descendre lentement' },
    ],
    ...overrides,
  };
}

describe('expandWarmup', () => {
  it('starts with a transition step', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 3);

    expect(steps[0].phase).toBe('transition');
    expect(steps[0].duration).toBe(TRANSITION_DURATION);
    expect(steps[0].exerciseName).toBe('Echauffement');
    expect(steps[0].instructions).toBe('2 exercices');
  });

  it('produces one work step per exercise (no rest steps)', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 3);

    // 1 transition + 2 work steps = 3 total
    expect(steps).toHaveLength(3);
    expect(steps[1].phase).toBe('work');
    expect(steps[2].phase).toBe('work');
  });

  it('sets correct duration from exercise definition', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 3);

    expect(steps[1].duration).toBe(30);
    expect(steps[2].duration).toBe(45);
  });

  it('doubles duration for bilateral exercises', () => {
    const block = makeWarmupBlock({
      exercises: [{ name: 'Fentes', duration: 20, instructions: 'Alterner', bilateral: true }],
    });
    const steps = expandWarmup(block, 0, 1);

    expect(steps[1].duration).toBe(40);
    expect(steps[1].instructions).toContain('20s par côté');
  });

  it('tags all steps with correct blockIndex and totalBlocks', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 2, 5);

    for (const step of steps) {
      expect(step.blockIndex).toBe(2);
      expect(step.totalBlocks).toBe(5);
    }
  });

  it('uses warmup block color', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    for (const step of steps) {
      expect(step.blockColor).toBe(BLOCK_COLORS.warmup);
    }
  });

  it('marks only the last exercise as isLastInBlock', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    expect(steps[1].isLastInBlock).toBeFalsy();
    expect(steps[2].isLastInBlock).toBe(true);
  });

  it('provides nextStepPreview for non-last exercises', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    expect(steps[1].nextStepPreview).toEqual({
      exerciseName: 'Squats bodyweight',
      description: '45s',
    });
    expect(steps[2].nextStepPreview).toBeUndefined();
  });

  it('sets exerciseInfo with current and total', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    expect(steps[1].exerciseInfo).toEqual({ current: 1, total: 2 });
    expect(steps[2].exerciseInfo).toEqual({ current: 2, total: 2 });
  });

  it('handles single exercise block', () => {
    const block = makeWarmupBlock({
      exercises: [{ name: 'Mobilite', duration: 60, instructions: 'Mobiliser' }],
    });
    const steps = expandWarmup(block, 0, 1);

    expect(steps).toHaveLength(2); // transition + 1 work
    expect(steps[1].isLastInBlock).toBe(true);
    expect(steps[1].nextStepPreview).toBeUndefined();
  });

  it('handles cooldown block the same way', () => {
    const block: CooldownBlock = {
      type: 'cooldown',
      name: 'Retour au calme',
      exercises: [{ name: 'Etirements', duration: 30, instructions: 'Etirer' }],
    };
    const steps = expandWarmup(block, 2, 3);

    expect(steps[0].blockType).toBe('cooldown');
    expect(steps[0].blockColor).toBe(BLOCK_COLORS.cooldown);
    expect(steps).toHaveLength(2);
  });

  it('uses timerMode countdown for all steps', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    for (const step of steps) {
      expect(step.timerMode).toBe('countdown');
    }
  });

  it('sets estimatedDuration equal to duration for work steps', () => {
    const block = makeWarmupBlock();
    const steps = expandWarmup(block, 0, 1);

    expect(steps[1].estimatedDuration).toBe(30);
    expect(steps[2].estimatedDuration).toBe(45);
  });
});
