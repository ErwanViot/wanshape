import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useHistory } from '../../hooks/useHistory.ts';
import { useActiveProgram } from '../../hooks/useProgram.ts';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { NutritionWidget7d } from '../nutrition/NutritionWidget7d.tsx';
import { MetricCard } from '../stats/MetricCard.tsx';
import { ProgramCard } from '../stats/ProgramCard.tsx';
import { RecentSessions } from '../stats/RecentSessions.tsx';
import { WeekDots } from '../stats/WeekDots.tsx';
import { WeeklyBarChart } from '../stats/WeeklyBarChart.tsx';

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

function durationFormatter(seconds: number) {
  return (n: number) => formatDuration(seconds > 0 ? Math.round(n) : 0);
}

interface WeekMessage {
  emoji: string;
  title: string;
  subtitle: string;
}

type TFunction = (key: string) => string;

function getWeekMessage(sessions: number, t: TFunction): WeekMessage {
  const dayOfWeek = new Date().getDay();
  const isEndOfWeek = dayOfWeek === 0 || dayOfWeek === 6;

  if (sessions === 0) {
    return isEndOfWeek
      ? { emoji: '😌', title: t('week_message.weekend_idle_title'), subtitle: t('week_message.weekend_idle_sub') }
      : { emoji: '🚀', title: t('week_message.new_week_title'), subtitle: t('week_message.new_week_sub') };
  }
  if (sessions === 1) {
    return isEndOfWeek
      ? { emoji: '💪', title: t('week_message.one_weekend_title'), subtitle: t('week_message.one_weekend_sub') }
      : { emoji: '🔥', title: t('week_message.one_week_title'), subtitle: t('week_message.one_week_sub') };
  }
  if (sessions === 2) return { emoji: '💪', title: t('week_message.two_title'), subtitle: t('week_message.two_sub') };
  if (sessions === 3)
    return { emoji: '🚀', title: t('week_message.three_title'), subtitle: t('week_message.three_sub') };
  if (sessions === 4) return { emoji: '🔥', title: t('week_message.four_title'), subtitle: t('week_message.four_sub') };
  return { emoji: '⚠️', title: t('week_message.overload_title'), subtitle: t('week_message.overload_sub') };
}

const WEEK_CARD_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  idle: { bg: 'from-slate-500/10 to-slate-500/5', border: 'border-slate-500/20', text: 'text-body' },
  start: {
    bg: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  cruise: {
    bg: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  peak: {
    bg: 'from-violet-500/25 to-violet-500/5',
    border: 'border-violet-500/30',
    text: 'text-violet-700 dark:text-violet-300',
  },
  warning: {
    bg: 'from-amber-500/25 to-amber-500/5',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-300',
  },
};

function weekCardStyle(sessions: number) {
  if (sessions === 0) return WEEK_CARD_STYLES.idle;
  if (sessions <= 2) return WEEK_CARD_STYLES.start;
  if (sessions <= 3) return WEEK_CARD_STYLES.cruise;
  if (sessions === 4) return WEEK_CARD_STYLES.peak;
  return WEEK_CARD_STYLES.warning;
}

export function StatsPage() {
  const { t } = useTranslation('stats');
  const { user } = useAuth();
  const {
    completions,
    totalSessions,
    totalDuration,
    avgDuration,
    weekDots,
    weeklyChart,
    thisWeekSessions,
    thisWeekDuration,
    loading,
  } = useHistory(user?.id);
  const { activeProgram } = useActiveProgram(user?.id);

  useDocumentHead({
    title: t('page.title'),
    description: t('page.description'),
  });

  const progressPct =
    activeProgram && activeProgram.totalSessions > 0
      ? Math.round((activeProgram.completedCount / activeProgram.totalSessions) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="flex-1 px-6 md:px-10 lg:px-14 py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto">
            <svg
              aria-hidden="true"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-black text-heading">{t('page.empty_title')}</h1>
          <p className="text-body text-sm">{t('page.empty_desc')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors"
          >
            {t('page.empty_cta')}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const style = weekCardStyle(thisWeekSessions);
  const msg = getWeekMessage(thisWeekSessions, t);

  return (
    <div className="flex-1 px-4 md:px-10 lg:px-14 py-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="font-display text-2xl md:text-3xl font-black text-heading">{t('page.heading')}</h1>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Row 1: 4 MetricCards */}
          <MetricCard
            label={t('metric.sessions')}
            value={totalSessions}
            subtitle={t('metric.total')}
            variant="brand"
            className="stagger-fade-in stagger-1"
          />
          <MetricCard
            label={t('metric.time')}
            value={totalDuration}
            unit={formatDurationUnit(totalDuration)}
            formatter={durationFormatter(totalDuration)}
            subtitle={t('metric.cumulative')}
            className="stagger-fade-in stagger-2"
          />
          <MetricCard
            label={t('metric.avg_session')}
            value={avgDuration}
            unit={formatDurationUnit(avgDuration)}
            formatter={durationFormatter(avgDuration)}
            subtitle={t('metric.avg_duration')}
            className="stagger-fade-in stagger-3"
          />
          <MetricCard
            label={t('metric.this_week')}
            value={thisWeekDuration}
            unit={formatDurationUnit(thisWeekDuration)}
            formatter={durationFormatter(thisWeekDuration)}
            subtitle={t(thisWeekSessions === 1 ? 'metric.this_week_sub_one' : 'metric.this_week_sub_other', {
              n: thisWeekSessions,
            })}
            className="stagger-fade-in stagger-4"
          />

          {/* Row 2-3: Bar chart (col-2, row-2) + WeekDots + Programme */}
          <div className="col-span-2 md:row-span-2 rounded-2xl bg-surface-card border border-divider p-5 stagger-fade-in stagger-5">
            <WeeklyBarChart data={weeklyChart} />
          </div>

          {/* WeekDots + Message */}
          <div
            className={`col-span-2 rounded-2xl p-5 border bg-gradient-to-br ${style.bg} ${style.border} stagger-fade-in stagger-5`}
          >
            <WeekDots weekDots={weekDots} />
            <div className="mt-4 rounded-xl border border-divider px-4 py-3 shadow-sm bg-surface-0">
              <p className={`text-sm font-bold ${style.text}`}>
                {msg.emoji}
                {'  '}
                {msg.title}
              </p>
              <p className="text-xs text-body mt-0.5">{msg.subtitle}</p>
            </div>
          </div>

          {/* Programme progress */}
          {activeProgram ? (
            <Link
              to={`/programme/${activeProgram.slug}/suivi`}
              className="col-span-2 rounded-2xl bg-surface-card border border-divider p-5 group hover:border-brand/30 transition-colors stagger-fade-in stagger-6"
            >
              <ProgramCard activeProgram={activeProgram} progressPct={progressPct} />
            </Link>
          ) : (
            <Link
              to="/programmes"
              className="col-span-2 rounded-2xl overflow-hidden relative group hover:ring-2 hover:ring-brand/40 transition-all stagger-fade-in stagger-6"
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
                  <p className="text-white font-bold text-base md:text-lg">{t('page.next_level')}</p>
                  <p className="text-white/60 text-xs mt-0.5">{t('page.next_level_sub')}</p>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-white/70 shrink-0 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </Link>
          )}

          {/* Recent sessions */}
          <div className="col-span-2 md:col-span-4 rounded-2xl bg-surface-card border border-divider p-5">
            <RecentSessions completions={completions} />
          </div>
        </div>

        {/* 7-day nutrition rollup — separate row to avoid breaking the bento grid above */}
        <div className="mt-4">
          <NutritionWidget7d />
        </div>
      </div>
    </div>
  );
}
