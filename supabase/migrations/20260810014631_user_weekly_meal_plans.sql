-- Durable, user-owned weekly meal plans. The entire week is replaced as one
-- validated JSON document so client swaps cannot leave a partially saved plan.

CREATE TABLE public.user_weekly_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_days JSONB NOT NULL DEFAULT '[]'::JSONB
    CHECK (jsonb_typeof(plan_days) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_weekly_meal_plans_user_week_key UNIQUE (user_id, week_start),
  CONSTRAINT user_weekly_meal_plans_monday_start
    CHECK (EXTRACT(ISODOW FROM week_start) = 1)
);

COMMENT ON TABLE public.user_weekly_meal_plans IS
  'One server-authoritative meal-plan document per authenticated user and Monday week start.';
COMMENT ON COLUMN public.user_weekly_meal_plans.plan_days IS
  'Validated FuelWell PlanDay array. An empty array is an authoritative empty plan.';

CREATE INDEX user_weekly_meal_plans_user_week_idx
  ON public.user_weekly_meal_plans (user_id, week_start DESC);

ALTER TABLE public.user_weekly_meal_plans ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_weekly_meal_plans FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.user_weekly_meal_plans TO authenticated;

CREATE POLICY "user_weekly_meal_plans_select_own"
  ON public.user_weekly_meal_plans
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_weekly_meal_plans_insert_own"
  ON public.user_weekly_meal_plans
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_weekly_meal_plans_update_own"
  ON public.user_weekly_meal_plans
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_weekly_meal_plans_delete_own"
  ON public.user_weekly_meal_plans
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE TRIGGER set_updated_at_user_weekly_meal_plans
  BEFORE UPDATE ON public.user_weekly_meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Account deletion is covered by profiles(id) ON DELETE CASCADE. The existing
-- delete_own_account() RPC removes auth.users, which cascades through profiles.

-- Down guidance (manual rollback after exporting account data):
-- DROP TABLE IF EXISTS public.user_weekly_meal_plans;
