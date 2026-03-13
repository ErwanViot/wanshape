import { useMemo, useState } from 'react';
import type { CompletionWithTitle } from '../../hooks/useHistory.ts';
import { formatShortDate } from '../../utils/date.ts';

type HistoryFilter = 'all' | 'program' | 'free';

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
}

export function RecentSessions({ completions }: { completions: CompletionWithTitle[] }) {
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
