import type { Block } from '../types/session.ts';
import { BLOCK_LABELS } from '../engine/constants.ts';

export interface TimelineSegment {
  label: string;
  type: Block['type'];
  isAccent: boolean;
  duration: number;
}

export function computeTimeline(blocks: Block[]): TimelineSegment[] {
  return blocks.map(block => {
    const label = BLOCK_LABELS[block.type];
    const isAccent = block.type !== 'warmup' && block.type !== 'cooldown';
    let duration = 0;

    switch (block.type) {
      case 'warmup':
      case 'cooldown':
        duration = block.exercises.reduce((sum, ex) => sum + (ex.duration * (ex.bilateral ? 2 : 1)), 0);
        break;
      case 'classic':
        duration = block.exercises.reduce((sum, ex) => sum + ex.sets * 30 + (ex.sets - 1) * ex.restBetweenSets, 0);
        break;
      case 'circuit':
        duration = block.rounds * block.exercises.length * 40;
        break;
      case 'hiit':
        duration = block.rounds * (block.work + block.rest);
        break;
      case 'tabata':
        duration = (block.rounds ?? 8) * ((block.work ?? 20) + (block.rest ?? 10)) * (block.sets ?? 1);
        break;
      case 'emom':
        duration = block.minutes * 60;
        break;
      case 'amrap':
        duration = block.duration;
        break;
      case 'superset':
        duration = block.sets * block.pairs.length * 60;
        break;
      case 'pyramid':
        duration = block.pattern.length * block.exercises.length * 30;
        break;
    }

    return { label, type: block.type, isAccent, duration };
  });
}

export function getBlockExerciseCount(block: Block): number {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
    case 'classic':
    case 'circuit':
    case 'hiit':
    case 'tabata':
    case 'emom':
    case 'amrap':
    case 'pyramid':
      return block.exercises.length;
    case 'superset':
      return block.pairs.reduce((sum, pair) => sum + pair.exercises.length, 0);
  }
}

export function formatBlockDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return `${seconds}s`;
  return `${mins} min`;
}
