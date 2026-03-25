import { Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { useProgramSession } from '../hooks/useProgram.ts';
import type { Session } from '../types/session.ts';
import { PlayerLoader } from './LoadingSpinner.tsx';
import { Player } from './Player.tsx';
import { PlayerErrorBoundary } from './PlayerErrorBoundary.tsx';
import { SessionNotFound } from './SessionNotFound.tsx';

export function ProgramPlayerPage() {
  const { slug, order } = useParams<{ slug: string; order: string }>();
  const { user, loading: authLoading } = useAuth();
  const orderNum = order ? Number.parseInt(order, 10) : undefined;
  const { session: programSession, loading } = useProgramSession(slug, orderNum);

  const sessionData = programSession?.session_data as Session | undefined;

  useDocumentHead({
    title: sessionData ? `${sessionData.title} — En cours` : 'Séance programme',
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
        linkLabel="Retour au programme"
      />
    );
  }

  return (
    <PlayerErrorBoundary backTo={slug ? `/programme/${slug}/suivi` : '/programmes'}>
      <Player session={sessionData} programSessionId={programSession.id} backTo={`/programme/${slug}/suivi`} />
    </PlayerErrorBoundary>
  );
}
