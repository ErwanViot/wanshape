import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Sparkles,
  Zap,
  Calendar,
  ArrowRight,
  Play,
  Target,
  Dumbbell,
  Clock,
  RotateCcw,

  Shuffle,
  TrendingUp,
  Wand2,
  ListChecks,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useActiveProgram } from '../hooks/useProgram.ts';
import { useSession } from '../hooks/useSession.ts';
import { supabase } from '../lib/supabase.ts';
import type { Session } from '../types/session.ts';
import { getTodayKey, getTomorrowKey, parseDDMMYYYY } from '../utils/date.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { getProgramImage } from '../utils/programImage.ts';
import { Footer } from './Footer.tsx';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { SessionAccordion } from './SessionAccordion.tsx';
import { WelcomeModal, useShowWelcome } from './WelcomeModal.tsx';

function formatShortDate(dateKey: string): string {
  const d = parseDDMMYYYY(dateKey);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function Home() {
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const { session, loading, error } = useSession(todayKey);
  const { session: tomorrowSession, loading: tomorrowLoading } = useSession(tomorrowKey);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();
  const { user } = useAuth();
  const shouldShowWelcome = useShowWelcome(user);
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome);

  useDocumentHead({
    title: 'WAN2FIT',
    description:
      "Chaque jour, une séance de sport guidée sans matériel. 8 formats d'entraînement, 25-40 min, 100% gratuit.",
  });

  const handleStartSession = () => {
    guardNavigation('/seance/play');
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {user ? (
        <ConnectedContent
          session={session}
          loading={loading}
          error={error}
          tomorrowSession={tomorrowSession}
          tomorrowLoading={tomorrowLoading}
          todayKey={todayKey}
          tomorrowKey={tomorrowKey}
          onStart={handleStartSession}
          guardNavigation={guardNavigation}
        />
      ) : (
        <VisitorContent
          session={session}
          loading={loading}
          error={error}
          tomorrowSession={tomorrowSession}
          tomorrowLoading={tomorrowLoading}
          todayKey={todayKey}
          tomorrowKey={tomorrowKey}
          onStart={handleStartSession}
        />
      )}

      <Footer />
    </>
  );
}

/* ────────────────────────────────────────────
   Connected user — Dashboard layout
   ──────────────────────────────────────────── */

