import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useHistory } from '../../hooks/useHistory.ts';
import { useActiveProgram } from '../../hooks/useProgram.ts';
import { WeeklyBarChart } from '../stats/WeeklyBarChart.tsx';
import { WeekDots } from '../stats/WeekDots.tsx';
import { ProgramCard } from '../stats/ProgramCard.tsx';
import { RecentSessions } from '../stats/RecentSessions.tsx';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}`;
  return `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
}

function formatDurationUnit(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  if (h === 0) return 'min';
  return '';
}

interface WeekMessage { emoji: string; title: string; subtitle: string }

function getWeekMessage(sessions: number): WeekMessage {
  const dayOfWeek = new Date().getDay(); // 0 = dimanche
  const isEndOfWeek = dayOfWeek === 0 || dayOfWeek === 6;

  if (sessions === 0) {
    return isEndOfWeek
      ? { emoji: '😌', title: 'Week-end mérité', subtitle: 'Recharge les batteries, lundi on envoie du lourd.' }
      : { emoji: '🚀', title: 'Nouvelle semaine', subtitle: 'Prêt à t\'entraîner ?' };
  }
  if (sessions === 1) {
    return isEndOfWeek
      ? { emoji: '💪', title: 'Séance validée', subtitle: 'Belle semaine ! Récupère bien, la suite va être énorme.' }
      : { emoji: '🔥', title: 'Première séance validée', subtitle: 'Le plus dur est fait.' };
  }
  if (sessions === 2) return { emoji: '💪', title: 'Bien lancé', subtitle: 'Tu construis quelque chose de solide.' };
  if (sessions === 3) return { emoji: '🚀', title: 'Rythme parfait', subtitle: 'Tu es sur la bonne lancée.' };
  if (sessions === 4) return { emoji: '🔥', title: 'Impressionnant', subtitle: 'Tu dépasses tes objectifs.' };
  return { emoji: '⚠️', title: 'Attention au surmenage', subtitle: 'Ton corps progresse au repos. Souffle un peu !' };
}

const WEEK_CARD_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  idle:    { bg: 'from-slate-500/10 to-slate-500/5',     border: 'border-slate-500/20',   text: 'text-body' },
  start:   { bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-300' },
  cruise:  { bg: 'from-blue-500/20 to-blue-500/5',       border: 'border-blue-500/30',    text: 'text-blue-700 dark:text-blue-300' },
  peak:    { bg: 'from-violet-500/25 to-violet-500/5',   border: 'border-violet-500/30',  text: 'text-violet-700 dark:text-violet-300' },
  warning: { bg: 'from-amber-500/25 to-amber-500/5',     border: 'border-amber-500/30',   text: 'text-amber-700 dark:text-amber-300' },
};

function weekCardStyle(sessions: number) {
  if (sessions === 0) return WEEK_CARD_STYLES.idle;
  if (sessions <= 2) return WEEK_CARD_STYLES.start;
  if (sessions <= 3) return WEEK_CARD_STYLES.cruise;
  if (sessions === 4) return WEEK_CARD_STYLES.peak;
  return WEEK_CARD_STYLES.warning;
}

export function StatsPage() {
  const { user } = useAuth();
  const { completions, totalSessions, totalDuration, weekDots, weeklyChart, thisWeekSessions, loading } = useHistory(user?.id);
  const { activeProgram } = useActiveProgram(user?.id);

  useDocumentHead({
    title: 'Suivi',
    description: 'Tableau de bord sportif Wan2Fit.',
  });

  const progressPct = activeProgram && activeProgram.totalSessions > 0
    ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-divider-strong border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="flex-1 px-6 md:px-10 lg:px-14 py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto">
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-black text-heading">Pas encore de stats</h1>
          <p className="text-body text-sm">
            Lance ta première séance pour commencer à suivre ta progression ici.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors">
            Séance du jour
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-10 lg:px-14 py-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="font-display text-2xl md:text-3xl font-black text-heading">Chaque effort compte</h1>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

          {/* Metric: Total sessions */}
          <div className="rounded-2xl bg-brand p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Séances</div>
            <div className="font-display text-4xl md:text-5xl font-black leading-none">{totalSessions}</div>
            <div className="text-xs opacity-60 mt-1">total</div>
          </div>

          {/* Metric: Total duration */}
          <div className="rounded-2xl bg-surface-card border border-divider p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Temps</div>
            <div className="font-display text-4xl md:text-5xl font-black leading-none text-heading">
              {formatDuration(totalDuration)}
              <span className="text-lg font-normal text-muted ml-0.5">{formatDurationUnit(totalDuration)}</span>
            </div>
            <div className="text-xs text-muted mt-1">cumulé</div>
          </div>

          {/* Weekly bar chart */}
          <div className="col-span-2 md:row-span-2 rounded-2xl bg-surface-card border border-divider p-5">
            <WeeklyBarChart data={weeklyChart} />
          </div>

          {/* This week: dots + contextual message */}
          <div className={`col-span-2 rounded-2xl p-5 border bg-gradient-to-br ${weekCardStyle(thisWeekSessions).bg} ${weekCardStyle(thisWeekSessions).border}`}>
            <WeekDots weekDots={weekDots} />
            {(() => {
              const msg = getWeekMessage(thisWeekSessions);
              const style = weekCardStyle(thisWeekSessions);
              return (
                <div className="mt-4 rounded-xl border border-divider px-4 py-3 shadow-sm bg-surface-0">
                  <p className={`text-sm font-bold ${style.text}`}>
                    {msg.emoji}{'  '}{msg.title}
                  </p>
                  <p className="text-xs text-body mt-0.5">{msg.subtitle}</p>
                </div>
              );
            })()}
          </div>

          {/* Programme progress */}
          {activeProgram ? (
            <Link
              to={`/programme/${activeProgram.slug}/suivi`}
              className="col-span-2 rounded-2xl bg-surface-card border border-divider p-5 group hover:border-brand/30 transition-colors"
            >
              <ProgramCard activeProgram={activeProgram} progressPct={progressPct} />
            </Link>
          ) : (
            <Link
              to="/programmes"
              className="col-span-2 rounded-2xl overflow-hidden relative group hover:ring-2 hover:ring-brand/40 transition-all"
            >
              <img
                src="/images/illustration-program.webp"
                alt=""
                className="w-full h-40 md:h-48 object-cover"
                style={{ objectPosition: '50% 25%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <p className="text-white font-bold text-base md:text-lg">Passe au niveau supérieur</p>
                  <p className="text-white/60 text-xs mt-0.5">Commence à suivre un programme personnalisé</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
            </Link>
          )}

          {/* Recent sessions */}
          <div className="col-span-2 md:col-span-4 rounded-2xl bg-surface-card border border-divider p-5">
            <RecentSessions completions={completions} />
          </div>
        </div>
      </div>
    </div>
  );
}
