import { Link, Navigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useProgram } from '../hooks/useProgram.ts';
import type { Session } from '../types/session.ts';
import { getProgramImage } from '../utils/programImage.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { SessionAccordion } from './SessionAccordion.tsx';

const FITNESS_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const FITNESS_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
  intermediate: 'bg-amber-500/30 text-amber-200 border-amber-400/40',
  advanced: 'bg-red-500/30 text-red-200 border-red-400/40',
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

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Hero image */}
        <section className="space-y-5 -mx-6 -mt-8 md:mx-0 md:mt-0">
          <div className="relative min-h-[220px] sm:min-h-[280px] md:rounded-2xl overflow-hidden">
            <img
              src={getProgramImage(program.slug)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/75" />

            <div className="relative z-10 flex flex-col justify-between min-h-[220px] sm:min-h-[280px] p-6">
              {/* Back link */}
              <Link
                to="/programmes"
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors cursor-pointer w-fit"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Programmes
              </Link>

              {/* Info */}
              <div className="space-y-3">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-block backdrop-blur-sm ${
                    FITNESS_COLORS[program.fitness_level] ?? ''
                  }`}
                >
                  {FITNESS_LABELS[program.fitness_level] ?? program.fitness_level}
                </span>

                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  {program.title}
                </h1>

                {program.description && (
                  <p className="text-sm text-white/70 leading-relaxed">{program.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {program.duration_weeks} semaines
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    {program.frequency_per_week}x / semaine
                  </span>
                </div>

                {program.goals.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {program.goals.map((goal) => (
                      <li
                        key={goal}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/70"
                      >
                        {goal}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Auth gate for non-connected users */}
        {!user && (
          <div className="glass-card rounded-2xl p-6 text-center space-y-4">
            <p className="text-sm text-subtle">
              Connectez-vous pour suivre ce programme et enregistrer votre progression.
            </p>
            <Link to="/login" className="inline-block cta-gradient px-8 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer">
              Se connecter
            </Link>
          </div>
        )}

        {/* Progress bar (logged-in only) */}
        {user && totalSessions > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-heading">Progression</span>
              <span className="text-muted">
                {completedCount}/{totalSessions} séances ({progressPct}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-secondary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Sessions by week */}
        {[...byWeek.entries()].map(([week, sessions]) => (
          <section key={week} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">Semaine {week}</h2>
            <div className="space-y-3">
              {sessions.map((ps) => {
                const data = ps.session_data as unknown as Session;
                const isDone = user ? program.completedSessionIds.has(ps.id) : false;
                const isSuggested = user && ps.session_order === nextSessionOrder;

                return (
                  <div
                    key={ps.id}
                    className={`glass-card rounded-2xl overflow-hidden transition-all ${
                      isSuggested ? 'border-brand/30 ring-1 ring-brand/10' : ''
                    } ${isDone ? 'opacity-60' : ''}`}
                  >
                    {/* Session header */}
                    <div className="p-5 flex items-center gap-4">
                      {/* Status indicator */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isSuggested
                              ? 'bg-brand/20 text-brand'
                              : 'bg-white/5 text-muted'
                        }`}
                      >
                        {isDone ? (
                          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          ps.session_order
                        )}
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate text-heading">
                          {data.title}
                        </h3>
                        <p className="text-xs text-muted truncate mt-0.5">{data.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-faint">
                          <span>~{data.estimatedDuration} min</span>
                          <span>·</span>
                          <span>{data.blocks.length} blocs</span>
                        </div>
                      </div>

                      {/* CTA */}
                      {user && isSuggested && (
                        <button
                          type="button"
                          onClick={() => handleStartSession(ps.session_order)}
                          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-bold cta-gradient text-white cursor-pointer"
                        >
                          {completedCount === 0 ? 'Commencer' : 'Continuer'}
                        </button>
                      )}
                      {user && isDone && (
                        <button
                          type="button"
                          onClick={() => handleStartSession(ps.session_order)}
                          className="shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-white/5 text-subtle hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Refaire
                        </button>
                      )}
                      {user && !isSuggested && !isDone && (
                        <button
                          type="button"
                          onClick={() => handleStartSession(ps.session_order)}
                          className="shrink-0 px-4 py-2 rounded-full text-xs font-medium text-muted hover:text-subtle hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Lancer
                        </button>
                      )}
                    </div>

                    {/* Accordion details */}
                    <SessionAccordion session={data} />
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
            className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Tous les programmes
          </Link>
        </div>
      </div>
    </>
  );
}