function ConnectedContent({
  session,
  loading,
  tomorrowSession,
  tomorrowLoading,
  tomorrowKey,
  onStart,
  guardNavigation,
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
        <h1 className="sr-only">WAN2FIT — Votre séance de sport quotidienne</h1>

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
                  <img src={getProgramImage(activeProgram.slug)} alt={activeProgram.title} className="w-full h-full object-cover object-[50%_30%]" />
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
                  <SessionAccordion session={activeProgram.nextSessionData as unknown as Session} />
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
            <TomorrowCard session={tomorrowSession} dateKey={tomorrowKey} />
          </section>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Screenshot Carousel
   ──────────────────────────────────────────── */

function ScreenshotCarousel({ images, ratio = 'portrait', fit = 'cover', interval = 4000 }: { images: { src: string; alt: string }[]; ratio?: 'portrait' | 'landscape'; fit?: 'cover' | 'contain'; interval?: number }) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval, images.length]);

  const aspectClass = ratio === 'portrait' ? 'aspect-[4/5] max-h-[480px]' : 'aspect-[5/3]';

  return (
    <div className="relative w-full">
      <div className={`relative ${aspectClass} mx-auto overflow-hidden rounded-2xl border border-card-border shadow-2xl`}>
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${fit === 'contain' ? 'object-contain' : 'object-cover object-top'} ${i === active ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === active ? 'bg-brand' : 'bg-muted/30'}`}
              aria-label={img.alt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Visitor — Landing page
   ──────────────────────────────────────────── */

function VisitorContent({
  session,
  loading,
  tomorrowSession,
  tomorrowLoading,
  tomorrowKey,
  onStart,
}: {
  session: Session | null;
  loading: boolean;
  error: string | null;
  tomorrowSession: Session | null;
  tomorrowLoading: boolean;
  todayKey: string;
  tomorrowKey: string;
  onStart: () => void;
}) {
  return (
    <div className="space-y-0">
      {/* ── 1. Hero — photo pleine largeur ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-landing.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 lg:px-14">
          <div className="max-w-5xl mx-auto py-16 md:py-24 space-y-6">
            <div className="stagger-fade-in stagger-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Zap className="w-3 h-3" aria-hidden="true" />
                Sans matériel, où tu veux
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] max-w-xl stagger-fade-in stagger-2">
              Progresse
              <br />
              <span className="gradient-text">chaque jour</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed stagger-fade-in stagger-3">
              Une séance guidée chaque jour, 8 formats variés, 25-40 min. Gratuit pour commencer, premium pour aller plus loin.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 stagger-fade-in stagger-4">
              {supabase && (
                <Link
                  to="/signup"
                  className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white flex items-center gap-2"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                onClick={onStart}
                className="px-8 py-4 rounded-full text-base font-bold text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Essayer sans inscription
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Comment ça marche — 3 étapes ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-black text-heading text-center mb-10">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', icon: Calendar, title: 'Ouvre l\'app', desc: 'Ta séance du jour est prête. Pas besoin de réfléchir.' },
              { step: '2', icon: Play, title: 'Suis ta séance', desc: 'Exercices guidés, chrono intégré, transitions automatiques.' },
              { step: '3', icon: Target, title: 'Progresse', desc: 'Statistiques, régularité et programmes pour aller plus loin.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-brand" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-heading">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Feature : Séance du jour ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-5">
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Séance du jour</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Chaque jour,<br />une nouvelle séance
              </h2>
              <p className="text-muted leading-relaxed">
                Pas besoin de réfléchir. Tu ouvres l'app, ta séance t'attend — avec un format différent chaque jour.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Shuffle, text: '8 formats variés : HIIT, EMOM, Circuit, Tabata…' },
                  { icon: Clock, text: '25 à 40 min, adapté à ton emploi du temps' },
                  { icon: Dumbbell, text: '100% sans matériel, faisable partout' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors cursor-pointer"
              >
                Essayer maintenant
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visuel : preview séance du jour + demain */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-card-border">
                {loading ? (
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-40 rounded-xl" />
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-10 w-full rounded-xl" />
                  </div>
                ) : session ? (
                  <>
                    <button type="button" onClick={onStart} className="relative h-44 w-full cursor-pointer text-left">
                      <img src={getSessionImage(session)} alt={`Séance du jour : ${session.title}`} className="w-full h-full object-cover object-[50%_30%]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-4">
                        <span className="session-label px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest uppercase text-white">
                          Aujourd'hui
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="font-display text-xl font-bold text-white leading-tight">
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
                    <div className="px-5 py-4 bg-surface-card space-y-3">
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
                ) : (
                  <div className="p-8 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <img src="/images/illustration-empty-state.webp" alt="Pas de séance prévue" className="w-40 h-auto mx-auto mb-3 rounded-lg opacity-80" />
                      <p className="text-sm text-muted">Pas de séance aujourd'hui</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Séance de demain */}
              {!tomorrowLoading && tomorrowSession && (
                <TomorrowCard session={tomorrowSession} dateKey={tomorrowKey} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Feature : IA sur-mesure (Premium) ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Visuel : carrousel 3 modes de création (à gauche en desktop) */}
            <div className="order-2 md:order-1">
              <ScreenshotCarousel
                fit="contain"
                images={[
                  { src: '/images/screenshot-custom-session.webp', alt: 'Créer une séance — Mode Rapide' },
                  { src: '/images/screenshot-custom-detailed.webp', alt: 'Créer une séance — Mode Détaillé' },
                  { src: '/images/screenshot-custom-expert.webp', alt: 'Créer une séance — Mode Expert' },
                ]}
              />
            </div>

            {/* Texte (à droite en desktop) */}
            <div className="space-y-5 order-1 md:order-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-accent">IA sur-mesure</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Des séances créées<br />rien que pour toi
              </h2>
              <p className="text-muted leading-relaxed">
                L'intelligence artificielle génère des séances et des programmes adaptés à tes envies, ton niveau et tes objectifs.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Wand2, text: 'Séances personnalisées en quelques secondes' },
                  { icon: TrendingUp, text: 'Programmes sur-mesure avec progression intégrée' },
                  { icon: RotateCcw, text: 'S\'adapte à tes retours et ta forme du moment' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/tarifs"
                className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
              >
                Découvrir Premium
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Feature : Le player ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-5">
              <span className="text-xs font-bold tracking-widest uppercase text-brand">Entraînement guidé</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Tu n'as qu'à<br />suivre le rythme
              </h2>
              <p className="text-muted leading-relaxed">
                Chrono, compteur de reps, transitions automatiques — le player gère tout pour que tu restes concentré sur l'effort.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Play, text: 'Timer et reps guidés en temps réel' },
                  { icon: Shuffle, text: 'Enchaînement automatique des blocs' },
                  { icon: Zap, text: 'Signal sonore à chaque transition' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors cursor-pointer"
              >
                Lancer une séance
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Visuel : carrousel player */}
            <ScreenshotCarousel
              images={[
                { src: '/images/screenshot-player-reps.webp', alt: 'Player — exercice en reps' },
                { src: '/images/screenshot-player-emom.webp', alt: 'Player — EMOM avec timer' },
                { src: '/images/screenshot-player-hiit.webp', alt: 'Player — HIIT Mountain climbers' },
                { src: '/images/screenshot-player-cooldown.webp', alt: 'Player — Retour au calme' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 6. Feature : Programmes guidés ── */}
      <section className="px-6 md:px-10 lg:px-14 py-14 md:py-20 bg-surface-2/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texte */}
            <div className="space-y-5">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-secondary">Programmes guidés</span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-heading leading-tight">
                Un plan structuré<br />pour progresser
              </h2>
              <p className="text-muted leading-relaxed">
                Suis un programme complet avec progression intégrée, suivi détaillé et séances adaptées à chaque étape.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: ListChecks, text: '3 programmes inclus pour bien démarrer' },
                  { icon: Target, text: 'Suivi de complétion et objectifs clairs' },
                  { icon: Wand2, text: 'Des programmes sur mesure pour atteindre tes objectifs', premium: true },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-body">
                      {item.text}
                      {'premium' in item && item.premium && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full align-middle">Premium</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-secondary hover:text-brand-secondary/80 transition-colors"
              >
                Voir les programmes
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Visuel : carrousel programmes */}
            <ScreenshotCarousel
              fit="contain"
              images={[
                { src: '/images/screenshot-program-list.webp', alt: 'Liste des programmes disponibles' },
                { src: '/images/screenshot-program-objectif.webp', alt: 'Création de programme — Objectif' },
                { src: '/images/screenshot-program-profil.webp', alt: 'Création de programme — Profil' },
                { src: '/images/screenshot-program-config.webp', alt: 'Création de programme — Configuration' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── 6. CTA final ── */}
      <section className="px-6 md:px-10 lg:px-14 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-black text-heading">
            Prêt à commencer ?
          </h2>
          <p className="text-muted">
            Ta séance quotidienne t'attend — rejoins Wan2Fit et commence dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {supabase && (
              <Link
                to="/signup"
                className="cta-gradient px-8 py-4 rounded-full text-base font-bold text-white"
              >
                Créer mon compte gratuit
              </Link>
            )}
            <Link
              to="/decouvrir"
              className="text-sm text-link hover:text-link-hover transition-colors flex items-center gap-1"
            >
              Découvrir les formats
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────
   Active Program Card
   ──────────────────────────────────────────── */

/* ────────────────────────────────────────────
   Tomorrow Card — compact header + accordion
   ──────────────────────────────────────────── */

function TomorrowCard({ session, dateKey }: { session: Session; dateKey: string }) {
  const image = getSessionImage(session);
  const difficulty = computeDifficulty(session);

  return (
    <div className="rounded-2xl overflow-hidden border border-card-border">
      {/* Compact header */}
      <div className="flex items-stretch min-h-[100px]">
        {/* Thumbnail */}
        <div className="relative w-28 sm:w-36 shrink-0">
          <img src={image} alt={`Séance de demain : ${session.title}`} className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" loading="lazy" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="session-label-tomorrow px-2 py-0.5 rounded-md">
              <span className="text-xs font-bold text-white">Demain</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0 bg-surface-card">
          <p className="text-xs text-muted mb-1">{formatShortDate(dateKey)}</p>
          <h3 className="font-display text-base font-bold text-heading truncate">
            {session.title.toUpperCase()}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted">~{session.estimatedDuration} min</span>
            <span className="text-xs text-muted">·</span>
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
          </div>
        </div>
      </div>

      {/* Contenu détaillé */}
      <SessionAccordion session={session} />
    </div>
  );
}

