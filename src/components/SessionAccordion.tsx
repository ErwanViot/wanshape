import { useState } from 'react';
import { Link } from 'react-router';
import { BLOCK_COLORS } from '../engine/constants.ts';
import type { Block, Session } from '../types/session.ts';
import { getExerciseLink } from '../utils/exerciseLinks.ts';
import { computeTimeline, formatBlockDuration } from '../utils/sessionTimeline.ts';

export function SessionAccordion({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3 flex items-center justify-between bg-surface-card border-t border-divider text-sm cursor-pointer"
      >
        <span className="text-muted font-medium">Contenu de la séance</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && <SessionDetail session={session} />}
    </>
  );
}

/* ── Detail content ── */

function SessionDetail({ session }: { session: Session }) {
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="bg-surface-card px-5 pb-5 space-y-3">
      {session.blocks.map((block, i) => {
        const seg = timeline[i];
        const color = BLOCK_COLORS[seg.type];
        const exercises = getBlockExercises(block);
        return (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {seg.label} · {i + 1}/{session.blocks.length}
              </span>
              <span className="text-xs text-muted ml-auto">{getBlockMeta(block)}</span>
            </div>
            <div className="pl-4 space-y-0.5">
              {exercises.map((ex, j) => (
                <div key={j} className="flex items-baseline gap-2 text-xs">
                  <ExerciseName name={ex.name} />
                  <span className="text-faint">{ex.detail}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Mini timeline */}
      <div className="flex gap-1 pt-2">
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
      <p className="text-xs text-muted">
        {session.blocks.length} blocs · ~{formatBlockDuration(totalDuration)} estimées
      </p>
    </div>
  );
}

function ExerciseName({ name }: { name: string }) {
  const link = getExerciseLink(name);
  if (!link) {
    return <span className="text-body">{name}</span>;
  }
  const to = `/exercices/${link.slug}${link.anchor ? `#${link.anchor}` : ''}`;
  return (
    <Link
      to={to}
      className="text-link hover:text-link-hover transition-colors underline underline-offset-2 decoration-link/30"
    >
      {name}
    </Link>
  );
}

/* ── Block helpers ── */

interface ExerciseInfo {
  name: string;
  detail: string;
}

function getBlockExercises(block: Block): ExerciseInfo[] {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: ex.bilateral ? `${ex.duration}s × 2 côtés` : `${ex.duration}s`,
      }));
    case 'classic':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${ex.sets} × ${ex.reps === 'max' ? 'max' : ex.reps} reps`,
      }));
    case 'circuit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: ex.mode === 'timed' ? `${ex.duration}s` : `${ex.reps} reps`,
      }));
    case 'hiit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.work}s effort`,
      }));
    case 'tabata':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.work ?? 20}s / ${block.rest ?? 10}s`,
      }));
    case 'emom':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
      }));
    case 'amrap':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `× ${ex.reps}`,
      }));
    case 'superset':
      return block.pairs.flatMap((pair, pi) =>
        pair.exercises.map((ex) => ({
          name: ex.name,
          detail: `× ${ex.reps} · paire ${pi + 1}`,
        })),
      );
    case 'pyramid':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: `${block.pattern.join(' - ')} reps`,
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
