import { formatDuration } from '../utils/date.ts';

interface Props {
  remaining: number;
  progress: number;
  color: string;
  size?: 'large' | 'medium' | 'small';
  pulse?: boolean;
}

const SIZES = {
  large:  { box: 220, stroke: 8, text: 'text-6xl sm:text-7xl' },
  medium: { box: 170, stroke: 7, text: 'text-4xl sm:text-5xl' },
  small:  { box: 120, stroke: 6, text: 'text-2xl sm:text-3xl' },
} as const;

export function TimerDisplay({ remaining, progress, color, size = 'large', pulse = false }: Props) {
  const { box, stroke, text } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: box, height: box }}>
      <svg
        width={box}
        height={box}
        className="absolute inset-0 -rotate-90"
      >
        {/* Track */}
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span
        className={`font-mono font-bold tabular-nums ${text} ${pulse ? 'animate-timer-flash' : ''}`}
        style={{ color }}
      >
        {formatDuration(remaining)}
      </span>
    </div>
  );
}
