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

export function StatsPage() {
  const { user, profile } = useAuth();
  const { completions, consecutiveDays, totalSessions, totalDuration, weekDots, weeklyChart, thisWeekSessions, loading } = useHistory(user?.id);
  const { activeProgram } = useActiveProgram(user?.id);

  useDocumentHead({
    title: 'Suivi',
    description: 'Tableau de bord sportif Wan2Fit.',
  });

  const firstName = (profile?.display_name ?? user?.user_metadata?.display_name ?? '')
    .split(' ')[0];

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
          {firstName && <p className="text-muted">Salut {firstName}</p>}
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
        {firstName && (
          <div>
            <p className="text-sm text-muted">Salut {firstName}</p>
            <h1 className="font-display text-2xl md:text-3xl font-black text-heading">Suivi</h1>
          </div>
        )}

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

          {/* Metric: This week */}
          <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/20 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Semaine</div>
            <div className="font-display text-4xl md:text-5xl font-black leading-none text-heading">
              {thisWeekSessions}<span className="text-lg font-normal text-muted">/7</span>
            </div>
            <div className="text-xs text-muted mt-1">jours actifs</div>
          </div>

          {/* Metric: Streak */}
          <div className="rounded-2xl bg-amber-500/15 border border-amber-500/20 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">Série</div>
            <div className="font-display text-4xl md:text-5xl font-black leading-none text-heading">
              {consecutiveDays}
            </div>
            <div className="text-xs text-muted mt-1">jour{consecutiveDays > 1 ? 's' : ''} d'affilée</div>
          </div>

          {/* Week dots */}
          <div className="col-span-2 rounded-2xl bg-surface-card border border-divider p-5">
            <WeekDots weekDots={weekDots} />
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
              className="col-span-2 rounded-2xl border border-dashed border-divider-strong p-5 flex items-center gap-4 group hover:border-brand/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-heading group-hover:text-brand transition-colors">Découvrir les programmes</p>
                <p className="text-xs text-muted mt-0.5">Suis un programme structuré pour progresser</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted ml-auto shrink-0" aria-hidden="true" />
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
