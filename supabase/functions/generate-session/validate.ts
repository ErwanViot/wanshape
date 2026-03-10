const VALID_BLOCK_TYPES = [
  'warmup',
  'cooldown',
  'classic',
  'circuit',
  'hiit',
  'tabata',
  'emom',
  'amrap',
  'superset',
  'pyramid',
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
  // Strip HTML tags and URLs
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .slice(0, MAX_STRING_LENGTH);
}

function sanitizeSession(session: Record<string, unknown>): void {
  if (isString(session.title))
    session.title = sanitizeString(session.title);
  if (isString(session.description))
    session.description = sanitizeString(session.description);

  if (isArray(session.focus)) {
    session.focus = (session.focus as string[]).map((f) =>
      sanitizeString(f),
    );
  }

  if (isArray(session.blocks)) {
    for (const block of session.blocks as Record<string, unknown>[]) {
      if (isString(block.name)) block.name = sanitizeString(block.name);
      if (isArray(block.exercises)) {
        for (const ex of block.exercises as Record<string, unknown>[]) {
          if (isString(ex.name)) ex.name = sanitizeString(ex.name);
          if (isString(ex.instructions))
            ex.instructions = sanitizeString(ex.instructions);
        }
      }
      if (isArray(block.pairs)) {
        for (const pair of block.pairs as Record<string, unknown>[]) {
          if (isArray(pair.exercises)) {
            for (const ex of pair.exercises as Record<
              string,
              unknown
            >[]) {
              if (isString(ex.name)) ex.name = sanitizeString(ex.name);
              if (isString(ex.instructions))
                ex.instructions = sanitizeString(ex.instructions);
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
        if (!isString(ex.name))
          return { valid: false, error: `${blockType}: exercise name required` };
        if (!isNumber(ex.duration))
          return {
            valid: false,
            error: `${blockType}: exercise duration required`,
          };
        if (!isString(ex.instructions))
          return {
            valid: false,
            error: `${blockType}: exercise instructions required`,
          };
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
        if (!isString(ex.name))
          return { valid: false, error: 'classic: exercise name required' };
        if (!isNumber(ex.sets))
          return { valid: false, error: 'classic: exercise sets required' };
        if (!isNumber(ex.reps) && ex.reps !== 'max')
          return { valid: false, error: 'classic: exercise reps required' };
        if (!isNumber(ex.restBetweenSets))
          return {
            valid: false,
            error: 'classic: exercise restBetweenSets required',
          };
        if (!isString(ex.instructions))
          return {
            valid: false,
            error: 'classic: exercise instructions required',
          };
      }
      return { valid: true };
    }

    case 'circuit': {
      if (!isNumber(block.rounds))
        return { valid: false, error: 'circuit: rounds required' };
      if (!isNumber(block.restBetweenExercises))
        return { valid: false, error: 'circuit: restBetweenExercises required' };
      if (!isNumber(block.restBetweenRounds))
        return { valid: false, error: 'circuit: restBetweenRounds required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'circuit: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'circuit: exercise name required' };
        if (ex.mode !== 'timed' && ex.mode !== 'reps')
          return { valid: false, error: 'circuit: exercise mode must be timed or reps' };
        if (!isString(ex.instructions))
          return {
            valid: false,
            error: 'circuit: exercise instructions required',
          };
      }
      return { valid: true };
    }

    case 'hiit': {
      if (!isNumber(block.rounds))
        return { valid: false, error: 'hiit: rounds required' };
      if (!isNumber(block.work))
        return { valid: false, error: 'hiit: work required' };
      if (!isNumber(block.rest))
        return { valid: false, error: 'hiit: rest required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'hiit: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'hiit: exercise name required' };
        if (!isString(ex.instructions))
          return { valid: false, error: 'hiit: exercise instructions required' };
      }
      return { valid: true };
    }

    case 'tabata': {
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'tabata: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'tabata: exercise name required' };
        if (!isString(ex.instructions))
          return {
            valid: false,
            error: 'tabata: exercise instructions required',
          };
      }
      return { valid: true };
    }

    case 'emom': {
      if (!isNumber(block.minutes))
        return { valid: false, error: 'emom: minutes required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'emom: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'emom: exercise name required' };
        if (!isNumber(ex.reps))
          return { valid: false, error: 'emom: exercise reps required' };
        if (!isString(ex.instructions))
          return { valid: false, error: 'emom: exercise instructions required' };
      }
      return { valid: true };
    }

    case 'amrap': {
      if (!isNumber(block.duration))
        return { valid: false, error: 'amrap: duration required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'amrap: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'amrap: exercise name required' };
        if (!isNumber(ex.reps))
          return { valid: false, error: 'amrap: exercise reps required' };
        if (!isString(ex.instructions))
          return { valid: false, error: 'amrap: exercise instructions required' };
      }
      return { valid: true };
    }

    case 'superset': {
      if (!isNumber(block.sets))
        return { valid: false, error: 'superset: sets required' };
      if (!isNumber(block.restBetweenSets))
        return { valid: false, error: 'superset: restBetweenSets required' };
      const pairs = block.pairs;
      if (!isArray(pairs) || pairs.length === 0)
        return { valid: false, error: 'superset: pairs required' };
      for (const pair of pairs as Record<string, unknown>[]) {
        if (!isArray(pair.exercises) || pair.exercises.length === 0)
          return { valid: false, error: 'superset: pair exercises required' };
        for (const ex of pair.exercises as Record<string, unknown>[]) {
          if (!isString(ex.name))
            return { valid: false, error: 'superset: exercise name required' };
          if (!isNumber(ex.reps))
            return { valid: false, error: 'superset: exercise reps required' };
          if (!isString(ex.instructions))
            return {
              valid: false,
              error: 'superset: exercise instructions required',
            };
        }
      }
      return { valid: true };
    }

    case 'pyramid': {
      if (!isArray(block.pattern) || block.pattern.length === 0)
        return { valid: false, error: 'pyramid: pattern required' };
      if (!isNumber(block.restBetweenSets))
        return { valid: false, error: 'pyramid: restBetweenSets required' };
      const exercises = block.exercises;
      if (!isArray(exercises) || exercises.length === 0)
        return { valid: false, error: 'pyramid: exercises required' };
      for (const ex of exercises as Record<string, unknown>[]) {
        if (!isString(ex.name))
          return { valid: false, error: 'pyramid: exercise name required' };
        if (!isString(ex.instructions))
          return {
            valid: false,
            error: 'pyramid: exercise instructions required',
          };
      }
      return { valid: true };
    }

    default:
      return { valid: false, error: `Unknown block type: ${blockType}` };
  }
}

