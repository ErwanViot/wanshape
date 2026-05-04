// Bridge types between Wan2Fit's session vocabulary and the platform
// health stores (HealthKit on iOS, Health Connect on Android). The
// platform plugins are wired in a follow-up PR; for now this module is
// pure typescript so we can unit-test the mapping in isolation.

export type FormatSlug = 'pyramide' | 'renforcement' | 'superset' | 'emom' | 'circuit' | 'amrap' | 'hiit' | 'tabata';

// HKWorkoutActivityType raw values from Apple's HealthKit framework.
// We only enumerate the ones we map to — keeping the constants here
// instead of pulling in @perfood/capacitor-healthkit's enum lets the
// pure-TS module import without a Capacitor runtime.
export const HKWorkoutActivityType = {
  TraditionalStrengthTraining: 50,
  FunctionalStrengthTraining: 20,
  HighIntensityIntervalTraining: 79,
  CrossTraining: 39,
} as const;
export type HKWorkoutActivityTypeId = (typeof HKWorkoutActivityType)[keyof typeof HKWorkoutActivityType];

// Health Connect ExerciseType (Android) — same idea, only the values
// we use, lifted from androidx.health.connect.client.records.ExerciseSessionRecord.
// Stable since the Health Connect 1.0 GA.
export const HealthConnectExerciseType = {
  StrengthTraining: 54,
  HighIntensityIntervalTraining: 38,
  Calisthenics: 17,
  CircuitTraining: 13,
} as const;
export type HealthConnectExerciseTypeId = (typeof HealthConnectExerciseType)[keyof typeof HealthConnectExerciseType];

// Format → HealthKit / Health Connect.
// Pyramid + strength + superset stay on the strength bucket (resistance,
// rest periods). EMOM/circuit/AMRAP/HIIT/Tabata all map to HIIT — the
// pacing is similar from the OS's metric standpoint (HR pattern, MET).
const FORMAT_TO_HK_ACTIVITY: Record<FormatSlug, HKWorkoutActivityTypeId> = {
  pyramide: HKWorkoutActivityType.TraditionalStrengthTraining,
  renforcement: HKWorkoutActivityType.TraditionalStrengthTraining,
  superset: HKWorkoutActivityType.FunctionalStrengthTraining,
  emom: HKWorkoutActivityType.HighIntensityIntervalTraining,
  circuit: HKWorkoutActivityType.HighIntensityIntervalTraining,
  amrap: HKWorkoutActivityType.HighIntensityIntervalTraining,
  hiit: HKWorkoutActivityType.HighIntensityIntervalTraining,
  tabata: HKWorkoutActivityType.HighIntensityIntervalTraining,
};

const FORMAT_TO_HEALTH_CONNECT: Record<FormatSlug, HealthConnectExerciseTypeId> = {
  pyramide: HealthConnectExerciseType.StrengthTraining,
  renforcement: HealthConnectExerciseType.StrengthTraining,
  superset: HealthConnectExerciseType.StrengthTraining,
  emom: HealthConnectExerciseType.HighIntensityIntervalTraining,
  circuit: HealthConnectExerciseType.CircuitTraining,
  amrap: HealthConnectExerciseType.HighIntensityIntervalTraining,
  hiit: HealthConnectExerciseType.HighIntensityIntervalTraining,
  tabata: HealthConnectExerciseType.HighIntensityIntervalTraining,
};

export function formatToHKActivityType(slug: FormatSlug): HKWorkoutActivityTypeId {
  return FORMAT_TO_HK_ACTIVITY[slug];
}

export function formatToHealthConnectType(slug: FormatSlug): HealthConnectExerciseTypeId {
  return FORMAT_TO_HEALTH_CONNECT[slug];
}

export interface WorkoutSummary {
  formatSlug: FormatSlug;
  startedAt: Date;
  durationSeconds: number;
  estimatedKcal: number;
}
