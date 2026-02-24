export interface SessionCompletion {
  id: string;
  user_id: string;
  session_date: string | null;
  program_session_id: string | null;
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
}

export interface ProgramSession {
  id: string;
  program_id: string;
  session_order: number;
  week_number: number;
  session_data: Record<string, unknown>;
  created_at: string;
}
