import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useDocumentHead } from '../hooks/useDocumentHead.ts';
import { useHealthCheck } from '../hooks/useHealthCheck.ts';
import { useProgram } from '../hooks/useProgram.ts';
import { useUserPrograms } from '../hooks/useUserPrograms.ts';
import type { Session } from '../types/session.ts';
import { getConsigneForWeek } from '../utils/coaching.ts';
import { FITNESS_COLORS, GOAL_COLORS } from '../utils/labels.ts';
import { getProgramImage } from '../utils/programImage.ts';
import { HealthDisclaimer } from './HealthDisclaimer.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { SessionAccordion } from './SessionAccordion.tsx';

export function ProgramPage() {
  const { t } = useTranslation('programs');
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { program, loading } = useProgram(slug, user?.id);
  const { deleteProgram } = useUserPrograms();
  const { showDisclaimer, guardNavigation, acceptAndNavigate, cancelDisclaimer } = useHealthCheck();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());
  const deleteDialogRef = useRef<HTMLDivElement>(null);

  useDocumentHead({
    title: program ? `${program.title} ${t('page.title_suffix')}` : t('page.title_suffix'),
    description: program?.description ?? undefined,
  });

  const isCustom = program && !program.is_fixed;

  // Determine current week based on completion progress
  const totalSessions = program?.sessions.length ?? 0;
  const completedCount = program?.sessions.filter((s) => program.completedSessionIds.has(s.id)).length ?? 0;
  const progressPct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const nextSessionOrder = program?.sessions.find((s) => !program.completedSessionIds.has(s.id))?.session_order;

  // Group sessions by week
  const byWeek = new Map<number, NonNullable<typeof program>['sessions']>();
  if (program) {
    for (const s of program.sessions) {
      if (!byWeek.has(s.week_number)) byWeek.set(s.week_number, []);
      byWeek.get(s.week_number)!.push(s);
    }
  }

  // Find current week (week containing next uncompleted session)
  const currentWeek = program?.sessions.find((s) => s.session_order === nextSessionOrder)?.week_number ?? 1;

  // Initialize collapsed weeks: future weeks collapsed by default for custom programs.
  // All used values (isCustom, byWeek, currentWeek) are derived deterministically from
  // program — re-running only when program identity changes is correct (byWeek is
  // rebuilt fresh each render so depending on it would re-fire this effect every render).
  // biome-ignore lint/correctness/useExhaustiveDependencies: program?.id is the intentional narrower trigger; see comment above.
  useEffect(() => {
    if (!program || !isCustom) return;
    const weeks = [...byWeek.keys()];
    const collapsed = new Set<number>();
    for (const w of weeks) {
      if (w > currentWeek) collapsed.add(w);
    }
    setCollapsedWeeks(collapsed);
  }, [program?.id]);

  // Focus trap for delete modal
  useEffect(() => {
    if (!showDeleteModal) return;
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>('button:not(:disabled)');
    if (focusable.length > 0) focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowDeleteModal(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusableEls = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled)');
        if (!focusableEls || focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal]);

  if (!slug) return <Navigate to="/programmes" replace />;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted">{t('page.not_found')}</p>
        <Link to="/programmes" className="text-link hover:text-link-hover underline text-sm">
          {t('page.see_all')}
        </Link>
      </div>
    );
  }

  const handleStartSession = (order: number) => {
    guardNavigation(`/programme/${slug}/seance/${order}/play`);
  };

  const toggleWeek = (week: number) => {
    setCollapsedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!program) return;
    setDeleting(true);
    const ok = await deleteProgram(program.id);
    setDeleting(false);
    if (ok) {
      navigate('/programmes?deleted=1');
    }
  };

  return (
    <>
      {showDisclaimer && <HealthDisclaimer onAccept={acceptAndNavigate} onCancel={cancelDisclaimer} />}

      {/* Delete modal */}
      {showDeleteModal && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is wired in the keydown effect above; the click here is the pointer-only click-outside dismissal.
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20 sm:pb-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-program-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div
            ref={deleteDialogRef}
            className="bg-surface-card w-full max-w-sm rounded-2xl shadow-2xl border border-card-border p-6 space-y-4"
          >
            <h2 id="delete-program-title" className="text-lg font-bold text-heading">
              {t('page.delete_modal_title')}
            </h2>
            <p className="text-sm text-muted">{t('page.delete_modal_body')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-divider text-muted hover:text-heading transition-colors cursor-pointer"
              >
                {t('page.delete_cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? t('page.deleting') : t('page.delete_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="space-y-5 -mx-6 -mt-8 md:mx-0 md:mt-0">
          <div className="relative min-h-[220px] sm:min-h-[280px] md:rounded-2xl overflow-hidden">
            <img
              src={getProgramImage(program.slug, program.goals)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/75" />

            <div className="relative z-10 flex flex-col justify-between min-h-[220px] sm:min-h-[280px] p-6">
              <div className="flex items-start justify-between">
                <Link
                  to="/programmes"
                  className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors cursor-pointer w-fit"
                >
                  <svg
                    aria-hidden="true"
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
                  {t('page.back')}
                </Link>

                {isCustom && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand/20 border border-brand/30 text-brand backdrop-blur-sm">
                    {t('page.ai_badge')}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-block backdrop-blur-sm ${
                    FITNESS_COLORS[program.fitness_level] ?? ''
                  }`}
                >
                  {t(`fitness_level.${program.fitness_level}`) ?? program.fitness_level}
                </span>

                <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-white">
                  {program.title}
                </h1>

                {program.description && <p className="text-sm leading-relaxed text-white/70">{program.description}</p>}

                <div className={`flex items-center gap-3 text-xs ${isCustom ? 'text-faint' : 'text-white/50'}`}>
                  <span className="flex items-center gap-1.5">
                    <svg
                      aria-hidden="true"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {t('page.weeks_label', { n: program.duration_weeks })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      aria-hidden="true"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    {t('page.freq_label', { n: program.frequency_per_week })}
                  </span>
                </div>

                {program.goals.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {program.goals.map((goal) => (
                      <li
                        key={goal}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${GOAL_COLORS[goal] ?? 'bg-rose-400/80'}`}
                      >
                        {t(`goal.${goal}`) ?? goal}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Auth gate */}
        {!user && (
          <div className="glass-card rounded-2xl p-6 text-center space-y-4">
            <p className="text-sm text-subtle">{t('page.auth_gate')}</p>
            <Link
              to="/login"
              className="inline-block cta-gradient px-8 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer"
            >
              {t('page.login')}
            </Link>
          </div>
        )}

        {/* Progress bar */}
        {user && totalSessions > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-heading">{t('page.progression')}</span>
              <span className="text-muted">
                {t('page.sessions_with_pct', { completed: completedCount, total: totalSessions, pct: progressPct })}
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

        {/* Note coach */}
        {isCustom && program.note_coach && (
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand space-y-2">
            <h2 className="text-sm font-bold text-heading">{t('page.coach_note')}</h2>
            <p className="text-sm text-subtle leading-relaxed">{program.note_coach}</p>
          </div>
        )}

        {/* Sessions by week */}
        {[...byWeek.entries()].map(([week, sessions]) => {
          const isCollapsed = collapsedWeeks.has(week);
          const consigne = isCustom ? getConsigneForWeek(program.consignes_semaine, week) : null;

          return (
            <section key={week} className="space-y-3">
              <button
                type="button"
                onClick={() => isCustom && toggleWeek(week)}
                className={`flex items-center gap-2 w-full text-left ${isCustom ? 'cursor-pointer' : ''}`}
                aria-expanded={isCustom ? !isCollapsed : undefined}
              >
                <h2 className="text-sm font-bold uppercase tracking-wider text-subtle">
                  {t('page.week', { n: week })}
                </h2>
                {isCustom && (
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`text-faint transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>

              {consigne && !isCollapsed && (
                <div className="flex gap-2.5 items-start rounded-lg bg-accent/10 border border-accent/20 px-3 py-2.5">
                  <span className="text-sm mt-0.5 shrink-0" aria-hidden="true">
                    💡
                  </span>
                  <p className="text-sm text-body leading-relaxed">{consigne}</p>
                </div>
              )}

              {!isCollapsed && (
                <div className="space-y-3">
                  {sessions.map((ps) => {
                    const data = ps.session_data as Session;
                    const isDone = user ? program.completedSessionIds.has(ps.id) : false;
                    const isSuggested = user && ps.session_order === nextSessionOrder;

                    return (
                      <div
                        key={ps.id}
                        className={`glass-card rounded-2xl overflow-hidden transition-all ${
                          isSuggested ? 'border-brand/30 ring-1 ring-brand/10' : ''
                        } ${isDone ? 'opacity-60' : ''}`}
                      >
                        <div className="p-5 flex items-center gap-4">
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
                              <svg
                                aria-hidden="true"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              ps.session_order
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold truncate text-heading">{data.title}</h3>
                            <p className="text-xs text-muted truncate mt-0.5">{data.description}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-faint">
                              <span>{t('page.duration_min', { n: data.estimatedDuration })}</span>
                              <span>·</span>
                              <span>{t('page.blocks', { n: data.blocks.length })}</span>
                            </div>
                          </div>

                          {user && isSuggested && (
                            <button
                              type="button"
                              onClick={() => handleStartSession(ps.session_order)}
                              className="shrink-0 px-5 py-2.5 rounded-full text-sm font-bold cta-gradient text-white cursor-pointer"
                            >
                              {completedCount === 0 ? t('page.session_start') : t('page.session_continue')}
                            </button>
                          )}
                          {user && isDone && (
                            <button
                              type="button"
                              onClick={() => handleStartSession(ps.session_order)}
                              className="shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-white/5 text-subtle hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              {t('page.session_redo')}
                            </button>
                          )}
                          {user && !isSuggested && !isDone && (
                            <button
                              type="button"
                              onClick={() => handleStartSession(ps.session_order)}
                              className="shrink-0 px-4 py-2 rounded-full text-xs font-medium text-muted hover:text-subtle hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              {t('page.session_launch')}
                            </button>
                          )}
                        </div>

                        <SessionAccordion session={data} />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {/* Progression info */}
        {isCustom && program.progression && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-heading">{t('page.progression_logic')}</h2>
            <p className="text-sm text-subtle leading-relaxed">{program.progression.logique}</p>
            {program.progression.cible_semaine_3 && (
              <p className="text-xs text-muted">
                {t('page.week_target', { n: 3, target: program.progression.cible_semaine_3 })}
              </p>
            )}
            {program.progression.cible_semaine_6 && (
              <p className="text-xs text-muted">
                {t('page.week_target', { n: 6, target: program.progression.cible_semaine_6 })}
              </p>
            )}
            {program.progression.cible_semaine_8 && (
              <p className="text-xs text-muted">
                {t('page.week_target', { n: 8, target: program.progression.cible_semaine_8 })}
              </p>
            )}
            {program.progression.cible_semaine_12 && (
              <p className="text-xs text-muted">
                {t('page.week_target', { n: 12, target: program.progression.cible_semaine_12 })}
              </p>
            )}
          </div>
        )}

        {/* Delete button for custom programs */}
        {isCustom && user && program.user_id === user.id && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="text-xs text-faint hover:text-red-400 transition-colors cursor-pointer"
            >
              {t('page.delete_button')}
            </button>
          </div>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-divider">
          <Link
            to="/programmes"
            className="text-sm text-muted hover:text-body transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg
              aria-hidden="true"
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
            {t('page.all_programs')}
          </Link>
        </div>
      </div>
    </>
  );
}
