-- One-time consumption ledger for signed destructive Coach confirmations.

CREATE TABLE IF NOT EXISTS public.coach_confirmation_uses (
  nonce_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.coach_conversations(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_confirmation_uses_expiry
  ON public.coach_confirmation_uses(expires_at);

ALTER TABLE public.coach_confirmation_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own coach confirmation uses"
  ON public.coach_confirmation_uses;
CREATE POLICY "Users insert own coach confirmation uses"
  ON public.coach_confirmation_uses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT INSERT ON TABLE public.coach_confirmation_uses TO authenticated;
GRANT ALL ON TABLE public.coach_confirmation_uses TO service_role;
