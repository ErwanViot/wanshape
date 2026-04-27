import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BLOCK_COLORS } from '../engine/constants.ts';
import type { Block, Session } from '../types/session.ts';
import { getExerciseLink } from '../utils/exerciseLinks.ts';
import { computeTimeline } from '../utils/sessionTimeline.ts';

export function SessionAccordion({ session, defaultOpen = false }: { session: Session; defaultOpen?: boolean }) {
  const { t } = useTranslation('sessions');
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full px-5 py-3 flex items-center justify-between bg-surface-card border-t border-divider text-sm cursor-pointer"
      >
        <span className="text-muted font-medium">{t('accordion.toggle_label')}</span>
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

      {open && (
        <section id={panelId} aria-label={t('accordion.section_aria')}>
          <SessionDetail session={session} />
        </section>
      )}
    </>
  );
}

/* ── Detail content ── */

function SessionDetail({ session }: { session: Session }) {
  const { t } = useTranslation('sessions');
  const { t: tc } = useTranslation('common');
  const timeline = computeTimeline(session.blocks);
  const totalDuration = timeline.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="bg-surface-card px-5 pb-5 space-y-3">
      {session.blocks.map((block, i) => {
        const seg = timeline[i];
        const color = BLOCK_COLORS[seg.type];
        const exercises = getBlockExercises(block, tc);
        return (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {tc(`block_name.${seg.type}`)} · {i + 1}/{session.blocks.length}
              </span>
              <span className="text-xs text-muted ml-auto">{getBlockMeta(block, t)}</span>
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
        {t('accordion.summary', { blocks: session.blocks.length, duration: session.estimatedDuration })}
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

type Translator = (key: string, options?: Record<string, unknown>) => string;

function getBlockExercises(block: Block, tc: Translator): ExerciseInfo[] {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: ex.bilateral
          ? tc('exercise_detail.bilateral_seconds', { seconds: ex.duration })
          : tc('exercise_detail.duration_seconds', { seconds: ex.duration }),
      }));
    case 'classic':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail:
          ex.reps === 'max'
            ? tc('exercise_detail.max_reps', { sets: ex.sets })
            : tc('exercise_detail.sets_reps', { sets: ex.sets, reps: ex.reps }),
      }));
    case 'circuit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail:
          ex.mode === 'timed'
            ? tc('exercise_detail.duration_seconds', { seconds: ex.duration })
            : tc('exercise_detail.reps_count', { reps: ex.reps }),
      }));
    case 'hiit':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: tc('exercise_detail.work_seconds', { seconds: block.work }),
      }));
    case 'tabata':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: tc('exercise_detail.work_rest_seconds', { work: block.work ?? 20, rest: block.rest ?? 10 }),
      }));
    case 'emom':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: tc('exercise_detail.reps_inline', { reps: ex.reps }),
      }));
    case 'amrap':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: tc('exercise_detail.reps_inline', { reps: ex.reps }),
      }));
    case 'superset':
      return block.pairs.flatMap((pair, pi) =>
        pair.exercises.map((ex) => ({
          name: ex.name,
          detail: tc('exercise_detail.superset_pair', { reps: ex.reps, n: pi + 1 }),
        })),
      );
    case 'pyramid':
      return block.exercises.map((ex) => ({
        name: ex.name,
        detail: tc('exercise_detail.pyramid_pattern', { pattern: block.pattern.join(' - ') }),
      }));
  }
}

function getBlockMeta(block: Block, ts: Translator): string {
  switch (block.type) {
    case 'warmup':
    case 'cooldown':
    case 'classic':
      return ts('block_meta.exercises', { n: block.exercises.length });
    case 'circuit':
      return ts('block_meta.rounds_x_exos', { rounds: block.rounds, exos: block.exercises.length });
    case 'hiit':
      return ts('block_meta.hiit', { rounds: block.rounds, work: block.work, rest: block.rest });
    case 'tabata': {
      const sets = block.sets ?? 1;
      const rounds = block.rounds ?? 8;
      return sets > 1 ? ts('block_meta.tabata_with_sets', { sets, rounds }) : ts('block_meta.rounds_only', { rounds });
    }
    case 'emom':
      return ts('block_meta.minutes', { n: block.minutes });
    case 'amrap':
      return ts('block_meta.minutes', { n: Math.floor(block.duration / 60) });
    case 'superset':
      return ts('block_meta.superset', { sets: block.sets, pairs: block.pairs.length });
    case 'pyramid':
      return ts('block_meta.pyramid', { n: block.pattern.length });
  }
}
