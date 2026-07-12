-- Durable fitness, activity, grocery, and recipe-review persistence.
--
-- This migration only defines schema and Data API access. It is intentionally
-- not coupled to a remote apply step. Client-provided idempotency keys make
-- retried writes safe, while generated defaults keep ordinary inserts usable.

CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  workout_library_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  calories_burned NUMERIC(8,1) CHECK (calories_burned IS NULL OR calories_burned >= 0),
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workout_sessions_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT workout_sessions_id_user_key UNIQUE (id, user_id),
  CONSTRAINT workout_sessions_time_order CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_session_id UUID NOT NULL,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  exercise_library_id TEXT,
  name TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  target_sets INTEGER CHECK (target_sets IS NULL OR target_sets >= 0),
  target_reps TEXT,
  rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workout_exercises_session_owner_fk
    FOREIGN KEY (workout_session_id, user_id)
    REFERENCES public.workout_sessions(id, user_id) ON DELETE CASCADE,
  CONSTRAINT workout_exercises_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT workout_exercises_session_position_key UNIQUE (workout_session_id, position),
  CONSTRAINT workout_exercises_id_session_user_key UNIQUE (id, workout_session_id, user_id)
);

CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_session_id UUID NOT NULL,
  workout_exercise_id UUID NOT NULL,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  set_type TEXT NOT NULL DEFAULT 'working'
    CHECK (set_type IN ('warmup', 'working', 'drop', 'failure', 'cooldown')),
  reps NUMERIC(6,2) CHECK (reps IS NULL OR reps >= 0),
  weight_kg NUMERIC(8,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  distance_meters NUMERIC(10,2) CHECK (distance_meters IS NULL OR distance_meters >= 0),
  perceived_exertion NUMERIC(3,1)
    CHECK (perceived_exertion IS NULL OR perceived_exertion BETWEEN 0 AND 10),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workout_sets_exercise_owner_fk
    FOREIGN KEY (workout_exercise_id, workout_session_id, user_id)
    REFERENCES public.workout_exercises(id, workout_session_id, user_id) ON DELETE CASCADE,
  CONSTRAINT workout_sets_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT workout_sets_exercise_number_key UNIQUE (workout_exercise_id, set_number)
);

CREATE TABLE public.activity_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  calories_burned NUMERIC(8,1) CHECK (calories_burned IS NULL OR calories_burned >= 0),
  distance_meters NUMERIC(12,2) CHECK (distance_meters IS NULL OR distance_meters >= 0),
  steps INTEGER CHECK (steps IS NULL OR steps >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_entries_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT activity_entries_time_order CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);

CREATE UNIQUE INDEX activity_entries_user_source_external_key
  ON public.activity_entries (user_id, source, external_id)
  WHERE external_id IS NOT NULL;

CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  list_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL DEFAULT 'Grocery list',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT grocery_lists_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT grocery_lists_user_date_name_key UNIQUE (user_id, list_date, name),
  CONSTRAINT grocery_lists_id_user_key UNIQUE (id, user_id)
);

CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grocery_list_id UUID NOT NULL,
  idempotency_key TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  normalized_name TEXT GENERATED ALWAYS AS (LOWER(BTRIM(name))) STORED,
  quantity NUMERIC(10,2) CHECK (quantity IS NULL OR quantity > 0),
  unit TEXT,
  quantity_text TEXT,
  category TEXT,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  source_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT grocery_items_list_owner_fk
    FOREIGN KEY (grocery_list_id, user_id)
    REFERENCES public.grocery_lists(id, user_id) ON DELETE CASCADE,
  CONSTRAINT grocery_items_user_idempotency_key UNIQUE (user_id, idempotency_key),
  CONSTRAINT grocery_items_list_name_key UNIQUE (grocery_list_id, normalized_name)
);

-- Recipe review state is intentionally separate from user-owned recipes.
-- Recipe owners can read their review result but cannot approve themselves.
-- Recommendation queries must require recommendation_eligible = TRUE.
CREATE TABLE public.recipe_quality_status (
  recipe_id UUID PRIMARY KEY REFERENCES public.recipes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'quarantined')),
  quality_score NUMERIC(4,3) NOT NULL DEFAULT 0
    CHECK (quality_score BETWEEN 0 AND 1),
  recommendation_eligible BOOLEAN GENERATED ALWAYS AS
    (status = 'approved' AND quality_score >= 0.800) STORED,
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workout_sessions IS 'User-owned planned and completed workout sessions. Supply a stable idempotency_key when retrying writes.';
COMMENT ON TABLE public.workout_exercises IS 'User-owned ordered exercises belonging to a workout session.';
COMMENT ON TABLE public.workout_sets IS 'User-owned set-level performance belonging to a workout exercise and session.';
COMMENT ON TABLE public.activity_entries IS 'User-owned manual or integration activity events. external_id deduplicates provider imports.';
COMMENT ON TABLE public.grocery_lists IS 'User-owned dated grocery lists. One list name may occur once per user and date.';
COMMENT ON TABLE public.grocery_items IS 'User-owned deduplicated grocery items belonging to a grocery list.';
COMMENT ON TABLE public.recipe_quality_status IS 'Admin-reviewed recipe quality gate. Only eligible rows may enter recommendations.';
COMMENT ON COLUMN public.recipe_quality_status.recommendation_eligible IS 'Derived guard: approved recipes require a quality score of at least 0.800.';

