import { Link } from 'react-router';
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

  useDocumentHead({
    title: 'WAN SHAPE',
    description:
      "Chaque jour, une séance de sport guidée sans matériel. 8 formats d'entraînement, 25-40 min, 100% gratuit.",
  });

  const handleStartSession = () => {
    guardNavigation('/seance/play');
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}

      <div className="px-6 md:px-10 lg:px-14 pb-8 max-w-3xl mx-auto">
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
      </div>

      <Footer />
    </>
  );
}

/* ────────────────────────────────────────────
   Connected user
   ──────────────────────────────────────────── */

function ConnectedContent({
  session,
  loading,
  error,
  tomorrowSession,
  tomorrowLoading,
  todayKey,
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
  const { user } = useAuth();
  const { activeProgram } = useActiveProgram(user?.id);

  const progressPct =
    activeProgram && activeProgram.totalSessions > 0
      ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
      : 0;

  return (
    <div className="space-y-5 pt-6 md:pt-4">
      <h1 className="sr-only">WAN SHAPE — Votre séance de sport quotidienne</h1>

      {/* Programme — active or discovery */}
      {activeProgram ? (
        <div className="rounded-2xl overflow-hidden border border-card-border">
          {/* Image hero with title + progress */}
          <Link
            to={`/programme/${activeProgram.slug}`}
            className="relative block min-h-[220px] flex flex-col cursor-pointer group"
          >
            <img
              src={getProgramImage(activeProgram.slug)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-black/30" />

            <div className="relative z-10 flex flex-col justify-between flex-1 p-6 min-h-[220px]">
              <div>
                <div className="session-label px-3 py-1 rounded-lg inline-block mb-3">
                  <span className="text-xs font-bold tracking-widest uppercase text-white">Continuer mon programme</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black leading-none tracking-tight text-white group-hover:text-white/90 transition-colors mb-4">
                  {activeProgram.title.toUpperCase()}
                </h2>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
                  <span>
                    {activeProgram.completedCount}/{activeProgram.totalSessions} séances
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>

          {/* Next session CTA */}
          {activeProgram.nextSessionTitle && activeProgram.nextSessionOrder !== null && (
            <Link
              to={`/programme/${activeProgram.slug}`}
              className="flex items-center gap-3 px-5 py-3.5 bg-surface-card border border-card-border border-t-0 rounded-b-2xl cursor-pointer group/next"
            >
              <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">Prochaine séance</p>
                <p className="text-sm font-semibold text-heading group-hover/next:text-brand transition-colors truncate">
                  {activeProgram.nextSessionTitle}
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
          )}
        </div>
      ) : (
        <Link
          to="/programmes"
          className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 group transition-colors hover:border-brand/30 cursor-pointer"
        >
          <span className="text-lg shrink-0" role="img" aria-label="Programme">
            📋
          </span>
          <span className="text-sm text-subtle group-hover:text-heading transition-colors">
            Envie de structure ? Voir nos programmes
          </span>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-muted ml-auto shrink-0"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}

      {/* Today */}
      <SessionCard
        session={session}
        loading={loading}
        error={error}
        dateKey={todayKey}
        badge="Séance du jour"
        onStart={onStart}
      />

      {/* Tomorrow */}
      {!tomorrowLoading && tomorrowSession && (
        <SessionCard
          session={tomorrowSession}
          loading={false}
          error={null}
          dateKey={tomorrowKey}
          badge="Séance de demain"
          variant="tomorrow"
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Visitor
   ──────────────────────────────────────────── */

function VisitorContent({
  session,
  loading,
  error,
  tomorrowSession,
  tomorrowLoading,
  todayKey,
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
    <div className="space-y-10 pt-6 md:pt-0">
      {/* Hero — typography-first, Behance-inspired */}
      <section className="text-center space-y-8 py-6 md:py-14">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-heading leading-[1.1]">
          Votre séance de sport
          <br />
          <span className="gradient-text">guidée au quotidien</span>
        </h1>

        <p className="text-base md:text-lg text-muted max-w-md mx-auto leading-relaxed">
          8 formats d'entraînement variés, 25 à 40 minutes, sans matériel.
          Chaque jour une séance différente, 100&nbsp;% gratuit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {supabase && (
            <Link to="/signup" className="cta-gradient px-8 py-3.5 rounded-full text-sm font-bold text-white">
              Créer un compte gratuit
            </Link>
          )}
          <button
            type="button"
            onClick={onStart}
            className="px-8 py-3.5 rounded-full text-sm font-bold text-brand border border-brand/30 hover:bg-brand/5 transition-colors cursor-pointer"
          >
            Essayer la séance du jour
          </button>
        </div>
      </section>

      {/* Session preview */}
      <SessionCard session={session} loading={loading} error={error} dateKey={todayKey} badge="Séance du jour" onStart={onStart} />

      {/* Tomorrow */}
      {!tomorrowLoading && tomorrowSession && (
        <SessionCard
          session={tomorrowSession}
          loading={false}
          error={null}
          dateKey={tomorrowKey}
          badge="Séance de demain"
          variant="tomorrow"
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Session card with accordion
   ──────────────────────────────────────────── */

function SessionCard({
  session,
  loading,
  error,
  dateKey,
  badge,
  variant = 'today',
  onStart,
}: {
  session: Session | null;
  loading: boolean;
  error: string | null;
  dateKey: string;
  badge: string;
  variant?: 'today' | 'tomorrow';
  onStart?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[260px] rounded-2xl glass-card">
        <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px] rounded-2xl glass-card">
        <div className="text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="text-body text-lg font-medium">Pas de séance prévue aujourd'hui.</p>
          <p className="text-faint text-sm mt-2">Profitez-en pour récupérer !</p>
        </div>
      </div>
    );
  }

  const image = getSessionImage(session);
  const difficulty = computeDifficulty(session);
  const isTomorrow = variant === 'tomorrow';

  return (
    <div className="rounded-2xl overflow-hidden border border-card-border">
      {/* Image hero */}
      <div className="relative min-h-[260px] flex flex-col">
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            loading={isTomorrow ? 'lazy' : 'eager'}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              isTomorrow ? 'from-black/90 via-black/55 to-black/35' : 'from-black/85 via-black/50 to-black/30'
            }`}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between flex-1 p-6">
          <div>
            <div
              className={`${isTomorrow ? 'session-label-tomorrow' : 'session-label'} px-3 py-1 rounded-lg inline-block mb-3`}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-white">{badge}</span>
            </div>

            <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-2">
              {formatShortDate(dateKey)}
            </p>

            <h2 className="text-3xl md:text-4xl font-black leading-none tracking-tight text-white mb-3">
              {session.title.toUpperCase()}
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              {session.focus.slice(0, 2).map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80"
                >
                  {f}
                </span>
              ))}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80">
                ~{session.estimatedDuration} min
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  difficulty.level === 'accessible'
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                    : difficulty.level === 'modere'
                      ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                      : 'bg-red-500/20 border-red-400/30 text-red-300'
                }`}
              >
                {difficulty.label}
              </span>
            </div>
          </div>

          {onStart && (
            <button
              type="button"
              onClick={onStart}
              className="cta-gradient w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-wide cursor-pointer mt-6"
            >
              C'est parti
            </button>
          )}
        </div>
      </div>

      {/* Accordion */}
      <SessionAccordion session={session} />
    </div>
  );
}

