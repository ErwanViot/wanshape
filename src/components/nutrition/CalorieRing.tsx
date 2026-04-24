import { useTranslation } from 'react-i18next';

interface CalorieRingProps {
  current: number;
  target: number | null;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/**
 * Circular progress ring for daily calories vs target.
 * Gracefully degrades to "Awareness" mode when no target is set.
 */
export function CalorieRing({ current, target, size = 160, strokeWidth = 12, label }: CalorieRingProps) {
  const { t } = useTranslation('nutrition');
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target != null && target > 0 ? Math.min(current / target, 1) : 0;
  const offset = circumference * (1 - progress);

  const remaining = target != null ? Math.round(target - current) : null;
  const roundedCurrent = Math.round(current);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        target != null
          ? t('calorie_ring.aria_with_target', { current: roundedCurrent, target })
          : t('calorie_ring.aria_no_target', { current: roundedCurrent })
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <title>{label ?? t('calorie_ring.title')}</title>
        <circle cx={size / 2} cy={size / 2} r={radius} className="fill-none stroke-divider" strokeWidth={strokeWidth} />
        {target != null && target > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-brand"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-black text-heading leading-none">{roundedCurrent}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted mt-0.5">kcal</span>
        {target != null && (
          <span className="text-xs text-body mt-1">
            {remaining != null && remaining > 0
              ? t('calorie_ring.remaining', { n: remaining })
              : t('calorie_ring.goal_reached')}
          </span>
        )}
      </div>
    </div>
  );
}