CREATE INDEX workout_sessions_user_date_idx
  ON public.workout_sessions (user_id, session_date DESC, created_at DESC);
CREATE INDEX workout_exercises_user_session_idx
  ON public.workout_exercises (user_id, workout_session_id, position);
CREATE INDEX workout_sets_user_session_idx
  ON public.workout_sets (user_id, workout_session_id, workout_exercise_id, set_number);
CREATE INDEX activity_entries_user_date_idx
  ON public.activity_entries (user_id, activity_date DESC, created_at DESC);
CREATE INDEX grocery_lists_user_date_idx
  ON public.grocery_lists (user_id, list_date DESC, created_at DESC);
CREATE INDEX grocery_items_user_list_idx
  ON public.grocery_items (user_id, grocery_list_id, checked, position);
CREATE INDEX recipe_quality_recommendation_idx
  ON public.recipe_quality_status (quality_score DESC, recipe_id)
  WHERE recommendation_eligible = TRUE;

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_quality_status ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.workout_sessions FROM anon, authenticated;
REVOKE ALL ON TABLE public.workout_exercises FROM anon, authenticated;
REVOKE ALL ON TABLE public.workout_sets FROM anon, authenticated;
REVOKE ALL ON TABLE public.activity_entries FROM anon, authenticated;
REVOKE ALL ON TABLE public.grocery_lists FROM anon, authenticated;
REVOKE ALL ON TABLE public.grocery_items FROM anon, authenticated;
REVOKE ALL ON TABLE public.recipe_quality_status FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.activity_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.grocery_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.grocery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recipe_quality_status TO authenticated;

CREATE POLICY "workout_sessions_select_own" ON public.workout_sessions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sessions_insert_own" ON public.workout_sessions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sessions_update_own" ON public.workout_sessions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sessions_delete_own" ON public.workout_sessions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "workout_exercises_select_own" ON public.workout_exercises
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_exercises_insert_own" ON public.workout_exercises
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_exercises_update_own" ON public.workout_exercises
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_exercises_delete_own" ON public.workout_exercises
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "workout_sets_select_own" ON public.workout_sets
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sets_insert_own" ON public.workout_sets
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sets_update_own" ON public.workout_sets
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "workout_sets_delete_own" ON public.workout_sets
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "activity_entries_select_own" ON public.activity_entries
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_entries_insert_own" ON public.activity_entries
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_entries_update_own" ON public.activity_entries
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "activity_entries_delete_own" ON public.activity_entries
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "grocery_lists_select_own" ON public.grocery_lists
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_lists_insert_own" ON public.grocery_lists
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_lists_update_own" ON public.grocery_lists
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_lists_delete_own" ON public.grocery_lists
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "grocery_items_select_own" ON public.grocery_items
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_items_insert_own" ON public.grocery_items
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_items_update_own" ON public.grocery_items
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "grocery_items_delete_own" ON public.grocery_items
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "recipe_quality_status_select_visible" ON public.recipe_quality_status
  FOR SELECT TO authenticated
  USING (
    COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.recipes
      WHERE recipes.id = recipe_quality_status.recipe_id
        AND (
          recipes.user_id = (SELECT auth.uid())
          OR (recipes.is_public = TRUE AND recipe_quality_status.recommendation_eligible = TRUE)
        )
    )
  );
CREATE POLICY "recipe_quality_status_insert_admin" ON public.recipe_quality_status
  FOR INSERT TO authenticated
  WITH CHECK (COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');
CREATE POLICY "recipe_quality_status_update_admin" ON public.recipe_quality_status
  FOR UPDATE TO authenticated
  USING (COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  WITH CHECK (COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');
CREATE POLICY "recipe_quality_status_delete_admin" ON public.recipe_quality_status
  FOR DELETE TO authenticated
  USING (COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

CREATE TRIGGER set_updated_at_workout_sessions
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_workout_exercises
  BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_workout_sets
  BEFORE UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_activity_entries
  BEFORE UPDATE ON public.activity_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_grocery_lists
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_grocery_items
  BEFORE UPDATE ON public.grocery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_recipe_quality_status
  BEFORE UPDATE ON public.recipe_quality_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Down guidance (manual rollback; intentionally not executable in an up migration):
-- DROP TABLE IF EXISTS public.recipe_quality_status;
-- DROP TABLE IF EXISTS public.grocery_items;
-- DROP TABLE IF EXISTS public.grocery_lists;
-- DROP TABLE IF EXISTS public.activity_entries;
-- DROP TABLE IF EXISTS public.workout_sets;
-- DROP TABLE IF EXISTS public.workout_exercises;
-- DROP TABLE IF EXISTS public.workout_sessions;
