import { Link } from 'react-router';
import { BLOCK_COLORS } from '../engine/constants.ts';
import { computeTimeline, formatBlockDuration } from '../utils/sessionTimeline.ts';
import { getExerciseLink } from '../utils/exerciseLinks.ts';
import type { Session, Block } from '../types/session.ts';

interface Props {
  session: Session;
}

export function SessionRecap({ session }: Props) {
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="glass-card rounded-[20px] p-6 md:p-8 h-full flex flex-col overflow-y-auto">
      <h3 className="text-sm font-bold uppercase tracking-wider text-subtle mb-5">
        Contenu de la séance
      </h3>

      {/* Blocks with full exercise list */}
      <div className="space-y-4 flex-1">
        {session.blocks.map((block, i) => (
          <BlockDetail
            key={i}
            block={block}
            segment={timeline[i]}
            index={i}
            total={session.blocks.length}
          />
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-6 pt-4 border-t border-divider">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{session.blocks.length} blocs</span>
          <span>~{formatBlockDuration(totalDuration)} estimées</span>
        </div>

        {/* Mini timeline */}
        <div className="flex gap-1 mt-3">
          {timeline.map((t, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${(t.duration / (totalDuration || 1)) * 100}%`,
                backgroundColor: BLOCK_COLORS[t.type],
                opacity: t.isAccent ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockDetail({ block, segment, index, total }: {
  block: Block;
  segment: { label: string; type: Block['type']; duration: number };
  index: number;
  total: number;
}) {
  const color = BLOCK_COLORS[segment.type];
  const exercises = getExercises(block);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)' }}>
      {/* Block header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="w-1.5 h-7 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {segment.label} · {index + 1}/{total}
          </span>
          <h4 className="text-sm font-bold text-heading">{block.name}</h4>
        </div>
        <span className="text-[11px] text-muted shrink-0">{getBlockMeta(block)}</span>
      </div>

      {/* Exercises list */}
      <div className="px-4 pb-3">
        <div className="border-t border-divider pt-2.5 space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[11px] text-faint font-mono mt-0.5 w-4 shrink-0 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <ExerciseName name={ex.name} />
                  <span className="text-[11px] text-muted">{ex.detail}</span>
                </div>
                <p className="text-[11px] text-faint mt-0.5 leading-relaxed">{ex.instructions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExerciseInfo {
  name: string;
  detail: string;
  instructions: string;
}

function getExercises(block: Block): ExerciseInfo[] {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: ex.bilateral ? `${ex.duration}s × 2 côtés` : `${ex.duration}s`,
        instructions: ex.instructions,
      }));

    case 'classic':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: `${ex.sets} × ${ex.reps === 'max' ? 'max' : ex.reps} reps`,
        instructions: ex.instructions,
      }));

    case 'circuit':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: ex.mode === 'timed' ? `${ex.duration}s` : `${ex.reps} reps`,
        instructions: ex.instructions,
      }));

    case 'hiit':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: `${block.work}s effort`,
        instructions: ex.instructions,
      }));

    case 'tabata':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: `${block.work ?? 20}s / ${block.rest ?? 10}s`,
        instructions: ex.instructions,
      }));

    case 'emom':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
        instructions: ex.instructions,
      }));

    case 'amrap':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
        instructions: ex.instructions,
      }));

    case 'superset':
      return block.pairs.flatMap((pair, pi) =>
        pair.exercises.map(ex => ({
          name: ex.name,
          detail: `× ${ex.reps} · paire ${pi + 1}`,
          instructions: ex.instructions,
        }))
      );

    case 'pyramid':
      return block.exercises.map(ex => ({
        name: ex.name,
        detail: block.pattern.join(' - ') + ' reps',
        instructions: ex.instructions,
      }));
  }
}

function ExerciseName({ name }: { name: string }) {
  const link = getExerciseLink(name);
  if (!link) {
    return <span className="text-[13px] font-medium text-strong">{name}</span>;
  }
  const to = `/exercices/${link.slug}${link.anchor ? `#${link.anchor}` : ''}`;
  return (
    <Link to={to} className="text-[13px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2 decoration-indigo-400/30">
      {name}
    </Link>
  );
}

function getBlockMeta(block: Block): string {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return `${block.exercises.length} exercices`;
    case 'classic':
      return `${block.exercises.length} exercices`;
    case 'circuit':
      return `${block.rounds} rounds × ${block.exercises.length} exos`;
    case 'hiit':
      return `${block.rounds} rounds · ${block.work}s/${block.rest}s`;
    case 'tabata': {
      const sets = block.sets ?? 1;
      const rounds = block.rounds ?? 8;
      return sets > 1 ? `${sets} sets × ${rounds} rounds` : `${rounds} rounds`;
    }
    case 'emom':
      return `${block.minutes} minutes`;
    case 'amrap':
      return `${Math.floor(block.duration / 60)} minutes`;
    case 'superset':
      return `${block.sets} séries · ${block.pairs.length} paires`;
    case 'pyramid':
      return `${block.pattern.length} paliers`;
  }
}
