import { AnimatedNumber } from './AnimatedNumber.tsx';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  formatter?: (n: number) => string;
  subtitle?: string;
  variant?: 'brand' | 'default';
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  formatter,
  subtitle,
  variant = 'default',
  className = '',
}: MetricCardProps) {
  const isBrand = variant === 'brand';

  return (
    <div
      className={`rounded-2xl p-5 ${
        isBrand ? 'bg-brand text-white' : 'bg-surface-card border border-divider'
      } ${className}`}
    >
      <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isBrand ? 'opacity-70' : 'text-muted'}`}>
        {label}
      </div>
      <div className="font-display text-4xl md:text-5xl font-black leading-none animate-number-pop">
        <AnimatedNumber value={value} formatter={formatter} className={isBrand ? '' : 'text-heading'} />
        {unit && <span className={`text-lg font-normal ml-0.5 ${isBrand ? 'opacity-70' : 'text-muted'}`}>{unit}</span>}
      </div>
      {subtitle && <div className={`text-xs mt-1 ${isBrand ? 'opacity-60' : 'text-muted'}`}>{subtitle}</div>}
    </div>
  );
}
