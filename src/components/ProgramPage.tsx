import { Link, Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useProgram } from '../hooks/useProgram.ts';
import type { Session } from '../types/session.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';

const FITNESS_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export function ProgramPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { program, loading } = useProgram(slug);
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();

  useDocumentHead({
    title: program ? `${program.title} — Programme` : 'Programme',
    description: program?.description ?? undefined,
  });

  if (!slug) return <Navigate to="/programmes" replace />;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted">Programme introuvable ou service indisponible.</p>
        <Link to="/programmes" className="text-link hover:text-link-hover underline text-sm">
          Voir tous les programmes
        </Link>
      </div>
    );
  }

  const totalSessions = program.sessions.length;
  const completedCount = program.sessions.filter((s) => program.completedSessionIds.has(s.id)).length;
  const progressPct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Find the next session to do (first uncompleted in order)
  const nextSessionOrder = program.sessions.find((s) => !program.completedSessionIds.has(s.id))?.session_order;

  // Group sessions by week
  const byWeek = new Map<number, typeof program.sessions>();
  for (const s of program.sessions) {
    const week = s.week_number;
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)!.push(s);
  }

  const handleStartSession = (order: number) => {
    guardNavigation(`/programme/${slug}/seance/${order}/play`);
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}

      <header className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to="/programmes"
            className="p-1 -ml-1 text-muted hover:text-strong transition-colors"
            aria-label="Retour aux programmes"
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
          <h1 className="font-bold text-lg text-heading">{program.title}</h1>
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Program info */}
        <div className="space-y-3">
          {program.description && <p className="text-sm text-subtle leading-relaxed">{program.description}</p>}
          <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
            <span>{FITNESS_LABELS[program.fitness_level] ?? program.fitness_level}</span>
            <span className="text-divider-strong">·</span>
            <span>{program.duration_weeks} semaines</span>
            <span className="text-divider-strong">·</span>
            <span>{program.frequency_per_week}x / semaine</span>
          </div>
          {program.goals.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {program.goals.map((goal) => (
                <li
                  key={goal}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-subtle"
                >
                  {goal}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Auth gate for non-connected users */}
        {!user && (
          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm text-subtle">
              Connectez-vous pour suivre ce programme et enregistrer votre progression.
            </p>
            <Link to="/login" className="inline-block cta-gradient px-6 py-3 rounded-xl text-sm font-bold text-white">
              Se connecter
            </Link>
          </div>
        )}

        {/* Progress bar (logged-in only) */}
        {user && totalSessions > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Progression</span>
              <span>
                {completedCount}/{totalSessions} séances ({progressPct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Sessions by week */}
        {[...byWeek.entries()].map(([week, sessions]) => (
          <section key={week} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Semaine {week}</h2>
            <div className="space-y-2">
              {sessions.map((ps) => {
                const data = ps.session_data as unknown as Session;
                const isDone = user ? program.completedSessionIds.has(ps.id) : false;
                const isNext = user && ps.session_order === nextSessionOrder;
                const isLocked = user ? !isDone && !isNext : true;

                return (
                  <div
                    key={ps.id}
                    className={`glass-card rounded-xl p-4 flex items-center gap-4 ${isLocked ? 'opacity-50' : isDone ? 'opacity-70' : ''}`}
                  >
                    {/* Status indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isNext
                            ? 'bg-brand/20 text-brand'
                            : 'bg-white/5 text-muted'
                      }`}
                    >
                      {isDone ? '✓' : isLocked ? <LockIcon /> : ps.session_order}
                    </div>

                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-heading truncate">{data.title}</h3>
                      {!isLocked && <p className="text-xs text-muted truncate">{data.description}</p>}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-faint">
                        <span>~{data.estimatedDuration} min</span>
                        <span>·</span>
                        <span>{data.blocks.length} blocs</span>
                      </div>
                    </div>

                    {/* CTA */}
                    {isNext && (
                      <button
                        type="button"
                        onClick={() => handleStartSession(ps.session_order)}
                        className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold cta-gradient text-white"
                      >
                        {completedCount === 0 ? 'Commencer' : 'Continuer'}
                      </button>
                    )}
                    {isDone && (
                      <button
                        type="button"
                        onClick={() => handleStartSession(ps.session_order)}
                        className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-subtle hover:bg-white/10 transition-colors"
                      >
                        Refaire
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Back link */}
        <div className="pt-4 border-t border-divider">
          <Link
            to="/programmes"
            className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Tous les programmes
          </Link>
        </div>
      </main>
    </>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
