// Re-use session validation from generate-session
// We import the logic inline since Deno edge functions can't share across directories easily

const VALID_BLOCK_TYPES = [
  'warmup', 'cooldown', 'classic', 'circuit', 'hiit',
  'tabata', 'emom', 'amrap', 'superset', 'pyramid',
] as const;

type BlockType = (typeof VALID_BLOCK_TYPES)[number];

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

const MAX_STRING_LENGTH = 500;

function sanitizeString(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .slice(0, MAX_STRING_LENGTH);
}

function sanitizeSession(session: Record<string, unknown>): void {
  if (isString(session.title)) session.title = sanitizeString(session.title);
  if (isString(session.description)) session.description = sanitizeString(session.description);
  if (isArray(session.focus)) {
    session.focus = (session.focus as string[]).map(sanitizeString);
  }
  if (isArray(session.blocks)) {
    for (const block of session.blocks as Record<string, unknown>[]) {
      if (isString(block.name)) block.name = sanitizeString(block.name);
      if (isArray(block.exercises)) {
        for (const ex of block.exercises as Record<string, unknown>[]) {
          if (isString(ex.name)) ex.name = sanitizeString(ex.name);
          if (isString(ex.instructions)) ex.instructions = sanitizeString(ex.instructions);
        }
      }
      if (isArray(block.pairs)) {
        for (const pair of block.pairs as Record<string, unknown>[]) {
          if (isArray(pair.exercises)) {
            for (const ex of pair.exercises as Record<string, unknown>[]) {
              if (isString(ex.name)) ex.name = sanitizeString(ex.name);
              if (isString(ex.instructions)) ex.instructions = sanitizeString(ex.instructions);
            }
          }
        }
      }
    }
  }
}

