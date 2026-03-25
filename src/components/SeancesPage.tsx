import { Link } from 'react-router';
import { Play, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useSession } from '../hooks/useSession.ts';
import { useCustomSessions } from '../hooks/useCustomSessions.ts';
import { getTodayKey, getTomorrowKey, formatDate } from '../utils/date.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { SessionAccordion } from './SessionAccordion.tsx';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';

export function SeancesPage() {
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const { session, loading, error } = useSession(todayKey);
  const { session: tomorrowSession, loading: tomorrowLoading } = useSession(tomorrowKey);
  const { user, profile } = useAuth();
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();

  const isPremium = profile?.subscription_tier === 'premium';
  const { sessions: customSessions, loading: customLoading } = useCustomSessions(isPremium ? user?.id : undefined);

  useDocumentHead({
    title: 'Mes séances',
    description: 'Retrouvez vos séances du jour, de demain et vos séances sur-mesure.',
  });

  const difficulty = session ? computeDifficulty(session) : null;
  const tomorrowDifficulty = tomorrowSession ? computeDifficulty(tomorrowSession) : null;

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}

      <div className="px-6 md:px-10 lg:px-14 py-8">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ── Grille : Séance du jour (2 cols) + Demain / CTA (1 col) ── */}
          <section>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-heading mb-6">
              Mes séances
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
              {/* 1 — Séance du jour */}
              <div className="flex flex-col rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
                <h2 className="font-display text-base font-bold text-heading px-5 py-4 bg-surface-card border-b border-divider">
                  Séance du jour
                </h2>
                {loading ? (
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-44 rounded-xl" />
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-10 w-full rounded-xl" />
                  </div>
                ) : session ? (
                  <>
                    <button type="button" onClick={() => guardNavigation('/seance/play')} className="relative h-44 w-full cursor-pointer text-left">
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
                          {difficulty && (
                            <>
                              <span className="text-xs text-white/70">·</span>
                              <span
                                className={`text-xs font-semibold ${
                                  difficulty.level === 'accessible'
                                    ? 'text-emerald-400'
                                    : difficulty.level === 'modere'
                                      ? 'text-amber-400'
                                      : 'text-red-400'
                                }`}
                              >
                                {difficulty.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="px-5 py-4 bg-surface-card space-y-3">
                      {session.description && (
                        <p className="text-sm text-muted leading-relaxed">{session.description}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => guardNavigation('/seance/play')}
                        className="cta-gradient flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
                      >
                        <Play className="w-4 h-4" aria-hidden="true" />
                        C'est parti
                      </button>
                    </div>
                    <SessionAccordion session={session} defaultOpen />
                  </>
                ) : error ? (
                  <div className="p-6 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-red-400">Impossible de charger la séance</p>
                      <p className="text-xs text-muted mt-1">Vérifie ta connexion et réessaie.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex items-center justify-center">
                    <div className="text-center">
                      <img src="/images/illustration-empty-state.webp" alt="Pas de séance prévue" className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80" />
                      <p className="text-sm text-muted">Pas de séance aujourd'hui</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2 — CTA Séance sur-mesure */}
              {isPremium ? (
                <Link
                  to="/seance/custom"
                  className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="flex items-center gap-2 px-5 py-4 bg-surface-card border-b border-divider">
                    <h3 className="font-display text-base font-bold text-heading group-hover:text-accent transition-colors">
                      Séance sur-mesure
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand/60 bg-brand/8 px-2 py-0.5 rounded-full shrink-0">Premium</span>
                  </div>
                  <div className="relative h-36 overflow-hidden">
                    <img src="/images/illustration-ai-session.webp" alt="Séance personnalisée par IA" className="w-full h-full object-cover object-center" />
                  </div>
                  <div className="px-5 py-4 bg-surface-card space-y-3">
                    <p className="text-sm text-muted leading-relaxed">
                      Choisis ta durée, ton intensité et tes zones ciblées : l'IA compose une séance 100 % personnalisée, prête à lancer en quelques secondes.
                    </p>
                    <ul className="text-xs text-subtle space-y-1">
                      <li>Durée, intensité et focus au choix</li>
                      <li>Adaptée à ton matériel disponible</li>
                      <li>Nouvelle séance à chaque demande</li>
                    </ul>
                    <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                      <Play className="w-4 h-4" aria-hidden="true" />
                      Créer une séance
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/premium"
                  className="flex flex-col rounded-2xl overflow-hidden border border-card-border group cursor-pointer transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="flex items-center gap-2 px-5 py-4 bg-surface-card border-b border-divider">
                    <h3 className="font-display text-base font-bold text-heading group-hover:text-accent transition-colors">
                      Séance sur-mesure
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">Premium</span>
                  </div>
                  <div className="relative h-36 overflow-hidden">
                    <img src="/images/illustration-ai-session.webp" alt="Séance personnalisée par IA" className="w-full h-full object-cover object-center" />
                  </div>
                  <div className="px-5 py-4 bg-surface-card space-y-3">
                    <p className="text-sm text-muted leading-relaxed">
                      Choisis ta durée, ton intensité et tes zones ciblées : l'IA compose une séance 100 % personnalisée, prête à lancer en quelques secondes.
                    </p>
                    <ul className="text-xs text-subtle space-y-1">
                      <li>Durée, intensité et focus au choix</li>
                      <li>Adaptée à ton matériel disponible</li>
                      <li>Nouvelle séance à chaque demande</li>
                    </ul>
                    <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Débloquer avec Premium
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </section>

          {/* ── Demain — ligne compacte + accordion ── */}
          {!tomorrowLoading && tomorrowSession && (
            <section>
              <div className="rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
                <div className="flex items-stretch min-h-[100px]">
                  <div className="relative w-28 sm:w-36 shrink-0">
                    <img src={getSessionImage(tomorrowSession)} alt={`Séance de demain : ${tomorrowSession.title}`} className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" loading="lazy" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="session-label-tomorrow px-2 py-0.5 rounded-md">
                        <span className="text-xs font-bold text-white">Demain</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center min-w-0 bg-surface-card">
                    <h3 className="font-display text-base font-bold text-heading truncate">
                      {tomorrowSession.title.toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted">~{tomorrowSession.estimatedDuration} min</span>
                      {tomorrowSession.focus.slice(0, 2).map((f) => (
                        <span key={f} className="text-xs text-muted">· {f}</span>
                      ))}
                      {tomorrowDifficulty && (
                        <>
                          <span className="text-xs text-muted">·</span>
                          <span
                            className={`text-xs font-semibold ${
                              tomorrowDifficulty.level === 'accessible'
                                ? 'text-emerald-400'
                                : tomorrowDifficulty.level === 'modere'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {tomorrowDifficulty.label}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <SessionAccordion session={tomorrowSession} />
              </div>
            </section>
          )}

          {/* ── Section 4 : Mes séances sur-mesure (premium only) ── */}
          {isPremium && (
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-heading mb-4">
                Mes séances sur-mesure
              </h2>

              {customLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-card-border">
                      <div className="flex items-stretch min-h-[80px]">
                        <div className="skeleton w-28 shrink-0 rounded-none" />
                        <div className="flex-1 p-4 space-y-2">
                          <div className="skeleton h-4 w-3/4" />
                          <div className="skeleton h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : customSessions.length > 0 ? (
                <div className="space-y-3">
                  {customSessions.map((cs) => {
                    const sessionData = cs.session_data;
                    const image = getSessionImage(sessionData);
                    const diff = computeDifficulty(sessionData);

                    return (
                      <Link
                        key={cs.id}
                        to={`/seance/custom/${cs.id}`}
                        className="flex items-stretch min-h-[80px] rounded-2xl overflow-hidden border border-card-border transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10"
                      >
                        <div className="relative w-28 sm:w-36 shrink-0">
                          <img src={image} alt={sessionData.title} className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" loading="lazy" />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-center min-w-0 bg-surface-card">
                          <h3 className="font-display text-base font-bold text-heading truncate">
                            {sessionData.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-muted">~{sessionData.estimatedDuration} min</span>
                            {sessionData.focus.slice(0, 2).map((f) => (
                              <span key={f} className="text-xs text-muted">· {f}</span>
                            ))}
                            <span className="text-xs text-muted">·</span>
                            <span
                              className={`text-xs font-semibold ${
                                diff.level === 'accessible'
                                  ? 'text-emerald-400'
                                  : diff.level === 'modere'
                                    ? 'text-amber-400'
                                    : 'text-red-400'
                              }`}
                            >
                              {diff.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-faint mt-1.5">
                            Créée le {formatDate(cs.created_at)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-card-border p-6 text-center bg-surface-card">
                  <p className="text-sm text-muted">
                    Pas encore de séance sur-mesure. Crée ta première séance personnalisée !
                  </p>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </>
  );
}
