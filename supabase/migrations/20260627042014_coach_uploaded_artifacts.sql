-- Durable user-scoped Coach attachment storage.
-- Stores attachment metadata in Postgres and raw files in a private Supabase
-- Storage bucket. RLS keeps every artifact scoped to auth.uid().

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'coach-artifacts',
  'coach-artifacts',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'text/html',
    'application/json',
    'message/rfc822'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.coach_uploaded_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.coach_conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.coach_messages(id) ON DELETE SET NULL,
  attachment_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  media_type TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'pdf', 'text')),
  size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
  storage_bucket TEXT NOT NULL DEFAULT 'coach-artifacts',
  storage_path TEXT,
  text_excerpt TEXT,
  metadata_jsonb JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_uploaded_artifacts_user_created
  ON public.coach_uploaded_artifacts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_uploaded_artifacts_conversation
  ON public.coach_uploaded_artifacts(conversation_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_uploaded_artifacts_user_attachment
  ON public.coach_uploaded_artifacts(user_id, attachment_id);

ALTER TABLE public.coach_uploaded_artifacts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.coach_uploaded_artifacts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_uploaded_artifacts TO authenticated;

DROP POLICY IF EXISTS "Users manage own coach uploaded artifacts"
  ON public.coach_uploaded_artifacts;

CREATE POLICY "Users manage own coach uploaded artifacts"
  ON public.coach_uploaded_artifacts
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own coach artifact objects"
  ON storage.objects;

CREATE POLICY "Users manage own coach artifact objects"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'coach-artifacts'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'coach-artifacts'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
