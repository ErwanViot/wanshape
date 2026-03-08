import { Link, useSearchParams } from 'react-router';
import { FEATURE_CUSTOM_SESSION } from '../config/features.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { usePrograms } from '../hooks/useProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import { supabase } from '../lib/supabase.ts';
import { ProgramCard } from './ProgramCard.tsx';

export function ProgramList() {
  const { user } = useAuth();
  const { programs, loading } = usePrograms();
  const { programs: userPrograms, loading: userLoading } = useUserPrograms();
  const [searchParams] = useSearchParams();
  const justDeleted = searchParams.get('deleted') === '1';

  useDocumentHead({
    title: 'Programmes',
    description:
      "Programmes d'entraînement structurés sur plusieurs semaines. Progressez à votre rythme avec des séances guidées.",
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Hero */}
      <section className="text-center space-y-4 py-4 md:py-8">
        <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-heading">
          Nos <span className="gradient-text">programmes</span>
        </h1>
        <p className="text-base text-muted max-w-md mx-auto leading-relaxed">
          Atteins tes objectifs avec des programmes conçus pour des résultats visibles.
          {!user && ' Crée ton compte gratuit pour suivre ton avancement.'}
        </p>
      </section>

      {/* Deleted confirmation */}
      {justDeleted && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
          Programme supprimé. Ton historique de séances est conservé.
        </div>
      )}

      {/* My AI programs (feature-flagged, logged-in) */}
      {FEATURE_CUSTOM_SESSION && user && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-heading">Mes programmes</h2>

          <Link
            to="/programme/creer"
            className="block w-full cta-gradient py-3.5 rounded-xl text-sm font-bold text-white text-center cursor-pointer"
          >
            Créer mon programme
          </Link>

          {userLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
            </div>
          )}

          {!userLoading && userPrograms.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              Tu n'as pas encore de programme personnalisé.
            </p>
          )}

          {!userLoading && userPrograms.length > 0 && (
            <div className="space-y-3">
              {userPrograms.map((p) => {
                const goalLabel = p.goals?.[0] ?? '';
                return (
                  <Link
                    key={p.id}
                    to={`/programme/${p.slug}/suivi`}
                    className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 group transition-colors hover:border-brand/30 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-heading group-hover:text-brand transition-colors truncate">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {goalLabel} · {p.duration_weeks} sem · {p.frequency_per_week}x/sem
                      </p>
                    </div>
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-muted shrink-0"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Fixed programs */}
      <section className="space-y-4">
        {FEATURE_CUSTOM_SESSION && user && (
          <h2 className="text-lg font-bold text-heading">Programmes guidés</h2>
        )}

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
          <div className="grid grid-cols-1 gap-5">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA for visitors */}
      {!user && supabase && !loading && programs.length > 0 && (
        <div className="text-center pt-4">
          <Link to="/signup" className="cta-gradient inline-block px-8 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer">
            Commencer gratuitement
          </Link>
        </div>
      )}
    </div>
  );
}
