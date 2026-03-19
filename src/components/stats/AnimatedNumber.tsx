import { useAnimatedValue } from '../../hooks/useAnimatedValue.ts';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 800, formatter, className }: AnimatedNumberProps) {
  const animated = useAnimatedValue(value, duration);
  const display = formatter ? formatter(animated) : String(Math.round(animated));

  return <span className={className}>{display}</span>;
}
