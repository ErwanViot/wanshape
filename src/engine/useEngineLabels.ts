import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { EngineLabels } from './labels.ts';

/**
 * Build the EngineLabels bundle from the active i18n locale.
 *
 * The engine interpreters take this bundle as a parameter and inject the
 * resolved strings into AtomicSteps. Memoized on the current language so
 * compileSession can use it as a stable dep.
 */
export function useEngineLabels(): EngineLabels {
  const { t, i18n } = useTranslation('player');

  return useMemo<EngineLabels>(
    () => ({
      prepare: t('engine.prepare'),
      rest: t('engine.rest'),
      betweenBlocks: t('engine.between_blocks'),
      nextBlock: (name) => t('engine.next_block', { name }),
      nextExercise: (name) => t('engine.next_exercise', { name }),
      nextExerciseLabel: (name) => t('engine.next_exercise_label', { name }),
      nextPyramidStep: (name, reps) => t('engine.next_pyramid_step', { name, reps }),
      nextSet: (name, next, total) => t('engine.next_set', { name, next, total }),
      endRound: (current, next) => t('engine.end_round', { current, next }),
      nextSupersetSet: (next, total) => t('engine.next_superset_set', { next, total }),
      exercisesCount: (n) => t('engine.exercises_count', { n }),
      roundsAndExercises: (rounds, exercises) => t('engine.rounds_and_exercises', { rounds, exercises }),
      setsAndPairs: (sets, pairs) =>
        t(pairs === 1 ? 'engine.sets_and_pairs_one' : 'engine.sets_and_pairs_other', { sets, pairs }),
      amrapSummary: (minutes) => t('engine.amrap_summary', { minutes }),
      emomSummary: (minutes, summary) => t('engine.emom_summary', { minutes, summary }),
      minuteLabel: (current, total) => t('engine.minute_label', { current, total }),
      bilateralInline: (instructions, duration) => t('engine.bilateral_inline', { instructions, duration }),
      nextSetCountdown: (next, total) => t('engine.next_set_countdown', { next, total }),
      nextRoundFirst: (next, total, name) => t('engine.next_round_first', { next, total, name }),
      pyramidSummary: (pattern) => t('engine.pyramid_summary', { pattern }),
    }),
    [t, i18n.language],
  );
}
