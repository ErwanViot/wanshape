import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';

export function SessionExpiredBanner() {
  const { sessionExpired, user } = useAuth();
  const { t } = useTranslation('player');

  if (!sessionExpired || !user) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-center">
      <p className="text-sm text-amber-200 inline-flex items-center gap-2 flex-wrap justify-center">
        <RefreshCw className="w-4 h-4" />
        {t('session_expired_banner.message')}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="underline font-medium hover:text-amber-100 transition-colors"
        >
          {t('session_expired_banner.refresh')}
        </button>
      </p>
    </div>
  );
}
