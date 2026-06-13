-- Goal-based meal logging loop: active goals, audit events, daily contexts,
-- and platform integration summaries. All user data stays RLS-scoped.

CREATE TABLE IF NOT EXISTS public.goal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_goal TEXT NOT NULL CHECK (primary_goal IN ('lose', 'maintain', 'gain', 'perform', 'recomp', 'custom')),
  goal_reason TEXT NOT NULL DEFAULT '',
  target_weight_kg NUMERIC(5,1),
  weekly_rate_kg NUMERIC(4,2),
  protein_strategy TEXT NOT NULL DEFAULT 'high-protein' CHECK (protein_strategy IN ('standard', 'high-protein', 'performance', 'recovery')),
  training_priority TEXT NOT NULL DEFAULT 'general' CHECK (training_priority IN ('strength', 'endurance', 'hybrid', 'general')),
  calorie_floor INTEGER NOT NULL DEFAULT 1500,
  calorie_ceiling INTEGER NOT NULL DEFAULT 2500,
  macro_targets JSONB NOT NULL DEFAULT '{"calories":2000,"protein":150,"carbs":250,"fat":65}'::jsonb,
  adaptation_policy TEXT NOT NULL DEFAULT 'conservative' CHECK (adaptation_policy = 'conservative'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_goal_plans_one_active
  ON public.goal_plans(user_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.goal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_plan_id UUID REFERENCES public.goal_plans(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'adaptation_proposed', 'adaptation_accepted', 'adaptation_declined', 'paused', 'completed')),
  reason TEXT NOT NULL DEFAULT '',
  before_jsonb JSONB DEFAULT '{}'::jsonb,
  after_jsonb JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('garmin', 'healthkit', 'health_connect')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connected', 'preview_sample', 'error')),
  provider_user_id TEXT,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  metadata_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS public.integration_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connected_account_id UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('garmin', 'healthkit', 'health_connect')),
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER,
  active_calories INTEGER,
  sleep_hours NUMERIC(4,2),
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
  body_battery INTEGER CHECK (body_battery BETWEEN 0 AND 100),
  recovery_label TEXT,
  workout_planned TEXT,
  confidence_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, summary_date)
);

CREATE TABLE IF NOT EXISTS public.daily_goal_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_plan_id UUID REFERENCES public.goal_plans(id) ON DELETE SET NULL,
  context_date DATE NOT NULL DEFAULT CURRENT_DATE,
  targets_jsonb JSONB NOT NULL,
  totals_jsonb JSONB NOT NULL,
  remaining_jsonb JSONB NOT NULL,
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  guidance_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, context_date)
);

ALTER TABLE public.goal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goal_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goal plans" ON public.goal_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own goal events" ON public.goal_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own connected accounts" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own integration summaries" ON public.integration_daily_summaries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily goal contexts" ON public.daily_goal_contexts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
