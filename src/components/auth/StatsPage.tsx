import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useHistory } from '../../hooks/useHistory.ts';
import type { CompletionWithTitle, WeeklyData } from '../../hooks/useHistory.ts';
import { useActiveProgram } from '../../hooks/useProgram.ts';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type HistoryFilter = 'all' | 'program' | 'free';

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

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
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

        {/* ── Bento Grid ── */}
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

          {/* Weekly bar chart — spans 2 cols, 2 rows on desktop */}
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

          {/* Week dots — spans 2 cols */}
          <div className="col-span-2 rounded-2xl bg-surface-card border border-divider p-5">
            <WeekDots weekDots={weekDots} />
          </div>

          {/* Programme progress — spans 2 cols */}
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

          {/* Recent sessions — full width */}
          <div className="col-span-2 md:col-span-4 rounded-2xl bg-surface-card border border-divider p-5">
            <RecentSessions completions={completions} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────── */

function WeeklyBarChart({ data }: { data: WeeklyData[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">Volume hebdo</p>
        <p className="text-xs text-muted">
          {activeIdx != null ? (
            <span className="text-heading font-semibold">
              {data[activeIdx].minutes} min · {data[activeIdx].sessions} séance{data[activeIdx].sessions > 1 ? 's' : ''}
            </span>
          ) : (
            'min / semaine'
          )}
        </p>
      </div>
      <div className="flex items-end gap-2 flex-1 min-h-[120px]">
        {data.map((week, i) => {
          const heightPct = Math.max((week.minutes / maxMinutes) * 100, 4);
          const isActive = activeIdx === i;
          return (
            <button
              key={week.label}
              type="button"
              onClick={() => setActiveIdx(isActive ? null : i)}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-lg transition-all duration-200 ${
                    week.isCurrent
                      ? 'bg-brand shadow-sm shadow-brand/30'
                      : isActive
                        ? 'bg-brand/60'
                        : 'bg-divider-strong group-hover:bg-brand/30'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${week.isCurrent ? 'text-brand font-bold' : 'text-muted'}`}>
                {week.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekDots({ weekDots }: { weekDots: boolean[] }) {
  const activeDays = weekDots.filter(Boolean).length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">Cette semaine</p>
        <p className="text-xs text-muted">{activeDays} jour{activeDays > 1 ? 's' : ''} d'activité</p>
      </div>
      <div className="flex gap-2">
        {weekDots.map((done, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`w-full aspect-square max-w-[44px] rounded-xl flex items-center justify-center transition-colors ${
                done
                  ? 'bg-emerald-500/20 border-2 border-emerald-500'
                  : 'bg-surface-2 border-2 border-transparent'
              }`}
            >
              {done && (
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-medium text-muted">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgramCard({
  activeProgram,
  progressPct,
}: {
  activeProgram: NonNullable<ReturnType<typeof useActiveProgram>['activeProgram']>;
  progressPct: number;
}) {
  // SVG donut chart
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);

  return (
    <div className="flex items-center gap-5">
      {/* Donut */}
      <div className="relative shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-divider-strong)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-black text-heading">{progressPct}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">Programme en cours</p>
        <p className="text-base font-bold text-heading group-hover:text-brand transition-colors truncate">
          {activeProgram.title}
        </p>
        <p className="text-xs text-muted mt-1">
          {activeProgram.completedCount}/{activeProgram.totalSessions} séances
        </p>
        {activeProgram.nextSessionTitle && (
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            Prochaine : <span className="text-heading font-semibold truncate">{activeProgram.nextSessionTitle}</span>
            <ChevronRight className="w-3 h-3 text-muted shrink-0" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}

function RecentSessions({ completions }: { completions: CompletionWithTitle[] }) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [limit, setLimit] = useState(10);

  const filtered = useMemo(() => {
    if (filter === 'all') return completions;
    if (filter === 'program') return completions.filter((c) => c.program_session_id != null);
    return completions.filter((c) => c.program_session_id == null);
  }, [completions, filter]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  const grouped = useMemo(() => {
    const groups: { month: string; items: CompletionWithTitle[] }[] = [];
    for (const c of visible) {
      const month = formatMonthYear(c.completed_at);
      const last = groups[groups.length - 1];
      if (last && last.month === month) {
        last.items.push(c);
      } else {
        groups.push({ month, items: [c] });
      }
    }
    return groups;
  }, [visible]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">Historique</p>
        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          {([
            { value: 'all' as const, label: 'Tout' },
            { value: 'program' as const, label: 'Prog' },
            { value: 'free' as const, label: 'Libre' },
          ]).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setFilter(value); setLimit(10); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                filter === value
                  ? 'bg-brand text-white'
                  : 'bg-surface-2 text-muted hover:text-heading'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">Aucune séance dans cette catégorie.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ month, items }) => (
            <section key={month}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-subtle mb-2 capitalize">{month}</h3>
              <div className="space-y-0.5">
                {items.map((c) => (
                  <SessionRow key={c.id} completion={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 20)}
          className="w-full py-2.5 mt-3 rounded-xl border border-divider text-xs font-semibold text-muted hover:text-heading hover:border-divider-strong transition-colors cursor-pointer"
        >
          Charger plus
        </button>
      )}
    </>
  );
}

function SessionRow({ completion: c }: { completion: CompletionWithTitle }) {
  const minutes = c.duration_seconds ? Math.round(c.duration_seconds / 60) : null;
  const title = c.session_title ?? 'Séance';
  const isProgram = c.program_session_id != null;

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-2/50 transition-colors">
      <div className={`w-2 h-2 rounded-full shrink-0 ${isProgram ? 'bg-brand' : 'bg-emerald-500'}`} />
      <p className="text-sm text-heading truncate flex-1">{title}</p>
      <div className="flex items-center gap-3 shrink-0 text-right">
        {minutes != null && <span className="text-xs font-medium text-heading">{minutes} min</span>}
        <span className="text-[11px] text-muted w-14">{formatShortDate(c.completed_at)}</span>
      </div>
    </div>
  );
}
