import { Play, Sparkles, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useActiveProgram } from '../../hooks/useProgram.ts';
import type { Session } from '../../types/session.ts';
import { getProgramImage } from '../../utils/programImage.ts';
import { getSessionImage } from '../../utils/sessionImage.ts';
import { DifficultyBadge } from '../DifficultyBadge.tsx';
import { NutritionWidget } from '../nutrition/NutritionWidget.tsx';
import { SessionAccordion } from '../SessionAccordion.tsx';
import { TomorrowCard } from './TomorrowCard.tsx';

export function ConnectedContent({
  session,
  loading,
  error,
  tomorrowSession,
  tomorrowLoading,
  tomorrowKey,
  onStart,
  guardNavigation,
  formatShortDate,
}: {
  session: Session | null;
  loading: boolean;
  error: string | null;
  tomorrowSession: Session | null;
  tomorrowLoading: boolean;
  todayKey: string;
  tomorrowKey: string;
  onStart: () => void;
  guardNavigation: (path: string) => void;
  formatShortDate: (key: string) => string;
}) {
  const { t } = useTranslation('home');
  const { user, profile } = useAuth();
  const { activeProgram, loading: programLoading } = useActiveProgram(user?.id);

  const progressPct =
    activeProgram && activeProgram.totalSessions > 0
      ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
      : 0;

  const firstName = (profile?.display_name ?? user?.user_metadata?.display_name ?? '').split(' ')[0];

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="sr-only">{t('sr_title')}</h1>

        {/* ── Titre + 3 colonnes d'action ── */}
        <section>
          {firstName && (
            <h2 className="font-display text-xl sm:text-2xl font-bold text-heading mb-1">
              {t('connected.greeting', { firstName })}
            </h2>
          )}
          <h3 className="font-display text-2xl sm:text-3xl font-black text-heading mb-6">{t('connected.ready')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* 1 — Séance du jour */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
              <h4 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider">
                {t('connected.today_card.heading')}
              </h4>
              {loading ? (
                <div className="flex-1 p-5 space-y-3">
                  <div className="skeleton h-36 rounded-xl" />
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              ) : session ? (
                <>
                  <button type="button" onClick={onStart} className="relative h-36 w-full cursor-pointer text-left">
                    <img
                      src={getSessionImage(session)}
                      alt={t('connected.today_card.session_alt', { title: session.title })}
                      className="w-full h-full object-cover object-[50%_30%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="font-display text-lg font-bold text-white leading-tight">
                        {session.title.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/70">
                          {t('connected.today_card.duration', { duration: session.estimatedDuration })}
                        </span>
                        {session.focus.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs text-white/70">
                            · {f}
                          </span>
                        ))}
                        <DifficultyBadge session={session} />
                      </div>
                    </div>
                  </button>
                  <div className="flex-1 flex flex-col justify-end px-5 py-4 bg-surface-card space-y-3">
                    {session.description && <p className="text-sm text-muted leading-relaxed">{session.description}</p>}
                    <button
                      type="button"
                      onClick={onStart}
                      className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      {t('connected.today_card.cta')}
                    </button>
                  </div>
                  <SessionAccordion session={session} />
                </>
              ) : error ? (
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-red-400">{t('connected.today_card.load_error')}</p>
                    <p className="text-xs text-muted mt-1">{t('connected.today_card.load_error_hint')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src="/images/illustration-empty-state.webp"
                      alt={t('connected.today_card.empty_alt')}
                      className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80"
                    />
                    <p className="text-sm text-muted">{t('connected.today_card.empty')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 2 — Crée ma propre séance (premium) / Découvrir Premium (free) */}
            {profile?.subscription_tier === 'premium' ? (
              <Link
                to="/seance/custom"
                className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="flex items-center gap-2 px-5 py-4 bg-surface-card border-b border-divider">
                  <h4 className="font-display text-base font-bold text-heading group-hover:text-accent transition-colors">
                    {t('connected.ai_card.heading')}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand/60 bg-brand/8 px-2 py-0.5 rounded-full shrink-0">
                    {t('connected.ai_card.badge_premium')}
                  </span>
                </div>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="/images/illustration-ai-session.webp"
                    alt={t('connected.ai_card.session_alt')}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">{t('connected.ai_card.description')}</p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                    <Play className="w-4 h-4" aria-hidden="true" />
                    {t('connected.ai_card.cta_play')}
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                to="/premium"
                className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="flex items-center gap-2 px-5 py-4 bg-surface-card border-b border-divider">
                  <h4 className="font-display text-base font-bold text-heading group-hover:text-accent transition-colors">
                    {t('connected.ai_card.heading')}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                    {t('connected.ai_card.badge_premium')}
                  </span>
                </div>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="/images/illustration-ai-session.webp"
                    alt={t('connected.ai_card.session_alt')}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">{t('connected.ai_card.description')}</p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    {t('connected.ai_card.cta_unlock')}
                  </div>
                </div>
              </Link>
            )}

            {/* 3 — Programme */}
            {programLoading ? (
              <div className="flex flex-col rounded-2xl overflow-hidden border border-card-border">
                <div className="px-5 py-4 bg-surface-card border-b border-divider">
                  <div className="skeleton h-5 w-3/4" />
                </div>
                <div className="skeleton h-36 rounded-none" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ) : activeProgram ? (
              <div className="flex flex-col rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand-secondary/30 hover:shadow-lg hover:shadow-brand-secondary/10">
                <h4 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider">
                  {t('connected.program_card.heading_active')}
                </h4>
                <Link to={`/programme/${activeProgram.slug}/suivi`} className="block relative h-36 group">
                  <img
                    src={getProgramImage(activeProgram.slug, activeProgram.goals)}
                    alt={activeProgram.title}
                    className="w-full h-full object-cover object-[50%_30%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-display text-lg font-bold text-white leading-tight group-hover:text-white/80 transition-colors">
                      {activeProgram.title.toUpperCase()}
                    </p>
                  </div>
                </Link>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <span>
                        {t('connected.program_card.progress', {
                          completed: activeProgram.completedCount,
                          total: activeProgram.totalSessions,
                        })}
                      </span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-divider overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-secondary transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  {activeProgram.nextSessionTitle && (
                    <p className="text-xs text-muted mt-3">
                      {t('connected.program_card.next_session')}{' '}
                      <span className="text-heading font-semibold">{activeProgram.nextSessionTitle}</span>
                    </p>
                  )}
                  {activeProgram.nextSessionOrder != null && (
                    <button
                      type="button"
                      onClick={() =>
                        guardNavigation(
                          `/programme/${activeProgram.slug}/seance/${activeProgram.nextSessionOrder}/play`,
                        )
                      }
                      className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white mt-3 cursor-pointer"
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      {t('connected.program_card.cta_play')}
                    </button>
                  )}
                </div>
                {activeProgram.nextSessionData && <SessionAccordion session={activeProgram.nextSessionData} />}
              </div>
            ) : (
              <Link
                to="/programmes"
                className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-brand-secondary/30 hover:shadow-lg hover:shadow-brand-secondary/10"
              >
                <h4 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider group-hover:text-brand-secondary transition-colors">
                  {t('connected.program_card.heading_empty')}
                </h4>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="/images/illustration-program.webp"
                    alt={t('connected.program_card.program_alt')}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">{t('connected.program_card.description')}</p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    {t('connected.program_card.cta_choose')}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* ── Nutrition du jour ── */}
        <section>
          <NutritionWidget />
        </section>

        {/* ── Séance de demain ── */}
        {!tomorrowLoading && tomorrowSession && (
          <section>
            <TomorrowCard session={tomorrowSession} dateKey={tomorrowKey} formatShortDate={formatShortDate} />
          </section>
        )}
      </div>
    </div>
  );
}
