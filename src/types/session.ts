export interface Alternative {
  name: string;
  equipment?: string;
  instructions?: string;
}

export interface WarmupExercise {
  name: string;
  duration: number;
  instructions: string;
  bilateral?: boolean;
  alternative?: Alternative;
}

export interface WarmupBlock {
  type: "warmup";
  name: string;
  exercises: WarmupExercise[];
}

export interface CooldownBlock {
  type: "cooldown";
  name: string;
  exercises: WarmupExercise[];
}

export interface ClassicExercise {
  name: string;
  sets: number;
  reps: number | "max";
  restBetweenSets: number;
  tempo?: string;
  instructions: string;
  bilateral?: boolean;
  alternative?: Alternative;
}

export interface ClassicBlock {
  type: "classic";
  name: string;
  restBetweenExercises: number;
  exercises: ClassicExercise[];
}

export interface CircuitExercise {
  name: string;
  mode: "timed" | "reps";
  duration?: number;
  reps?: number;
  instructions: string;
  bilateral?: boolean;
  alternative?: Alternative;
}

export interface CircuitBlock {
  type: "circuit";
  name: string;
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  exercises: CircuitExercise[];
}

export interface HIITExercise {
  name: string;
  instructions: string;
  alternative?: Alternative;
}

export interface HIITBlock {
  type: "hiit";
  name: string;
  rounds: number;
  work: number;
  rest: number;
  exercises: HIITExercise[];
}

export interface TabataBlock {
  type: "tabata";
  name: string;
  sets?: number;
  rounds?: number;
  work?: number;
  rest?: number;
  restBetweenSets?: number;
  exercises: { name: string; instructions: string }[];
}

export interface EMOMExercise {
  name: string;
  reps: number;
  instructions: string;
}

export interface EMOMBlock {
  type: "emom";
  name: string;
  minutes: number;
  intervalDuration?: number;
  exercises: EMOMExercise[];
}

export interface AMRAPExercise {
  name: string;
  reps: number;
  instructions: string;
}

export interface AMRAPBlock {
  type: "amrap";
  name: string;
  duration: number;
  exercises: AMRAPExercise[];
}

export interface SupersetPair {
  exercises: {
    name: string;
    reps: number;
    instructions: string;
  }[];
}

export interface SupersetBlock {
  type: "superset";
  name: string;
  sets: number;
  restBetweenSets: number;
  restBetweenPairs?: number;
  pairs: SupersetPair[];
}

export interface PyramidBlock {
  type: "pyramid";
  name: string;
  pattern: number[];
  restBetweenSets: number;
  restBetweenExercises?: number;
  exercises: { name: string; instructions: string }[];
}

export type Block =
  | WarmupBlock
  | CooldownBlock
  | ClassicBlock
  | CircuitBlock
  | HIITBlock
  | TabataBlock
  | EMOMBlock
  | AMRAPBlock
  | SupersetBlock
  | PyramidBlock;

export type BlockType = Block["type"];

export interface Session {
  schema_version?: 1;
  date: string;
  title: string;
  description: string;
  estimatedDuration: number;
  focus: string[];
  blocks: Block[];
}

/** Where to fetch sessions from — extensible for future Supabase source. */
export type SessionSource =
  | { type: 'static' }
  | { type: 'api'; baseUrl: string };
