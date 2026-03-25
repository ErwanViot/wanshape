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

  // currentStepIndex is not used in the render output directly, but React needs it
  // as a prop dependency to re-render this component when the active step changes,
  // which updates the progress bar fill via the `progress` prop calculation.
  void currentStepIndex;

  return (
    <div
      className="w-full h-2 flex bg-white/5 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de la séance"
    >
      {segments.map((seg, i) => (
        <div key={i} className="h-full relative" style={{ width: `${seg.widthPercent}%` }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundColor: seg.color }} />
          <div
            className="absolute inset-0 transition-all duration-300"
            style={{
              backgroundColor: seg.color,
              clipPath: seg.widthPercent > 0
                ? `inset(0 ${Math.max(0, 100 - ((progress * 100 - seg.startPercent) / seg.widthPercent) * 100)}% 0 0)`
                : 'inset(0 100% 0 0)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
