import type { Session } from '../types/session.ts';

const FOCUS_MAP: Record<string, string> = {
  'cardio': 'cardio',
  'hiit': 'cardio',
  'upper-body': 'upper',
  'lower-body': 'lower',
  'core': 'core',
  'full-body': 'fullbody',
  'flexibility': 'stretching',
  'mobility': 'stretching',
  'stretching': 'stretching',
  'endurance': 'endurance',
  'explosive': 'explosive',
  'plyometric': 'explosive',
};

const BLOCK_TYPE_MAP: Record<string, string> = {
  'hiit': 'cardio',
  'tabata': 'cardio',
  'circuit': 'fullbody',
  'emom': 'endurance',
  'amrap': 'endurance',
  'superset': 'fullbody',
  'pyramid': 'explosive',
  'classic': 'upper',
};

export function getSessionImage(session: Session): string {
  // 1. Try matching from focus tags (first match wins)
  for (const tag of session.focus) {
    const key = tag.toLowerCase();
    if (FOCUS_MAP[key]) return `/images/${FOCUS_MAP[key]}.webp`;
  }

  // 2. Fall back to dominant block type (skip warmup/cooldown)
  const mainBlocks = session.blocks.filter(
    b => b.type !== 'warmup' && b.type !== 'cooldown'
  );
  if (mainBlocks.length > 0) {
    const type = mainBlocks[0].type;
    if (BLOCK_TYPE_MAP[type]) return `/images/${BLOCK_TYPE_MAP[type]}.webp`;
  }

  // 3. Default
  return '/images/fullbody.webp';
}
