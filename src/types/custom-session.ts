import type { Session } from './session.ts';

export type CustomSessionPreset = 'transpirer' | 'renfo' | 'express' | 'mobilite';

export type CustomSessionMode = 'quick' | 'detailed' | 'expert';

export type Equipment =
  | 'halteres'
  | 'elastiques'
  | 'kettlebell'
  | 'tapis'
  | 'barre-traction'
  | 'banc'
  | 'corde-a-sauter'
  | 'medecine-ball'
  | 'swiss-ball'
  | 'trx'
  | 'step'
  | 'foam-roller'
  | 'barre-musculation'
  | 'anneaux'
  | 'aucun';

export type Intensity = 'douce' | 'moderee' | 'intense';

export type BodyFocus = 'upper' | 'lower' | 'core' | 'full';

export interface CustomSessionInput {
  mode: CustomSessionMode;
  preset?: CustomSessionPreset;
  duration: number;
  equipment?: Equipment[];
  intensity?: Intensity;
  bodyFocus?: BodyFocus[];
  preferences?: string;
  refinementNote?: string;
  previousSession?: Session;
}

export interface CustomSessionRecord {
  id: string;
  user_id: string;
  mode: CustomSessionMode;
  preset: CustomSessionPreset | null;
  duration_minutes: number;
  equipment: string[];
  intensity: string | null;
  body_focus: string[];
  preferences: string | null;
  refinement_note: string | null;
  status: 'draft' | 'confirmed';
  session_data: Session;
  input_tokens: number | null;
  output_tokens: number | null;
  model: string | null;
  created_at: string;
}

export interface GenerateSessionResponse {
  session: Session;
  customSessionId: string;
}
