-- Phase 4: Custom AI-generated programs

-- Extend programs table for user-generated programs
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS onboarding_data jsonb,
  ADD COLUMN IF NOT EXISTS note_coach text,
  ADD COLUMN IF NOT EXISTS progression jsonb,
  ADD COLUMN IF NOT EXISTS consignes_semaine jsonb,
  ADD COLUMN IF NOT EXISTS generation_metadata jsonb,
  ADD COLUMN IF NOT EXISTS input_tokens integer,
  ADD COLUMN IF NOT EXISTS output_tokens integer,
  ADD COLUMN IF NOT EXISTS model text;

-- Fix FK: session_completions.program_session_id should SET NULL on delete
-- so completion history is preserved when a custom program is deleted
ALTER TABLE session_completions
  DROP CONSTRAINT IF EXISTS fk_completions_program_session;
ALTER TABLE session_completions
  DROP CONSTRAINT IF EXISTS session_completions_program_session_id_fkey;
ALTER TABLE session_completions
  ADD CONSTRAINT session_completions_program_session_id_fkey
  FOREIGN KEY (program_session_id) REFERENCES program_sessions(id)
  ON DELETE SET NULL;

-- RLS: programs — users can read fixed programs OR their own
DROP POLICY IF EXISTS "read fixed programs" ON programs;
CREATE POLICY "read programs" ON programs FOR SELECT USING (
  is_fixed = true OR (user_id IS NOT NULL AND auth.uid() = user_id)
);
CREATE POLICY "insert own programs" ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_fixed = false);
CREATE POLICY "update own programs" ON programs FOR UPDATE
  USING (auth.uid() = user_id AND is_fixed = false);
CREATE POLICY "delete own programs" ON programs FOR DELETE
  USING (auth.uid() = user_id AND is_fixed = false);

-- RLS: program_sessions — read if fixed program OR own program
DROP POLICY IF EXISTS "read fixed program sessions" ON program_sessions;
CREATE POLICY "read program sessions" ON program_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM programs WHERE id = program_id
    AND (is_fixed = true OR (user_id IS NOT NULL AND auth.uid() = user_id)))
);
CREATE POLICY "insert own program sessions" ON program_sessions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM programs WHERE id = program_id
    AND user_id = auth.uid() AND is_fixed = false));
CREATE POLICY "delete own program sessions" ON program_sessions FOR DELETE
  USING (EXISTS (SELECT 1 FROM programs WHERE id = program_id
    AND user_id = auth.uid() AND is_fixed = false));

-- Index for fast user program lookups
CREATE INDEX IF NOT EXISTS idx_programs_user ON programs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
