import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useSession } from '../hooks/useSession.ts';
import { getTodayKey, getTomorrowKey, parseDateKey } from '../utils/date.ts';

import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { ConnectedContent } from './home/ConnectedContent.tsx';
import { VisitorContent } from './home/VisitorContent.tsx';
import { useShowWelcome, WelcomeModal } from './WelcomeModal.tsx';

export function Home() {
  const { t, i18n } = useTranslation('home');
  const formatShortDate = (dateKey: string) => {
    const d = parseDateKey(dateKey);
    return d.toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const { session, loading, error } = useSession(todayKey);
  const { session: tomorrowSession, loading: tomorrowLoading } = useSession(tomorrowKey);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();
  const { user } = useAuth();
  const shouldShowWelcome = useShowWelcome(user);
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome);

  useDocumentHead({
    title: 'Wan2Fit',
    description: t('page_description'),
  });

  const handleStartSession = () => {
    guardNavigation('/seance/play');
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {user ? (
        <ConnectedContent
          session={session}
          loading={loading}
          error={error}
          tomorrowSession={tomorrowSession}
          tomorrowLoading={tomorrowLoading}
          todayKey={todayKey}
          tomorrowKey={tomorrowKey}
          onStart={handleStartSession}
          guardNavigation={guardNavigation}
          formatShortDate={formatShortDate}
        />
      ) : (
        <VisitorContent
          session={session}
          loading={loading}
          tomorrowSession={tomorrowSession}
          tomorrowLoading={tomorrowLoading}
          tomorrowKey={tomorrowKey}
          onStart={handleStartSession}
          formatShortDate={formatShortDate}
        />
      )}
    </>
  );
}
