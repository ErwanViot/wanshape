import { Link } from 'react-router';
import type { Program } from '../types/completion.ts';

const FITNESS_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const FITNESS_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
  intermediate: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
  advanced: 'bg-red-500/20 border-red-400/30 text-red-300',
};

export function ProgramCard({ program, compact }: { program: Program; compact?: boolean }) {
  return (
    <Link
      to={`/programme/${program.slug}`}
      className="glass-card rounded-[20px] p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-heading">{program.title}</h3>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${FITNESS_COLORS[program.fitness_level] ?? ''}`}
        >
          {FITNESS_LABELS[program.fitness_level] ?? program.fitness_level}
        </span>
      </div>

      {!compact && program.description && <p className="text-sm text-subtle leading-relaxed">{program.description}</p>}

      <div className="flex items-center gap-3 text-xs text-muted">
        <span>{program.duration_weeks} semaines</span>
        <span className="text-divider-strong">·</span>
        <span>{program.frequency_per_week}x / semaine</span>
      </div>

      {!compact && program.goals.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {program.goals.map((goal) => (
            <li
              key={goal}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-subtle"
            >
              {goal}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
