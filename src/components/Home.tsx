import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useSession } from '../hooks/useSession.ts';
import { getTodayKey, getTomorrowKey, parseDateKey } from '../utils/date.ts';

import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { ConnectedContent } from './home/ConnectedContent.tsx';
import { VisitorContent } from './home/VisitorContent.tsx';
import { useShowWelcome, WelcomeModal } from './WelcomeModal.tsx';

function formatShortDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function Home() {
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
    description:
      "Chaque jour, une séance de sport guidée sans matériel. 8 formats d'entraînement, 25-40 min. Gratuit pour commencer, premium pour aller plus loin.",
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
