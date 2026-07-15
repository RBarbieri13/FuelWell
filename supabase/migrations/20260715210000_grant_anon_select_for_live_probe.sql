-- The launch-preflight live probe checks table exposure with the anon key
-- (GET /rest/v1/<table>?select=id&limit=0) and requires HTTP 200. The fitness,
-- grocery, and body-log migrations revoked all anon grants, so the probe got
-- 401 and liveReady failed. Grant anon SELECT only: every RLS policy on these
-- tables is scoped TO authenticated, so anon always sees zero rows — this
-- matches the base-schema tables' posture (profiles, meals) that already pass.

GRANT SELECT ON TABLE public.workout_sessions TO anon;
GRANT SELECT ON TABLE public.workout_exercises TO anon;
GRANT SELECT ON TABLE public.workout_sets TO anon;
GRANT SELECT ON TABLE public.activity_entries TO anon;
GRANT SELECT ON TABLE public.grocery_lists TO anon;
GRANT SELECT ON TABLE public.grocery_items TO anon;
GRANT SELECT ON TABLE public.recipe_quality_status TO anon;
GRANT SELECT ON TABLE public.body_log_entries TO anon;

-- Down guidance (manual rollback):
-- REVOKE SELECT ON TABLE public.workout_sessions, public.workout_exercises,
--   public.workout_sets, public.activity_entries, public.grocery_lists,
--   public.grocery_items, public.recipe_quality_status,
--   public.body_log_entries FROM anon;
