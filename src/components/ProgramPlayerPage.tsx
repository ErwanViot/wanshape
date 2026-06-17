import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { useProgramSession } from '../hooks/useProgram.ts';
import type { Session } from '../types/session.ts';
import { localizedSessionData } from '../utils/sessionLocale.ts';
import { PlayerLoader } from './LoadingSpinner.tsx';
import { Player } from './Player.tsx';
import { PlayerErrorBoundary } from './PlayerErrorBoundary.tsx';
import { SessionNotFound } from './SessionNotFound.tsx';

export function ProgramPlayerPage() {
  const { slug, order } = useParams<{ slug: string; order: string }>();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation(['player', 'sessions_data']);
  const orderNum = order ? Number.parseInt(order, 10) : undefined;
  const { session: programSession, loading } = useProgramSession(slug, orderNum);

  const dbSession = programSession?.session_data as Session | undefined;
  // Fixed seed sessions are FR-only in the DB; their localised content
  // lives in src/i18n/locales/{fr,en}/sessions_data.json. The helper is
  // a no-op for AI-generated programs.
  const sessionData =
    dbSession && slug && programSession
      ? localizedSessionData(slug, programSession.session_order, dbSession, t)
      : dbSession;

  useDocumentHead({
    title: sessionData ? `${sessionData.title} — ${t('page.title_in_progress')}` : t('page.title_program'),
  });

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isHealthAccepted()) {
    return <Navigate to="/" replace />;
  }

  if (loading) return <PlayerLoader />;

  if (!programSession || !sessionData) {
    return (
      <SessionNotFound
        linkTo={slug ? `/programme/${slug}/suivi` : '/programmes'}
        linkLabel={t('session_not_found.back_program')}
      />
    );
  }

  return (
    <PlayerErrorBoundary backTo={slug ? `/programme/${slug}/suivi` : '/programmes'}>
      <Player session={sessionData} programSessionId={programSession.id} backTo={`/programme/${slug}/suivi`} />
    </PlayerErrorBoundary>
  );
}
