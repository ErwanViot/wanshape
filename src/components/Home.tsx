import { useState } from 'react';
import { Link } from 'react-router';
import { BLOCK_COLORS } from '../engine/constants.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useHistory } from '../hooks/useHistory.ts';
import { useSession } from '../hooks/useSession.ts';
import { supabase } from '../lib/supabase.ts';
import type { Block, Session } from '../types/session.ts';
import { getTodayKey, getTomorrowKey, parseDDMMYYYY } from '../utils/date.ts';
import { computeDifficulty } from '../utils/sessionDifficulty.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import { computeTimeline, formatBlockDuration } from '../utils/sessionTimeline.ts';
import { getExerciseLink } from '../utils/exerciseLinks.ts';
import { Footer } from './Footer.tsx';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';

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

      <div className="px-6 md:px-10 lg:px-14 pb-8 max-w-2xl mx-auto">
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
            userId={user.id}
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
  userId,
}: {
  session: Session | null;
  loading: boolean;
  error: string | null;
  tomorrowSession: Session | null;
  tomorrowLoading: boolean;
  todayKey: string;
  tomorrowKey: string;
  onStart: () => void;
  userId: string;
}) {
  const { streak, totalSessions, totalDuration, loading: historyLoading } = useHistory(userId);
  const totalMinutes = Math.round(totalDuration / 60);

  return (
    <div className="space-y-5 pt-4 md:pt-0">
      {/* Mobile brand */}
      <MobileBrand />

      <h1 className="sr-only">WAN SHAPE — Votre séance de sport quotidienne</h1>

      {/* Inline streak */}
      {!historyLoading && totalSessions > 0 && (
        <p className="text-sm text-muted">
          <span role="img" aria-label="Flamme">
            🔥
          </span>{' '}
          {streak} jour{streak > 1 ? 's' : ''} · {totalSessions} séance{totalSessions > 1 ? 's' : ''} ·{' '}
          {totalMinutes} min
        </p>
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

      {/* Programme suggestion */}
      <Link
        to="/programmes"
        className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 group transition-colors hover:border-brand/30"
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
    <div className="space-y-8 pt-4 md:pt-0">
      {/* Hero */}
      <section className="text-center space-y-6">
        {/* Mobile brand */}
        <MobileBrand className="justify-center" />

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-heading leading-tight">
          Chaque jour, une séance différente.
          <br />
          <span className="text-muted font-bold">Sans matériel. Sans excuses.</span>
        </h1>

        <ul className="space-y-2.5 text-left max-w-sm mx-auto">
          <li className="flex items-center gap-3 text-sm text-body">
            <span className="text-brand font-bold" aria-hidden="true">
              ✓
            </span>
            8 formats variés — HIIT, Tabata, Circuit…
          </li>
          <li className="flex items-center gap-3 text-sm text-body">
            <span className="text-brand font-bold" aria-hidden="true">
              ✓
            </span>
            25-40 min, chrono guidé du début à la fin
          </li>
          <li className="flex items-center gap-3 text-sm text-body">
            <span className="text-brand font-bold" aria-hidden="true">
              ✓
            </span>
            100 % gratuit, zéro matériel
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {supabase && (
            <Link to="/signup" className="cta-gradient px-6 py-3 rounded-xl text-sm font-bold text-white">
              Créer un compte gratuit
            </Link>
          )}
          <button
            type="button"
            onClick={onStart}
            className="px-6 py-3 rounded-xl text-sm font-bold text-brand border border-brand/30 hover:bg-brand/5 transition-colors"
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
   Mobile brand (md:hidden)
   ──────────────────────────────────────────── */

function MobileBrand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 md:hidden ${className}`}>
      <img
        src="/logo-wansoft.png"
        alt=""
        className="w-7 h-7 shrink-0"
        style={{
          filter:
            'brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(4438%) hue-rotate(233deg) brightness(91%) contrast(96%)',
        }}
      />
      <span className="text-lg font-extrabold tracking-tight gradient-text">Wan Shape</span>
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
  const [showDetail, setShowDetail] = useState(false);

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

      {/* Accordion toggle */}
      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="w-full px-5 py-3 flex items-center justify-between bg-surface-card border-t border-divider text-sm"
      >
        <span className="text-muted font-medium">Contenu de la séance</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted transition-transform ${showDetail ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Accordion content */}
      {showDetail && <SessionDetail session={session} />}
    </div>
  );
}

/* ────────────────────────────────────────────
   Session detail (accordion content)
   ──────────────────────────────────────────── */

function SessionDetail({ session }: { session: Session }) {
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="bg-surface-card px-5 pb-5 space-y-3">
      {session.blocks.map((block, i) => {
        const seg = timeline[i];
        const color = BLOCK_COLORS[seg.type];
        const exercises = getBlockExercises(block);
        return (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {seg.label} · {i + 1}/{session.blocks.length}
              </span>
              <span className="text-xs text-muted ml-auto">{getBlockMeta(block)}</span>
            </div>
            <div className="pl-4 space-y-0.5">
              {exercises.map((ex, j) => (
                <div key={j} className="flex items-baseline gap-2 text-xs">
                  <ExerciseName name={ex.name} />
                  <span className="text-faint">{ex.detail}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Mini timeline */}
      <div className="flex gap-1 pt-2">
        {timeline.map((t, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{
              width: `${(t.duration / (totalDuration || 1)) * 100}%`,
              backgroundColor: BLOCK_COLORS[t.type],
              opacity: t.isAccent ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        {session.blocks.length} blocs · ~{formatBlockDuration(totalDuration)} estimées
      </p>
    </div>
  );
}

function ExerciseName({ name }: { name: string }) {
  const link = getExerciseLink(name);
  if (!link) {
    return <span className="text-body">{name}</span>;
  }
  const to = `/exercices/${link.slug}${link.anchor ? `#${link.anchor}` : ''}`;
  return (
    <Link
      to={to}
      className="text-link hover:text-link-hover transition-colors underline underline-offset-2 decoration-link/30"
    >
      {name}
    </Link>
  );
}

/* ────────────────────────────────────────────
   Block exercise helpers (adapted from SessionRecap)
   ──────────────────────────────────────────── */

interface ExerciseInfo {
  name: string;
  detail: string;
}

function getBlockExercises(block: Block): ExerciseInfo[] {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: ex.bilateral ? `${ex.duration}s × 2 côtés` : `${ex.duration}s`,
      }));
    case 'classic':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${ex.sets} × ${ex.reps === 'max' ? 'max' : ex.reps} reps`,
      }));
    case 'circuit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: ex.mode === 'timed' ? `${ex.duration}s` : `${ex.reps} reps`,
      }));
    case 'hiit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.work}s effort`,
      }));
    case 'tabata':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.work ?? 20}s / ${block.rest ?? 10}s`,
      }));
    case 'emom':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
      }));
    case 'amrap':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
      }));
    case 'superset':
      return block.pairs.flatMap((pair, pi) =>
        pair.exercises.map((ex) => ({
          name: ex.name,
          detail: `× ${ex.reps} · paire ${pi + 1}`,
        })),
      );
    case 'pyramid':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.pattern.join(' - ')} reps`,
      }));
  }
}

function getBlockMeta(block: Block): string {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return `${block.exercises.length} exercices`;
    case 'classic':
      return `${block.exercises.length} exercices`;
    case 'circuit':
      return `${block.rounds} rounds × ${block.exercises.length} exos`;
    case 'hiit':
      return `${block.rounds} rounds · ${block.work}s/${block.rest}s`;
    case 'tabata': {
      const sets = block.sets ?? 1;
      const rounds = block.rounds ?? 8;
      return sets > 1 ? `${sets} sets × ${rounds} rounds` : `${rounds} rounds`;
    }
    case 'emom':
      return `${block.minutes} minutes`;
    case 'amrap':
      return `${Math.floor(block.duration / 60)} minutes`;
    case 'superset':
      return `${block.sets} séries · ${block.pairs.length} paires`;
    case 'pyramid':
      return `${block.pattern.length} paliers`;
  }
}
