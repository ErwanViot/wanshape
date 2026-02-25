import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { usePrograms } from '../hooks/useProgram.ts';
import { supabase } from '../lib/supabase.ts';
import { ProgramCard } from './ProgramCard.tsx';

export function ProgramList() {
  const { user } = useAuth();
  const { programs, loading } = usePrograms();

  useDocumentHead({
    title: 'Programmes',
    description:
      "Programmes d'entraînement structurés sur plusieurs semaines. Progressez à votre rythme avec des séances guidées.",
  });

  return (
    <>
      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label="Retour à l'accueil"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg text-heading">Programmes</h1>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-subtle leading-relaxed">
          Des programmes structurés sur <strong className="text-strong">plusieurs semaines</strong> pour progresser
          étape par étape.
          {!user && ' Connectez-vous pour suivre votre progression.'}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
          </div>
        )}

        {!loading && programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">
              {supabase ? 'Aucun programme disponible pour le moment.' : 'Service temporairement indisponible.'}
            </p>
          </div>
        )}

        {!loading && programs.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
