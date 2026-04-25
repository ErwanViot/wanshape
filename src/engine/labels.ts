/**
 * Translatable strings injected by the React layer into the pure engine
 * interpreters. Keeps `compileSession` and friends free of any i18n/React
 * dependency while making the player-rendered runtime strings localizable.
 *
 * Builders take primitives (numbers, strings) and return the localized line
 * — the interpreters never concatenate FR strings themselves anymore.
 */
export interface EngineLabels {
  /** "Prépare-toi !" / "Get ready!" — first inline transition before the first work step. */
  prepare: string;
  /** "Repos" / "Rest" — generic exerciseName for rest atoms. */
  rest: string;
  /** "Repos entre blocs" / "Rest between blocks" — exerciseName for inter-block rest. */
  betweenBlocks: string;
  /** "Prochain bloc : {{name}}" — instructions for inter-block rest. */
  nextBlock: (name: string) => string;
  /** "Prochain : {{name}}" — generic next exercise hint during rest. */
  nextExercise: (name: string) => string;
  /** "Prochain exercice : {{name}}" — pyramid uses a different phrasing for cross-exercise rest. */
  nextExerciseLabel: (name: string) => string;
  /** "Prochain : {{name}} — {{reps}} reps" — pyramid same-exercise rest. */
  nextPyramidStep: (name: string, reps: number) => string;
  /** "Prochain : {{name}} - Série {{next}}/{{total}}" — classic same-exercise rest. */
  nextSet: (name: string, next: number, total: number) => string;
  /** "Fin du round {{n}} - Round {{next}} dans..." — circuit between rounds. */
  endRound: (current: number, next: number) => string;
  /** "Série {{next}}/{{total}} dans..." — superset between sets. */
  nextSupersetSet: (next: number, total: number) => string;
  /** "{{n}} exercices" — warmup/classic transition summary. */
  exercisesCount: (n: number) => string;
  /** "{{rounds}} rounds - {{n}} exercices" — circuit transition summary. */
  roundsAndExercises: (rounds: number, exercises: number) => string;
  /** "{{sets}} séries - {{pairs}} paire(s)" — superset transition summary. */
  setsAndPairs: (sets: number, pairs: number) => string;
  /** "{{minutes}} min - Max de rounds" — AMRAP transition summary. */
  amrapSummary: (minutes: number) => string;
  /** "{{minutes}} minutes - {{summary}}" — EMOM transition summary. */
  emomSummary: (minutes: number, summary: string) => string;
  /** "Minute {{current}}/{{total}}" — EMOM minute label. */
  minuteLabel: (current: number, total: number) => string;
  /** "{{instructions}} ({{duration}}s par côté)" — warmup bilateral exercise instructions. */
  bilateralInline: (instructions: string, duration: number) => string;
  /** "Set {{next}}/{{total}} dans..." — tabata between sets countdown. */
  nextSetCountdown: (next: number, total: number) => string;
  /** "Round {{next}}/{{total}} - {{name}}" — tabata fin de round (not last). */
  nextRoundFirst: (next: number, total: number, name: string) => string;
  /** "Pyramide : {{pattern}}" — pyramid block transition summary. */
  pyramidSummary: (pattern: string) => string;
  /** "Série {{next}}/{{total}} - {{reps}}" — classic block nextStepPreview when same exercise has more sets. */
  previewNextSet: (next: number, total: number, repsLabel: string) => string;
  /** "max reps" / "{{reps}} reps" — classic/superset/pyramid nextStepPreview reps marker. */
  repsLabel: (reps: number | 'max') => string;
}

/**
 * Default French labels — historical strings the app shipped with before i18n.
 * Used as test fallback so engine unit tests stay decoupled from i18n init.
 */
export const DEFAULT_FR_ENGINE_LABELS: EngineLabels = {
  prepare: 'Prépare-toi !',
  rest: 'Repos',
  betweenBlocks: 'Repos entre blocs',
  nextBlock: (name) => `Prochain bloc : ${name}`,
  nextExercise: (name) => `Prochain : ${name}`,
  nextExerciseLabel: (name) => `Prochain exercice : ${name}`,
  nextPyramidStep: (name, reps) => `Prochain : ${name} — ${reps} reps`,
  nextSet: (name, next, total) => `Prochain : ${name} - Série ${next}/${total}`,
  endRound: (current, next) => `Fin du round ${current} - Round ${next} dans...`,
  nextSupersetSet: (next, total) => `Série ${next}/${total} dans...`,
  exercisesCount: (n) => `${n} exercices`,
  roundsAndExercises: (rounds, exercises) => `${rounds} rounds - ${exercises} exercices`,
  setsAndPairs: (sets, pairs) => `${sets} séries - ${pairs} paire${pairs > 1 ? 's' : ''}`,
  amrapSummary: (minutes) => `${minutes} min - Max de rounds`,
  emomSummary: (minutes, summary) => `${minutes} minutes - ${summary}`,
  minuteLabel: (current, total) => `Minute ${current}/${total}`,
  bilateralInline: (instructions, duration) => `${instructions} (${duration}s par côté)`,
  nextSetCountdown: (next, total) => `Set ${next}/${total} dans...`,
  nextRoundFirst: (next, total, name) => `Round ${next}/${total} - ${name}`,
  pyramidSummary: (pattern) => `Pyramide : ${pattern}`,
  previewNextSet: (next, total, repsLabel) => `Série ${next}/${total} - ${repsLabel}`,
  repsLabel: (reps) => (reps === 'max' ? 'max reps' : `${reps} reps`),
};
