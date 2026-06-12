-- Coach agentic overhaul (v1.4): conversations, messages, usage ledger, audit log.
-- Additive only. RLS on every table.
-- Down (documentation): DROP TABLE coach_audit, coach_usage, coach_messages, coach_conversations;

CREATE TABLE IF NOT EXISTS public.coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.coach_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content_jsonb JSONB NOT NULL DEFAULT '{}',
  tool_calls_jsonb JSONB DEFAULT '[]',
  artifacts_jsonb JSONB DEFAULT '[]',
  model TEXT,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coach_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd_cents INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coach_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  args_jsonb JSONB DEFAULT '{}',
  result_summary TEXT,
  ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_conversation ON public.coach_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_coach_conversations_user ON public.coach_conversations(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_usage_user_day ON public.coach_usage(user_id, day);
CREATE INDEX IF NOT EXISTS idx_coach_audit_user_ts ON public.coach_audit(user_id, ts DESC);

ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own coach conversations" ON public.coach_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own coach messages" ON public.coach_messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.coach_conversations c
    WHERE c.id = coach_messages.conversation_id AND c.user_id = auth.uid()
  ));

-- Usage rows are written by the server route (user-scoped client), read by the user.
CREATE POLICY "Users manage own coach usage" ON public.coach_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own coach audit" ON public.coach_audit
  FOR ALL USING (auth.uid() = user_id);
