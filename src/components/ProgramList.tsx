import { ChevronRight, Play, Rocket, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useActiveProgram, usePrograms } from '../hooks/useProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import { supabase } from '../lib/supabase.ts';
import { getProgramImage } from '../utils/programImage.ts';
import { localizedProgramFields } from '../utils/programLocale.ts';
import { localizedSessionData } from '../utils/sessionLocale.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { ProgramCard } from './ProgramCard.tsx';

export function ProgramList() {
  const { t } = useTranslation(['programs', 'programs_data', 'sessions_data']);
  const { user, profile } = useAuth();
  const { programs, loading } = usePrograms();
  const { programs: userPrograms, loading: userLoading } = useUserPrograms();
  const { activeProgram, loading: activeProgramLoading } = useActiveProgram(user?.id);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();
  const [searchParams] = useSearchParams();
  const justDeleted = searchParams.get('deleted') === '1';

  const isPremium = profile?.subscription_tier === 'premium';

  const progressPct =
    activeProgram && activeProgram.totalSessions > 0
      ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
      : 0;

  // The fixed (seed) programs were inserted FR-only in migration 002 — pull
  // the localised title/goals from i18n so the active-program hero matches
  // the user's current language.
  const activeLocalized = activeProgram
    ? localizedProgramFields(activeProgram, t)
    : { title: '', description: null as string | null, goals: [] as string[] };

  const activeImage = activeProgram ? getProgramImage(activeProgram.slug, activeLocalized.goals) : '';

  const nextSessionTitle =
    activeProgram?.nextSessionData && activeProgram.nextSessionOrder != null
      ? localizedSessionData(activeProgram.slug, activeProgram.nextSessionOrder, activeProgram.nextSessionData, t).title
      : (activeProgram?.nextSessionTitle ?? null);

  useDocumentHead({
    title: t('list.programs'),
    description: t('list.subtitle'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 lg:px-14 py-6 md:py-8 space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-black text-heading">{t('list.title')}</h1>
        <p className="text-sm text-muted mt-1 max-w-lg">
          {t('list.subtitle')}
          {!user && t('list.subtitle_visitor')}
        </p>
      </div>

      {/* Deleted confirmation */}
      {justDeleted && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
          {t('list.deleted_banner')}
        </div>
      )}

      {/* ── Active program hero ── */}
      {user && !activeProgramLoading && activeProgram && (
        <section className="relative rounded-2xl overflow-hidden">
          <img src={activeImage} alt="" className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
            {/* Donut */}
            <div className="relative shrink-0 hidden md:block">
              <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="7"
                  strokeLinecap="round"
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
              <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-1">
                {t('list.active_label')}
              </p>
              <h2 className="font-display text-xl md:text-2xl font-black text-white mb-2 truncate">
                {activeLocalized.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>
                  {t('list.sessions_progress', {
                    completed: activeProgram.completedCount,
                    total: activeProgram.totalSessions,
                  })}
                </span>
                {nextSessionTitle && (
                  <span className="truncate">
                    {t('list.next_session')} <span className="text-white/90 font-semibold">{nextSessionTitle}</span>
                  </span>
                )}
              </div>
              {/* Progress bar — mobile (replaces donut) */}
              <div className="md:hidden mt-3">
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-white/50 mt-1">{t('list.progress_mobile', { pct: progressPct })}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 shrink-0">
              {activeProgram.nextSessionOrder != null && (
                <button
                  type="button"
                  onClick={() =>
                    guardNavigation(`/programme/${activeProgram.slug}/seance/${activeProgram.nextSessionOrder}/play`)
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  {t('list.cta_continue')}
                </button>
              )}
              <Link
                to={`/programme/${activeProgram.slug}/suivi`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                {t('list.cta_tracking')}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── AI CTA Banner ── */}
      {isPremium && user && (
        <Link to="/programme/creer" className="group relative block rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-secondary to-brand" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-5 p-6">
            <div className="flex-1 space-y-2">
              <h2 className="flex items-center gap-2 font-display text-lg md:text-xl font-black text-white">
                <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
                {t('list.ai_banner_title')}
              </h2>
              <p className="text-sm text-white/70">{t('list.ai_banner_desc')}</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-bold text-white group-hover:bg-accent/30 transition-colors">
                <Rocket className="w-4 h-4 text-accent" aria-hidden="true" />
                {t('list.ai_banner_cta')}
              </span>
            </div>
            <img
              src="/images/illustration-program.webp"
              alt=""
              className="hidden sm:block w-28 h-28 object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </Link>
      )}

      {/* Non-premium CTA */}
      {!isPremium && user && (
        <Link to="/premium" className="group relative block rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-secondary to-brand" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-5 p-6">
            <div className="flex-1 space-y-2">
              <h2 className="flex items-center gap-2 font-display text-lg md:text-xl font-black text-white">
                <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
                {t('list.ai_banner_title')}
              </h2>
              <p className="text-sm text-white/70">{t('list.ai_banner_desc')}</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-bold text-white group-hover:bg-accent/30 transition-colors">
                <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
                {t('list.premium_banner_cta')}
              </span>
            </div>
            <img
              src="/images/illustration-program.webp"
              alt=""
              className="hidden sm:block w-28 h-28 object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </Link>
      )}

      {/* ── My AI programs ── */}
      {isPremium && user && !userLoading && userPrograms.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">{t('list.my_programs')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {userPrograms.map((p) => {
              const goalLabel = p.goals?.[0] ?? '';
              const image = getProgramImage(p.slug, p.goals);
              return (
                <Link
                  key={p.id}
                  to={`/programme/${p.slug}/suivi`}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] min-h-[200px] sm:min-h-[240px] flex flex-col"
                >
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/50 transition-opacity group-hover:opacity-50" />
                  <div className="relative z-10 flex flex-col justify-between flex-1 p-5">
                    <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand/30 border border-brand/40 text-white backdrop-blur-sm">
                      IA
                    </span>
                    <div className="mt-auto space-y-1.5 text-outline">
                      <p className="text-lg font-bold text-white group-hover:text-white/90 transition-colors line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-xs text-white">
                        {goalLabel && <>{t('list.goal_label', { goal: goalLabel })} · </>}
                        {t('list.duration_frequency', { weeks: p.duration_weeks, freq: p.frequency_per_week })}
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">
          {t(user ? 'list.next_challenge' : 'list.programs')}
        </h2>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && programs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">{supabase ? t('list.no_programs') : t('list.service_unavailable')}</p>
          </div>
        )}

        {!loading && programs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA for visitors */}
      {!user && supabase && !loading && programs.length > 0 && (
        <div className="text-center pt-4">
          <Link
            to="/signup"
            className="cta-gradient inline-block px-8 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer"
          >
            {t('list.start_free')}
          </Link>
        </div>
      )}
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}
    </div>
  );
}
