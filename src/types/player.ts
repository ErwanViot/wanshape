import type { BlockType } from './session.ts';

export type TimerMode = "countdown" | "countup" | "manual" | "emom" | "amrap";
export type StepPhase = "work" | "rest" | "prepare" | "transition";
export type PlayerStatus = "idle" | "countdown" | "active" | "rest" | "transition" | "paused" | "complete";

export interface StepRoundInfo {
  current: number;
  total: number;
}

export interface NextStepPreview {
  exerciseName: string;
  description: string;
}

export interface AMRAPExerciseInfo {
  name: string;
  reps: number;
}

export interface AtomicStep {
  id: string;
  phase: StepPhase;
  timerMode: TimerMode;
  duration: number | null;

  exerciseName: string;
  instructions: string;
  repTarget?: number | "max";
  tempo?: string;

  blockName: string;
  blockType: BlockType;
  blockColor: string;
  blockIndex: number;
  totalBlocks: number;

  roundInfo?: StepRoundInfo;
  setInfo?: StepRoundInfo;
  intervalInfo?: StepRoundInfo;
  exerciseInfo?: StepRoundInfo;

  nextStepPreview?: NextStepPreview;

  countdownBeforeStart?: boolean;
  isLastInBlock?: boolean;
  isLastInRound?: boolean;

  amrapExercises?: AMRAPExerciseInfo[];
  emomExercises?: AMRAPExerciseInfo[];

  estimatedDuration: number;
}

export interface PlayerState {
  status: PlayerStatus;
  steps: AtomicStep[];
  currentStepIndex: number;
  elapsedTotal: number;
  amrapRounds: number;
  previousStatus: PlayerStatus | null;
}
