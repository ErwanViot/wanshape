import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  /** 'dark' uses white borders (player screens), 'themed' uses divider tokens (standard pages) */
  variant?: 'dark' | 'themed';
  className?: string;
}

export function LoadingSpinner({ variant = 'themed', className = '' }: LoadingSpinnerProps) {
  const { t } = useTranslation('common');
  const borderClass = variant === 'dark' ? 'border-white/20' : 'border-divider-strong';
  return (
    <output
      aria-label={t('loading.aria')}
      aria-live="polite"
      className={`block w-6 h-6 border-2 ${borderClass} border-t-brand rounded-full animate-spin ${className}`}
    />
  );
}

/** Full-screen dark loading (player pages) */
export function PlayerLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <LoadingSpinner variant="dark" />
    </div>
  );
}
