import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus.ts';

// Thin banner shown only when the device drops offline. Lives at the very
// top of the viewport above any header so it doesn't collide with native
// notch / status bar (it sits inside the safe area via pt-safe).
export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const { t } = useTranslation('common');

  if (isOnline) return null;

  return (
    <output
      aria-live="polite"
      className="pt-safe sticky top-0 z-50 w-full bg-amber-500/95 text-amber-950 text-sm font-medium px-4 py-2 flex items-center justify-center gap-2 shadow"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span>{t('offline.banner')}</span>
    </output>
  );
}
