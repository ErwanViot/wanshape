import { Link } from 'react-router';
import {
  Sparkles,
  Play,
  Target,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useActiveProgram } from '../../hooks/useProgram.ts';
import type { Session } from '../../types/session.ts';
import { getSessionImage } from '../../utils/sessionImage.ts';
import { getProgramImage } from '../../utils/programImage.ts';
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
  const { user, profile } = useAuth();
  const { activeProgram, loading: programLoading } = useActiveProgram(user?.id);

  const progressPct =
    activeProgram && activeProgram.totalSessions > 0
      ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
      : 0;

  const firstName = (profile?.display_name ?? user?.user_metadata?.display_name ?? '')
    .split(' ')[0];

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="sr-only">Wan2Fit — Ta séance de sport quotidienne</h1>

        {/* ── Titre + 3 colonnes d'action ── */}
        <section>
          {firstName && (
            <h2 className="font-display text-xl sm:text-2xl font-bold text-heading mb-1">
              Salut {firstName}
            </h2>
          )}
          <h3 className="font-display text-2xl sm:text-3xl font-black text-heading mb-6">
            Prêt à bouger ?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 1 — Séance du jour */}
            <div className="flex flex-col rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
              <h4 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider">
                Séance du jour
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
                    <img src={getSessionImage(session)} alt={`Séance du jour : ${session.title}`} className="w-full h-full object-cover object-[50%_30%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="font-display text-lg font-bold text-white leading-tight">
                        {session.title.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/70">~{session.estimatedDuration} min</span>
                        {session.focus.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs text-white/70">· {f}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                  <div className="flex-1 flex flex-col justify-end px-5 py-4 bg-surface-card space-y-3">
                    {session.description && (
                      <p className="text-sm text-muted leading-relaxed">{session.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={onStart}
                      className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      C'est parti
                    </button>
                  </div>
                  <SessionAccordion session={session} />
                </>
              ) : error ? (
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-red-400">Impossible de charger la séance</p>
                    <p className="text-xs text-muted mt-1">Vérifie ta connexion et réessaie.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <img src="/images/illustration-empty-state.webp" alt="Pas de séance prévue" className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80" />
                    <p className="text-sm text-muted">Pas de séance aujourd'hui</p>
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
                    Séance sur-mesure
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand/60 bg-brand/8 px-2 py-0.5 rounded-full shrink-0">Premium</span>
                </div>
                <div className="relative h-36 overflow-hidden">
                  <img src="/images/illustration-ai-session.webp" alt="Séance personnalisée par IA" className="w-full h-full object-cover object-center" />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">
                    L'IA génère une séance adaptée à mes envies et mon niveau.
                  </p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                    <Play className="w-4 h-4" aria-hidden="true" />
                    C'est parti
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
                    Séance sur-mesure
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">Premium</span>
                </div>
                <div className="relative h-36 overflow-hidden">
                  <img src="/images/illustration-ai-session.webp" alt="Séance personnalisée par IA" className="w-full h-full object-cover object-center" />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">
                    L'IA génère une séance adaptée à mes envies et mon niveau.
                  </p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Débloquer avec Premium
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
                  Mon programme
                </h4>
                <Link to={`/programme/${activeProgram.slug}/suivi`} className="block relative h-36 group">
                  <img src={getProgramImage(activeProgram.slug, activeProgram.goals)} alt={activeProgram.title} className="w-full h-full object-cover object-[50%_30%]" />
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
                      <span>{activeProgram.completedCount}/{activeProgram.totalSessions} séances</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-divider overflow-hidden">
                      <div className="h-full rounded-full bg-brand-secondary transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                  {activeProgram.nextSessionTitle && (
                    <p className="text-xs text-muted mt-3">
                      Prochaine : <span className="text-heading font-semibold">{activeProgram.nextSessionTitle}</span>
                    </p>
                  )}
                  {activeProgram.nextSessionOrder != null && (
                    <button
                      type="button"
                      onClick={() => guardNavigation(`/programme/${activeProgram.slug}/seance/${activeProgram.nextSessionOrder}/play`)}
                      className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white mt-3 cursor-pointer"
                    >
                      <Play className="w-4 h-4" aria-hidden="true" />
                      C'est parti
                    </button>
                  )}
                </div>
                {activeProgram.nextSessionData && (
                  <SessionAccordion session={activeProgram.nextSessionData} />
                )}
              </div>
            ) : (
              <Link
                to="/programmes"
                className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-brand-secondary/30 hover:shadow-lg hover:shadow-brand-secondary/10"
              >
                <h4 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider group-hover:text-brand-secondary transition-colors">
                  Programmes
                </h4>
                <div className="relative h-36 overflow-hidden">
                  <img src="/images/illustration-program.webp" alt="Programmes d'entraînement" className="w-full h-full object-cover object-center" />
                </div>
                <div className="flex-1 flex flex-col justify-between px-5 py-4 bg-surface-card space-y-3">
                  <p className="text-sm text-muted leading-relaxed">
                    Un plan structuré sur plusieurs semaines pour progresser.
                  </p>
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    Choisir un programme
                  </div>
                </div>
              </Link>
            )}
          </div>
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
