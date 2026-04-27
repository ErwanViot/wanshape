import type { Session } from './session.ts';

export interface SessionCompletion {
  id: string;
  user_id: string;
  session_date: string | null;
  program_session_id: string | null;
  custom_session_id: string | null;
  completed_at: string;
  duration_seconds: number | null;
  amrap_rounds: number | null;
  metadata: Record<string, unknown>;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  goals: string[];
  duration_weeks: number;
  frequency_per_week: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  is_fixed: boolean;
  created_at: string;
  user_id: string | null;
  note_coach: string | null;
  progression: import('./custom-program.ts').ProgramProgression | null;
  consignes_semaine: Record<string, string> | null;
  onboarding_data: import('./custom-program.ts').PersistedProgramOnboarding | null;
  /** Language the program content was generated in. Pre-i18n rows are 'fr'. */
  locale: 'fr' | 'en';
}

export interface ProgramSession {
  id: string;
  program_id: string;
  session_order: number;
  week_number: number;
  session_data: Session;
  created_at: string;
}
