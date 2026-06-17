-- 025_push_notifications.sql
-- Push notification infrastructure for native iOS/Android.
-- Two tables: per-device tokens and per-user category preferences.
-- Wan2Fit philosophy: notifications inform, never guilt. We deliberately
-- do NOT include a "daily reminder" or "streak" category — those would
-- conflict with the rest-day-friendly product principle.

-- ─── user_devices: FCM tokens with platform metadata ───
CREATE TABLE IF NOT EXISTS user_devices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token        TEXT NOT NULL,
  platform     TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_label TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own devices"
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- INSERT and UPDATE go through the register-push-device edge function so
-- we never expose the raw token to client-side joins. Service role bypasses
-- RLS so no policy is needed for edge fn writes.

-- ─── notification_preferences: per-user opt-in flags ───
-- Each column is a boolean opt-in for a notification CATEGORY. New
-- categories should be added with a clear non-coercive intent. Forbidden
-- categories (do not add): daily_reminder, streak, missed_day.
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Information that requires the user's attention (program updates,
  -- account events, security alerts). Default ON because users expect it.
  info                 BOOLEAN NOT NULL DEFAULT true,
  -- Progression milestones the user opted into (e.g. "1st program week
  -- completed"). Celebrative, never reminders. Default OFF — opt-in only.
  progression          BOOLEAN NOT NULL DEFAULT false,
  -- New content drops (recipes, programs). Default OFF.
  new_content          BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create default row for new users via trigger so the UI can always
-- read a row without an additional INSERT round-trip.
CREATE OR REPLACE FUNCTION ensure_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_notification_preferences ON auth.users;
CREATE TRIGGER create_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_notification_preferences();
