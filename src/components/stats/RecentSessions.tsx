import { Dumbbell, Sparkles, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CompletionWithTitle } from '../../hooks/useHistory.ts';
import { formatShortDate } from '../../utils/date.ts';

type HistoryFilter = 'all' | 'program' | 'free';

const BLOCK_COLORS: Record<string, string> = {
  classic: 'bg-classic/15 text-classic',
  circuit: 'bg-circuit/15 text-circuit',
  hiit: 'bg-hiit/15 text-hiit',
  tabata: 'bg-tabata/15 text-tabata',
  emom: 'bg-emom/15 text-emom',
  amrap: 'bg-amrap/15 text-amrap',
  superset: 'bg-superset/15 text-superset',
  pyramid: 'bg-pyramid/15 text-pyramid',
};

function formatMonthYear(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

export function RecentSessions({ completions }: { completions: CompletionWithTitle[] }) {
  const { t, i18n } = useTranslation('stats');
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
      const month = formatMonthYear(c.completed_at, i18n.language);
      const last = groups[groups.length - 1];
      if (last && last.month === month) {
        last.items.push(c);
      } else {
        groups.push({ month, items: [c] });
      }
    }
    return groups;
  }, [visible, i18n.language]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-heading">{t('recent_sessions.history')}</p>
        <div className="flex items-center gap-1.5">
          {(
            [
              { value: 'all' as const, labelKey: 'recent_sessions.filter_all' },
              { value: 'program' as const, labelKey: 'recent_sessions.filter_program' },
              { value: 'free' as const, labelKey: 'recent_sessions.filter_free' },
            ] as { value: HistoryFilter; labelKey: string }[]
          ).map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setLimit(10);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                filter === value ? 'bg-brand text-white' : 'bg-surface-2 text-muted hover:text-heading'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">{t('recent_sessions.empty')}</p>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ month, items }) => (
            <section key={month}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-subtle mb-3 capitalize">{month}</h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <SessionCard key={c.id} completion={c} />
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
          {t('recent_sessions.load_more')}
        </button>
      )}
    </>
  );
}

function SessionCard({ completion: c }: { completion: CompletionWithTitle }) {
  const { t, i18n } = useTranslation('stats');
  const minutes = c.duration_seconds ? Math.round(c.duration_seconds / 60) : null;
  const title = c.session_title ?? t('recent_sessions.default_title');
  const isProgram = c.program_session_id != null;
  const isCustom = c.custom_session_id != null;
  const hasDetails = c.session_description || c.block_types.length > 0 || c.session_focus.length > 0;

  const isFree = !isCustom && !isProgram;
  const Icon = isCustom ? Sparkles : isProgram ? Dumbbell : Zap;
  const iconBg = isFree ? 'bg-emerald-500/10' : 'bg-brand/10';
  const iconColor = isFree ? 'text-emerald-500' : 'text-brand';

  return (
    <div className="rounded-xl border border-divider bg-surface-card/50 px-4 py-3 hover:border-divider-strong transition-colors group/card">
      {/* Top row: icon, title, duration, date */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-heading truncate group-hover/card:text-brand transition-colors">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-right">
          {minutes != null && <span className="text-xs font-semibold text-heading tabular-nums">{minutes} min</span>}
          <span className="text-[11px] text-muted w-14">{formatShortDate(c.completed_at, i18n.language)}</span>
        </div>
      </div>

      {/* Details row: description + block type badges + focus */}
      {hasDetails && (
        <div className="mt-2 ml-11 space-y-1.5">
          {c.session_description && <p className="text-xs text-subtle line-clamp-2">{c.session_description}</p>}
          {(c.block_types.length > 0 || c.session_focus.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {c.block_types.map((type) => (
                <span
                  key={type}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${BLOCK_COLORS[type] ?? 'bg-surface-2 text-muted'}`}
                >
                  {t(`block_label.${type}`, type)}
                </span>
              ))}
              {c.session_focus.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-2 text-subtle"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AMRAP rounds indicator */}
      {c.amrap_rounds != null && c.amrap_rounds > 0 && (
        <div className="mt-1.5 ml-11">
          <span className="text-[10px] font-semibold text-amrap">
            {t(c.amrap_rounds === 1 ? 'amrap_rounds_one' : 'amrap_rounds_other', { n: c.amrap_rounds })}
          </span>
        </div>
      )}
    </div>
  );
}
