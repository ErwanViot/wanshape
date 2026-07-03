import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Program } from '../types/completion.ts';
import { FITNESS_COLORS } from '../utils/labels.ts';
import { getProgramImage } from '../utils/programImage.ts';
import { localizedProgramFields } from '../utils/programLocale.ts';

export function ProgramCard({ program }: { program: Program }) {
  const { t } = useTranslation(['programs', 'programs_data']);
  const { title, description, goals } = localizedProgramFields(program, t);
  const image = getProgramImage(program.slug, goals);

  // Async generation states. A `generating` program has no sessions yet, so its
  // page would be empty — keep the card non-navigable and show a spinner. A
  // `failed` one links to its page (which surfaces the error + a way to remove
  // it). Legacy rows have no status → treated as ready.
  const isPending = program.status === 'generating';
  const isFailed = program.status === 'failed';

  const wrapperClass =
    'group relative rounded-2xl overflow-hidden transition-transform block ' +
    (isPending ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]');

  const statusBadge = isPending ? (
    <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white flex items-center gap-1.5">
      <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
      {t('card.status_generating')}
    </span>
  ) : isFailed ? (
    <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-red-400/30 bg-red-500/20 backdrop-blur-sm text-red-200">
      {t('card.status_failed')}
    </span>
  ) : null;

  const inner = (
    <CardInner
      image={image}
      title={title}
      description={description}
      goals={goals}
      program={program}
      dimmed={isPending}
      statusBadge={statusBadge}
      t={t}
    />
  );

  if (isPending) {
    return (
      <output className={wrapperClass} aria-busy="true" aria-label={t('card.status_generating')}>
        {inner}
      </output>
    );
  }

  return (
    <Link to={`/programme/${program.slug}`} className={wrapperClass}>
      {inner}
    </Link>
  );
}

function CardInner({
  image,
  title,
  description,
  goals,
  program,
  dimmed,
  statusBadge,
  t,
}: {
  image: string;
  title: string;
  description: string | null;
  goals: string[];
  program: Program;
  dimmed: boolean;
  statusBadge: ReactNode;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className={dimmed ? 'opacity-70' : ''}>
      {/* Image background */}
      <div className="relative min-h-[220px] sm:min-h-[260px] flex flex-col">
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/50 transition-opacity group-hover:opacity-50" />

        <div className="relative z-10 flex flex-col justify-between flex-1 p-6">
          {/* Top: badges */}
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${FITNESS_COLORS[program.fitness_level] ?? ''}`}
            >
              {t(`fitness_level.${program.fitness_level}`) ?? program.fitness_level}
            </span>
            {statusBadge}
          </div>

          {/* Bottom: info */}
          <div className="space-y-2 mt-auto text-outline">
            <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">{title}</h3>

            {description && <p className="text-sm text-white leading-relaxed line-clamp-2">{description}</p>}

            <div className="flex items-center gap-3 text-xs text-white pt-1">
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
                {t('card.weeks', { n: program.duration_weeks })}
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
                {t('card.freq_per_week', { n: program.frequency_per_week })}
              </span>
            </div>

            {goals.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {goals.map((goal) => (
                  <li
                    key={goal}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white"
                  >
                    {goal}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
