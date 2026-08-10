-- Server-authoritative browser state that does not belong in a domain ledger.
-- The authenticated session owns user_id; clients never choose another user.

CREATE TABLE public.user_app_state (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_key TEXT NOT NULL
    CHECK (store_key IN ('onboarding_draft', 'grocery_history')),
  state_jsonb JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, store_key)
);

COMMENT ON TABLE public.user_app_state IS
  'Per-user server-authoritative onboarding drafts and grocery-history documents.';
COMMENT ON COLUMN public.user_app_state.state_jsonb IS
  'Validated by the corresponding authenticated API route before upsert.';

ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_app_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.user_app_state TO authenticated;

CREATE POLICY "user_app_state_select_own"
  ON public.user_app_state
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_app_state_insert_own"
  ON public.user_app_state
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_app_state_update_own"
  ON public.user_app_state
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_app_state_delete_own"
  ON public.user_app_state
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER set_updated_at_user_app_state
  BEFORE UPDATE ON public.user_app_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Atomic JSONB namespace updates prevent the preferences and unit controls
-- from overwriting unrelated profile settings during concurrent requests.
CREATE OR REPLACE FUNCTION public.merge_own_profile_preferences(patch JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  merged JSONB;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF patch IS NULL OR jsonb_typeof(patch) <> 'object' THEN
    RAISE EXCEPTION 'Preference patch must be a JSON object';
  END IF;

  UPDATE public.profiles
  SET preferences_jsonb = COALESCE(preferences_jsonb, '{}'::JSONB) || patch
  WHERE id = (SELECT auth.uid())
  RETURNING preferences_jsonb INTO merged;

  IF merged IS NULL THEN
    RAISE EXCEPTION 'Profile row not found';
  END IF;
  RETURN merged;
END;
$$;

REVOKE ALL ON FUNCTION public.merge_own_profile_preferences(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.merge_own_profile_preferences(JSONB) TO authenticated;

-- Down guidance (manual rollback after exporting user state):
-- DROP FUNCTION IF EXISTS public.merge_own_profile_preferences(JSONB);
-- DROP TABLE IF EXISTS public.user_app_state;
