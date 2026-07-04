-- Per-user structured Coach memory. This is not model fine-tuning; it is
-- retrievable app memory scoped by user_id and rebuilt from app activity.

CREATE TABLE IF NOT EXISTS public.coach_knowledge_bases (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  knowledge_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_knowledge_bases_updated
  ON public.coach_knowledge_bases(updated_at DESC);

ALTER TABLE public.coach_knowledge_bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own coach knowledge" ON public.coach_knowledge_bases
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_coach_knowledge_bases
  BEFORE UPDATE ON public.coach_knowledge_bases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
