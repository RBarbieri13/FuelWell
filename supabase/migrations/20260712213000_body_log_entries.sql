-- Durable per-user body logs for weight, mood, and water.

CREATE TABLE public.body_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key UUID NOT NULL DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(8,2) CHECK (weight_kg IS NULL OR weight_kg BETWEEN 20 AND 350),
  mood SMALLINT CHECK (mood IS NULL OR mood BETWEEN 1 AND 5),
  water_ml INTEGER CHECK (water_ml IS NULL OR water_ml BETWEEN 0 AND 50000),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT body_log_entries_has_measurement
    CHECK (weight_kg IS NOT NULL OR mood IS NOT NULL OR water_ml IS NOT NULL),
  CONSTRAINT body_log_entries_user_date_key UNIQUE (user_id, entry_date),
  CONSTRAINT body_log_entries_user_idempotency_key UNIQUE (user_id, idempotency_key)
);

COMMENT ON TABLE public.body_log_entries IS
  'One user-owned body snapshot per day. Stable UUID idempotency keys make retried writes safe.';

CREATE INDEX body_log_entries_user_date_idx
  ON public.body_log_entries (user_id, entry_date DESC, recorded_at DESC);

ALTER TABLE public.body_log_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.body_log_entries FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.body_log_entries TO authenticated;

CREATE POLICY "body_log_entries_select_own" ON public.body_log_entries
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "body_log_entries_insert_own" ON public.body_log_entries
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "body_log_entries_update_own" ON public.body_log_entries
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "body_log_entries_delete_own" ON public.body_log_entries
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Down guidance (manual rollback after exporting user data):
-- DROP TABLE IF EXISTS public.body_log_entries;
