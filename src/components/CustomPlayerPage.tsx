import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCustomSession } from '../hooks/useCustomSessions.ts';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import type { Session } from '../types/session.ts';
import { PlayerLoader } from './LoadingSpinner.tsx';
import { Player } from './Player.tsx';
import { PlayerErrorBoundary } from './PlayerErrorBoundary.tsx';
import { SessionNotFound } from './SessionNotFound.tsx';

export function CustomPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { session: record, loading } = useCustomSession(id, user?.id);
  const { t } = useTranslation('player');

  const sessionData = record?.session_data as Session | undefined;

  useDocumentHead({
    title: sessionData ? `${sessionData.title} — ${t('page.title_in_progress')}` : t('page.title_custom'),
  });

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isHealthAccepted()) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <PlayerLoader />;

  if (!record || !sessionData) {
    return <SessionNotFound linkTo="/seance/custom" linkLabel={t('session_not_found.back_sessions')} />;
  }

  return (
    <PlayerErrorBoundary backTo={`/seance/custom/${id}`}>
      <Player session={sessionData} customSessionId={id} backTo={`/seance/custom/${id}`} />
    </PlayerErrorBoundary>
  );
}
