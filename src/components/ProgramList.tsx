import { Link, useSearchParams } from 'react-router';
import { ChevronRight, Play, Plus } from 'lucide-react';
import { FEATURE_CUSTOM_SESSION } from '../config/features.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useActiveProgram, usePrograms } from '../hooks/useProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import { supabase } from '../lib/supabase.ts';
import { GOAL_LABELS } from '../utils/labels.ts';
import { getAIProgramImage, getProgramImage } from '../utils/programImage.ts';
import { ProgramCard } from './ProgramCard.tsx';

export function ProgramList() {
  const { user, profile } = useAuth();
  const { programs, loading } = usePrograms();
  const { programs: userPrograms, loading: userLoading } = useUserPrograms();
  const { activeProgram, loading: activeProgramLoading } = useActiveProgram(user?.id);
  const [searchParams] = useSearchParams();
  const justDeleted = searchParams.get('deleted') === '1';

  const progressPct = activeProgram && activeProgram.totalSessions > 0
    ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
    : 0;

  // Check if active program is an AI program (not in fixed programs list)
  const isActiveAI = activeProgram && !programs.find((p) => p.slug === activeProgram.slug);
  const activeImage = activeProgram
    ? isActiveAI ? getAIProgramImage() : getProgramImage(activeProgram.slug)
    : '';

  useDocumentHead({
    title: 'Programmes',
    description:
      "Programmes d'entraînement structurés sur plusieurs semaines. Progressez à votre rythme avec des séances guidées.",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 lg:px-14 py-6 md:py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-black text-heading">Programmes</h1>
        <p className="text-sm text-muted mt-1 max-w-lg">
          Atteins tes objectifs avec des programmes conçus pour des résultats visibles.
          {!user && ' Crée ton compte gratuit pour suivre ton avancement.'}
        </p>
      </div>

      {/* Deleted confirmation */}
      {justDeleted && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
          Programme supprimé. Ton historique de séances est conservé.
        </div>
      )}

      {/* ── Active program hero ── */}
      {user && !activeProgramLoading && activeProgram && (
        <section className="relative rounded-2xl overflow-hidden">
          <img
            src={activeImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
            {/* Donut */}
            <div className="relative shrink-0 hidden md:block">
              <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="white" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progressPct / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-black text-white">{progressPct}%</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-1">Programme en cours</p>
              <h2 className="font-display text-xl md:text-2xl font-black text-white mb-2 truncate">
                {activeProgram.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{activeProgram.completedCount}/{activeProgram.totalSessions} séances</span>
                {activeProgram.nextSessionTitle && (
                  <span className="truncate">
                    Prochaine : <span className="text-white/90 font-semibold">{activeProgram.nextSessionTitle}</span>
                  </span>
                )}
              </div>
              {/* Progress bar — mobile (replaces donut) */}
              <div className="md:hidden mt-3">
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-white/50 mt-1">{progressPct}% complété</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 shrink-0">
              {activeProgram.nextSessionOrder != null && (
                <Link
                  to={`/programme/${activeProgram.slug}/seance/${activeProgram.nextSessionOrder}/play`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  Continuer
                </Link>
              )}
              <Link
                to={`/programme/${activeProgram.slug}/suivi`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Voir le suivi
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── My programs (logged-in, premium or feature-flagged) ── */}
      {(profile?.subscription_tier === 'premium' || FEATURE_CUSTOM_SESSION) && user && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">Mes programmes</h2>

          {/* CTA */}
          <Link
            to="/programme/creer"
            className="group flex items-center gap-3 rounded-xl border border-dashed border-brand/30 hover:border-brand/60 bg-brand/5 hover:bg-brand/10 px-5 py-3 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center group-hover:bg-brand/25 transition-colors shrink-0">
              <Plus className="w-5 h-5 text-brand" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand">Créer un programme</p>
              <p className="text-xs text-muted">Généré par IA, adapté à toi</p>
            </div>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {userLoading && (
              <div className="rounded-2xl border border-divider bg-surface-card p-6 flex items-center justify-center min-h-[220px]">
                <div className="w-5 h-5 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
              </div>
            )}

            {!userLoading && userPrograms.map((p) => {
              const goalLabel = GOAL_LABELS[p.goals?.[0] ?? ''] ?? p.goals?.[0] ?? '';
              const image = getAIProgramImage();
              return (
                <Link
                  key={p.id}
                  to={`/programme/${p.slug}/suivi`}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] min-h-[220px] sm:min-h-[260px] flex flex-col"
                >
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 transition-opacity group-hover:opacity-70" />
                  <div className="relative z-10 flex flex-col justify-between flex-1 p-5">
                    <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand/30 border border-brand/40 text-white backdrop-blur-sm">
                      IA
                    </span>
                    <div className="mt-auto space-y-1.5">
                      <p className="text-lg font-bold text-white group-hover:text-white/90 transition-colors line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-xs text-white/50">
                        {goalLabel && <span>{goalLabel} · </span>}
                        {p.duration_weeks} sem · {p.frequency_per_week}x/sem
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Fixed programs ── */}
      <section className="space-y-4">
        {(profile?.subscription_tier === 'premium' || FEATURE_CUSTOM_SESSION) && user && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">Programmes guidés</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