export function validateSession(
  data: unknown,
): ValidationResult {
  if (!data || typeof data !== 'object')
    return { valid: false, error: 'Session must be an object' };

  const session = data as Record<string, unknown>;

  // Check for off-topic response
  if (session.error === 'off_topic')
    return { valid: false, error: 'off_topic' };

  // Top-level fields
  if (!isString(session.title))
    return { valid: false, error: 'title is required' };
  if (!isString(session.description))
    return { valid: false, error: 'description is required' };
  if (!isNumber(session.estimatedDuration))
    return { valid: false, error: 'estimatedDuration is required' };
  if (!isArray(session.focus) || session.focus.length === 0)
    return { valid: false, error: 'focus array is required' };
  if (!isArray(session.blocks) || session.blocks.length < 2)
    return { valid: false, error: 'At least 2 blocks required (warmup + cooldown)' };

  const blocks = session.blocks as Record<string, unknown>[];

  // First block must be warmup
  if (blocks[0].type !== 'warmup')
    return { valid: false, error: 'First block must be warmup' };

  // Last block must be cooldown
  if (blocks[blocks.length - 1].type !== 'cooldown')
    return { valid: false, error: 'Last block must be cooldown' };

  // Validate each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockType = block.type as string;

    if (!VALID_BLOCK_TYPES.includes(blockType as BlockType))
      return { valid: false, error: `Block ${i}: invalid type "${blockType}"` };

    if (!isString(block.name))
      return { valid: false, error: `Block ${i}: name required` };

    const result = validateBlockExercises(block, blockType as BlockType);
    if (!result.valid)
      return { valid: false, error: `Block ${i}: ${result.error}` };
  }

  // Sanitize strings
  sanitizeSession(session);

  return { valid: true };
}
