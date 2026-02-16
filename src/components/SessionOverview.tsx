import { BLOCK_COLORS, BLOCK_LABELS } from '../engine/constants.ts';
import { getSessionImage } from '../utils/sessionImage.ts';
import type { Session, Block } from '../types/session.ts';

interface Props {
  session: Session;
  onStart: () => void;
  onBack: () => void;
}

export function SessionOverview({ session, onStart, onBack }: Props) {
  const image = getSessionImage(session);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero image + header */}
      <div className="relative">
        <div className="h-48 sm:h-56 overflow-hidden">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-surface/30" />
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white"
          aria-label="Retour"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-2xl font-extrabold text-white drop-shadow-sm leading-tight">{session.title}</h1>
            <span className="text-sm font-semibold text-white bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full shrink-0">
              ~{session.estimatedDuration} min
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Description + focus */}
        <div>
          <p className="text-white/50 text-sm leading-relaxed mb-3">
            {session.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {session.focus.map(f => (
              <span key={f} className="text-xs font-medium text-white/60 bg-white/8 px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Blocks detail */}
        <div className="space-y-4">
          {session.blocks.map((block, i) => (
            <BlockDetail key={i} block={block} index={i} total={session.blocks.length} />
          ))}
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-gradient-to-t from-surface via-surface to-transparent pt-6 pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onStart}
            className="cta-gradient w-full py-4 rounded-2xl text-white font-bold text-lg"
          >
            Démarrer la séance
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockDetail({ block, index, total }: { block: Block; index: number; total: number }) {
  const color = BLOCK_COLORS[block.type];
  const label = BLOCK_LABELS[block.type];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {/* Block header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {label} · {index + 1}/{total}
          </span>
          <h3 className="text-base font-bold text-white">{block.name}</h3>
        </div>
        <span className="text-xs text-white/40 shrink-0">{getBlockMeta(block)}</span>
      </div>

      {/* Exercises */}
      <div className="px-5 pb-4">
        <div className="border-t border-white/6 pt-3 space-y-2.5">
          {getExercises(block).map((ex, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs text-white/25 font-mono mt-0.5 w-5 shrink-0 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white/85">{ex.name}</span>
                  <span className="text-xs text-white/40">{ex.detail}</span>
                </div>
                <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{ex.instructions}</p>
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
