import { BLOCK_COLORS } from '../engine/constants.ts';
import type { AtomicStep } from '../types/player.ts';
import type { BlockType } from '../types/session.ts';

interface Props {
  steps: AtomicStep[];
  currentStepIndex: number;
  progress: number;
}

interface BlockSegment {
  type: BlockType;
  color: string;
  startPercent: number;
  widthPercent: number;
}

export function GlobalProgress({ steps, currentStepIndex, progress }: Props) {
  // Build block segments
  const totalDuration = steps.reduce((sum, s) => sum + s.estimatedDuration, 0);
  if (totalDuration === 0) return null;

  const segments: BlockSegment[] = [];
  let currentDuration = 0;
  let lastBlockIndex = -1;

  for (const step of steps) {
    if (step.blockIndex !== lastBlockIndex) {
      segments.push({
        type: step.blockType,
        color: BLOCK_COLORS[step.blockType],
        startPercent: (currentDuration / totalDuration) * 100,
        widthPercent: 0,
      });
      lastBlockIndex = step.blockIndex;
    }
    segments[segments.length - 1].widthPercent += (step.estimatedDuration / totalDuration) * 100;
    currentDuration += step.estimatedDuration;
  }

  void currentStepIndex; // used for reactivity

  return (
    <div className="w-full h-2 flex bg-white/5 overflow-hidden">
      {segments.map((seg, i) => (
        <div key={i} className="h-full relative" style={{ width: `${seg.widthPercent}%` }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundColor: seg.color }} />
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              backgroundColor: seg.color,
              clipPath: `inset(0 ${Math.max(0, 100 - ((progress * 100 - seg.startPercent) / seg.widthPercent) * 100)}% 0 0)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