function validateBlockExercises(
  block: Record<string, unknown>,
  blockType: BlockType,
): ValidationResult {
  switch (blockType) {
    case 'warmup':
    case 'cooldown': {
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: `${blockType}: exercises required` };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: `${blockType}: exercise name required` };
        if (!isNumber(ex.duration)) return { valid: false, error: `${blockType}: exercise duration required` };
        if (!isString(ex.instructions)) return { valid: false, error: `${blockType}: exercise instructions required` };
      }
      return { valid: true };
    }
    case 'classic': {
      if (!isNumber(block.restBetweenExercises))
        return { valid: false, error: 'classic: restBetweenExercises required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'classic: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'classic: exercise name required' };
        if (!isNumber(ex.sets)) return { valid: false, error: 'classic: exercise sets required' };
        if (!isNumber(ex.reps) && ex.reps !== 'max')
          return { valid: false, error: 'classic: exercise reps required' };
        if (!isNumber(ex.restBetweenSets)) return { valid: false, error: 'classic: exercise restBetweenSets required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'classic: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'circuit': {
      if (!isNumber(block.rounds)) return { valid: false, error: 'circuit: rounds required' };
      if (!isNumber(block.restBetweenExercises)) return { valid: false, error: 'circuit: restBetweenExercises required' };
      if (!isNumber(block.restBetweenRounds)) return { valid: false, error: 'circuit: restBetweenRounds required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'circuit: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'circuit: exercise name required' };
        if (ex.mode !== 'timed' && ex.mode !== 'reps')
          return { valid: false, error: 'circuit: exercise mode must be timed or reps' };
        if (!isString(ex.instructions)) return { valid: false, error: 'circuit: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'hiit': {
      if (!isNumber(block.rounds)) return { valid: false, error: 'hiit: rounds required' };
      if (!isNumber(block.work)) return { valid: false, error: 'hiit: work required' };
      if (!isNumber(block.rest)) return { valid: false, error: 'hiit: rest required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'hiit: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'hiit: exercise name required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'hiit: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'tabata': {
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'tabata: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'tabata: exercise name required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'tabata: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'emom': {
      if (!isNumber(block.minutes)) return { valid: false, error: 'emom: minutes required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'emom: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'emom: exercise name required' };
        if (!isNumber(ex.reps)) return { valid: false, error: 'emom: exercise reps required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'emom: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'amrap': {
      if (!isNumber(block.duration)) return { valid: false, error: 'amrap: duration required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'amrap: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'amrap: exercise name required' };
        if (!isNumber(ex.reps)) return { valid: false, error: 'amrap: exercise reps required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'amrap: exercise instructions required' };
      }
      return { valid: true };
    }
    case 'superset': {
      if (!isNumber(block.sets)) return { valid: false, error: 'superset: sets required' };
      if (!isNumber(block.restBetweenSets)) return { valid: false, error: 'superset: restBetweenSets required' };
      const pairs = block.pairs;
      if (!isArray(pairs) || pairs.length === 0)
        return { valid: false, error: 'superset: pairs required' };
      for (const pair of pairs as Record<string, unknown>[]) {
        if (!isArray(pair.exercises) || pair.exercises.length === 0)
          return { valid: false, error: 'superset: pair exercises required' };
        for (const ex of pair.exercises as Record<string, unknown>[]) {
          if (!isString(ex.name)) return { valid: false, error: 'superset: exercise name required' };
          if (!isNumber(ex.reps)) return { valid: false, error: 'superset: exercise reps required' };
          if (!isString(ex.instructions)) return { valid: false, error: 'superset: exercise instructions required' };
        }
      }
      return { valid: true };
    }
    case 'pyramid': {
      if (!isArray(block.pattern) || block.pattern.length === 0)
        return { valid: false, error: 'pyramid: pattern required' };
      if (!isNumber(block.restBetweenSets)) return { valid: false, error: 'pyramid: restBetweenSets required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'pyramid: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name)) return { valid: false, error: 'pyramid: exercise name required' };
        if (!isString(ex.instructions)) return { valid: false, error: 'pyramid: exercise instructions required' };
      }
      return { valid: true };
    }
    default:
      return { valid: false, error: `Unknown block type: ${blockType}` };
  }
}

export function validateSession(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object')
    return { valid: false, error: 'Session must be an object' };

  const session = data as Record<string, unknown>;

  if (!isString(session.title)) return { valid: false, error: 'title is required' };
  if (!isString(session.description)) return { valid: false, error: 'description is required' };
  if (!isNumber(session.estimatedDuration)) return { valid: false, error: 'estimatedDuration is required' };
  if (!isArray(session.focus) || session.focus.length === 0)
    return { valid: false, error: 'focus array is required' };
  if (!isArray(session.blocks) || session.blocks.length < 2)
    return { valid: false, error: 'At least 2 blocks required (warmup + cooldown)' };

  const blocks = session.blocks as Record<string, unknown>[];

  if (blocks[0].type !== 'warmup')
    return { valid: false, error: 'First block must be warmup' };
  if (blocks[blocks.length - 1].type !== 'cooldown')
    return { valid: false, error: 'Last block must be cooldown' };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockType = block.type as string;
    if (!VALID_BLOCK_TYPES.includes(blockType as BlockType))
      return { valid: false, error: `Block ${i}: invalid type "${blockType}"` };
    if (!isString(block.name))
      return { valid: false, error: `Block ${i}: name required` };
    const result = validateBlockExercises(block, blockType as BlockType);
    if (!result.valid) return { valid: false, error: `Block ${i}: ${result.error}` };
  }

  sanitizeSession(session);
  return { valid: true };
}

interface CalendrierEntry {
  semaines: number[];
  sequence: string[];
  /** Optional phase label (e.g. "Reprise", "Pic") — UI only, sanitized. */
  nom?: string;
}

/**
 * Expand a consigne key into the week numbers it covers. Handles the formats
 * the model is instructed to emit: "3" (single), "1-4" (range), "1,2,3" (list),
 * and combinations. Unparseable fragments are skipped (they simply don't
 * contribute coverage, which surfaces as a "week N not covered" error rather
 * than a false pass).
 */
function weeksFromConsigneKey(key: string): number[] {
  const weeks: number[] = [];
  for (const part of key.split(',')) {
    const bounds = part.trim().split('-');
    if (bounds.length === 2) {
      const start = Number.parseInt(bounds[0], 10);
      const end = Number.parseInt(bounds[1], 10);
      if (Number.isNaN(start) || Number.isNaN(end)) continue;
      for (let w = start; w <= end; w++) weeks.push(w);
    } else {
      const n = Number.parseInt(part.trim(), 10);
      if (!Number.isNaN(n)) weeks.push(n);
    }
  }
  return weeks;
}

export function validateProgram(
  data: unknown,
  expectedWeeks: number,
  maxSessionsPerWeek: number,
): ValidationResult {
  if (!data || typeof data !== 'object')
    return { valid: false, error: 'Program must be an object' };

  const program = data as Record<string, unknown>;

  // Check for off-topic response
  if (program.error === 'off_topic')
    return { valid: false, error: 'off_topic' };

  // Top-level fields
  if (!isString(program.titre)) return { valid: false, error: 'titre is required' };
  if (!isString(program.description)) return { valid: false, error: 'description is required' };
  if (!isString(program.niveau)) return { valid: false, error: 'niveau is required' };
  if (!['debutant', 'intermediaire', 'avance'].includes(program.niveau as string))
    return { valid: false, error: 'niveau must be debutant, intermediaire or avance' };
  if (!isString(program.note_coach) || (program.note_coach as string).length === 0)
    return { valid: false, error: 'note_coach is required' };

  // Progression
  if (!program.progression || typeof program.progression !== 'object')
    return { valid: false, error: 'progression is required' };
  const progression = program.progression as Record<string, unknown>;
  if (!isString(progression.logique))
    return { valid: false, error: 'progression.logique is required' };

  // Sessions
  if (!program.sessions || typeof program.sessions !== 'object')
    return { valid: false, error: 'sessions object is required' };
  const sessions = program.sessions as Record<string, unknown>;
  const sessionKeys = Object.keys(sessions);

  // Upper bound raised from 5 to 20 to allow periodised programs: a phased
  // program declares distinct sessions per phase (A1/B1 phase 1, A2/B2 phase
  // 2…), so the total unique-session count legitimately exceeds a single
  // week's session count. Worst realistic case = 4 phases × 5 sessions = 20.
  // The old `sessionKeys.length > maxSessionsPerWeek` cap is INTENTIONALLY
  // dropped — it was the exact constraint that forced every week to be
  // identical. The real per-week limit is enforced on each calendrier
  // sequence below (sequence.length <= maxSessionsPerWeek).
  if (sessionKeys.length < 2 || sessionKeys.length > 20)
    return { valid: false, error: `sessions must have 2-20 entries, got ${sessionKeys.length}` };

  // Validate each session
  for (const key of sessionKeys) {
    const sessionValidation = validateSession(sessions[key]);
    if (!sessionValidation.valid)
      return { valid: false, error: `Session "${key}": ${sessionValidation.error}` };
  }

  // Calendrier
  if (!isArray(program.calendrier) || program.calendrier.length === 0)
    return { valid: false, error: 'calendrier array is required' };

  const coveredWeeks = new Set<number>();
  for (const entry of program.calendrier as CalendrierEntry[]) {
    if (!isArray(entry.semaines) || entry.semaines.length === 0)
      return { valid: false, error: 'calendrier entry: semaines required' };
    if (!isArray(entry.sequence) || entry.sequence.length === 0)
      return { valid: false, error: 'calendrier entry: sequence required' };

    // A week can hold at most `seances_par_semaine` sessions. Fewer is allowed
    // (deload / taper weeks legitimately run a shorter sequence).
    if (entry.sequence.length > maxSessionsPerWeek)
      return {
        valid: false,
        error: `calendrier: sequence length (${entry.sequence.length}) exceeds seances_par_semaine (${maxSessionsPerWeek})`,
      };

    for (const week of entry.semaines) {
      if (!isNumber(week)) return { valid: false, error: 'calendrier: semaine must be a number' };
      // Overlap guard: a week assigned by two entries would insert duplicate
      // program_sessions rows (index.ts unrolls semaines × sequence), leaving
      // the player with an undefined week. A Set silently deduped this before.
      if (coveredWeeks.has(week))
        return { valid: false, error: `calendrier: week ${week} covered by multiple entries` };
      coveredWeeks.add(week);
    }

    for (const sessionId of entry.sequence) {
      if (!isString(sessionId))
        return { valid: false, error: 'calendrier: sequence item must be a string' };
      if (!sessionKeys.includes(sessionId))
        return { valid: false, error: `calendrier: session "${sessionId}" not found in sessions` };
    }
  }

  // Check all weeks covered
  for (let w = 1; w <= expectedWeeks; w++) {
    if (!coveredWeeks.has(w))
      return { valid: false, error: `calendrier: week ${w} not covered` };
  }

  // Consignes semaine
  if (!program.consignes_semaine || typeof program.consignes_semaine !== 'object')
    return { valid: false, error: 'consignes_semaine is required' };
  const consignes = program.consignes_semaine as Record<string, unknown>;
  const consigneKeys = Object.keys(consignes);
  if (consigneKeys.length === 0)
    return { valid: false, error: 'consignes_semaine must have at least one entry' };

  // Verify all consignes are strings
  for (const key of consigneKeys) {
    if (!isString(consignes[key]))
      return { valid: false, error: `consignes_semaine["${key}"] must be a string` };
  }

  // Verify the consigne ranges cover every week 1..expectedWeeks. Previously
  // the keys were opaque strings, so the model could silently skip a phase
  // (e.g. emit "1-4"/"5-8" for a 12-week program and forget "9-12"), leaving
  // those weeks without guidance in the UI. More failure-prone with phasing.
  const consigneWeeks = new Set<number>();
  for (const key of consigneKeys) {
    for (const w of weeksFromConsigneKey(key)) consigneWeeks.add(w);
  }
  for (let w = 1; w <= expectedWeeks; w++) {
    if (!consigneWeeks.has(w))
      return { valid: false, error: `consignes_semaine: week ${w} not covered` };
  }

  // Sanitize top-level strings
  program.titre = sanitizeString(program.titre as string);
  program.description = sanitizeString(program.description as string);
  // note_coach is longer (3-5 sentences), allow up to 2000 chars
  program.note_coach = (program.note_coach as string)
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .slice(0, 2000);

  // Sanitize progression strings
  if (isString(progression.logique)) progression.logique = sanitizeString(progression.logique);
  for (const key of ['cible_semaine_3', 'cible_semaine_6', 'cible_semaine_8', 'cible_semaine_12']) {
    if (isString(progression[key])) progression[key] = sanitizeString(progression[key] as string);
  }

  // Sanitize consignes_semaine values
  for (const key of consigneKeys) {
    consignes[key] = sanitizeString(consignes[key] as string);
  }

  // Optional `structure` tag ("repete" | "phase"). Advisory (analytics + UI),
  // never drives ingestion, but if present it must be one of the two values so
  // the stored signal stays trustworthy. Absent is fine (older/repeat outputs).
  if (program.structure !== undefined) {
    if (program.structure !== 'repete' && program.structure !== 'phase')
      return { valid: false, error: 'structure must be "repete" or "phase"' };
  }

  // Sanitize optional phase labels on calendrier entries (UI-facing text).
  for (const entry of program.calendrier as CalendrierEntry[]) {
    if (isString(entry.nom)) entry.nom = sanitizeString(entry.nom);
  }

  return { valid: true };
}
