import { Link, Navigate, useParams } from 'react-router';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { isHealthAccepted } from '../hooks/useHealthCheck.ts';
import { useProgramSession } from '../hooks/useProgram.ts';
import type { Session } from '../types/session.ts';
import { Player } from './Player.tsx';

export function ProgramPlayerPage() {
  const { slug, order } = useParams<{ slug: string; order: string }>();
  const orderNum = order ? Number.parseInt(order, 10) : undefined;
  const { session: programSession, loading } = useProgramSession(slug, orderNum);

  const sessionData = programSession?.session_data as unknown as Session | undefined;

  useDocumentHead({
    title: sessionData ? `${sessionData.title} — En cours` : 'Séance programme',
  });

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

  if (!programSession || !sessionData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="text-white/60 text-lg font-medium">Séance introuvable.</p>
          <Link
            to={slug ? `/programme/${slug}` : '/programmes'}
            className="text-link hover:text-link-hover underline mt-4 inline-block"
          >
            Retour au programme
          </Link>
        </div>
      </div>
    );
  }

  return <Player session={sessionData} programSessionId={programSession.id} />;
}
