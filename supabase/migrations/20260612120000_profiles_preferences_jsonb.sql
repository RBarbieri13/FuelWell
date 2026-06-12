-- Per-user preferences persistence (likes/dislikes/diets/allergies/units).
-- Synced by usePreferences (client write-through) and the coach
-- update_preferences tool. Applied to remote 2026-06-12 via MCP.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferences_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.preferences_jsonb IS
  'User food/app preferences: { likes: text[], dislikes: text[], diets: text[], allergies: text[], units: metric|imperial }. Synced by usePreferences and the coach update_preferences tool.';
