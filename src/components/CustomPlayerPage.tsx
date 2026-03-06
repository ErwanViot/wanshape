import { Link, Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { useCustomSession } from '../hooks/useCustomSessions.ts';
import type { Session } from '../types/session.ts';
import { Player } from './Player.tsx';

export function CustomPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { session: record, loading } = useCustomSession(id);

  const sessionData = record?.session_data as Session | undefined;

  useDocumentHead({
    title: sessionData ? `${sessionData.title} — En cours` : 'Séance personnalisée',
  });

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isHealthAccepted()) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!record || !sessionData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="text-white/60 text-lg font-medium">Séance introuvable.</p>
          <Link
            to="/seance/custom"
            className="text-link hover:text-link-hover underline mt-4 inline-block"
          >
            Retour aux séances
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Player
      session={sessionData}
      customSessionId={id}
      backTo={`/seance/custom/${id}`}
    />
  );
}
