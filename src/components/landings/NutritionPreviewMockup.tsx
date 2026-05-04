import { useTranslation } from 'react-i18next';

interface MacroProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
}

function MiniMacro({ label, value, target, unit = 'g' }: MacroProps) {
  return (
    <div className="rounded-xl bg-surface border border-divider px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-heading leading-tight">
        {value}
        <span className="text-[10px] font-normal text-muted"> {unit}</span>
      </p>
      <p className="text-[10px] text-muted mt-0.5">
        / {target} {unit}
      </p>
    </div>
  );
}

function CalorieRingMockup({ current, target, size = 130 }: { current: number; target: number; size?: number }) {
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const offset = circumference * (1 - progress);
  const remaining = Math.max(target - current, 0);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} className="fill-none stroke-divider" strokeWidth={strokeWidth} />
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
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-black text-heading leading-none">{current}</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted mt-0.5">kcal</span>
        <span className="text-[10px] text-body mt-1">{remaining} restantes</span>
      </div>
    </div>
  );
}

export function NutritionPreviewMockup() {
  const { t } = useTranslation('landing_nutrition');
  return (
    <div
      role="img"
      aria-label={t('hero.visual_aria')}
      className="w-full max-w-[340px] rounded-2xl bg-card-bg border border-card-border p-5 shadow-2xl"
    >
      <header className="flex items-center justify-between mb-5">
        <h3 className="font-display text-sm font-bold text-heading">{t('hero.mockup_today')}</h3>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
          {t('hero.mockup_premium_badge')}
        </span>
      </header>

      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <CalorieRingMockup current={1842} target={2200} />
        </div>
        <div className="flex-1 grid grid-cols-1 gap-2">
          <MiniMacro label={t('hero.mockup_protein')} value={72} target={120} />
          <MiniMacro label={t('hero.mockup_carbs')} value={240} target={280} />
          <MiniMacro label={t('hero.mockup_fat')} value={58} target={70} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/5 border border-brand/15">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-brand shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-xs text-body truncate">{t('hero.mockup_search_placeholder')}</span>
      </div>
    </div>
  );
}
