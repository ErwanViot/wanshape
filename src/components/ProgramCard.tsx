import { Link } from 'react-router';
import type { Program } from '../types/completion.ts';
import { FITNESS_COLORS, FITNESS_LABELS } from '../utils/labels.ts';
import { getProgramImage } from '../utils/programImage.ts';

export function ProgramCard({ program }: { program: Program }) {
  const image = getProgramImage(program.slug, program.goals);

  return (
    <Link
      to={`/programme/${program.slug}`}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
    >
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
          {/* Top: badge */}
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${FITNESS_COLORS[program.fitness_level] ?? ''}`}
            >
              {FITNESS_LABELS[program.fitness_level] ?? program.fitness_level}
            </span>
          </div>

          {/* Bottom: info */}
          <div className="space-y-2 mt-auto text-outline">
            <h3 className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
              {program.title}
            </h3>

            {program.description && (
              <p className="text-sm text-white leading-relaxed line-clamp-2">{program.description}</p>
            )}

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
                {program.duration_weeks} semaines
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
                {program.frequency_per_week}x / semaine
              </span>
            </div>

            {program.goals.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {program.goals.map((goal) => (
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
    </Link>
  );
}
