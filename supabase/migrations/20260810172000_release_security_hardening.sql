-- Lock trigger helpers to their intended trigger-only use and add covering
-- indexes for release-critical confirmation lookups.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS coach_confirmation_uses_user_id_idx
  ON public.coach_confirmation_uses (user_id);

CREATE INDEX IF NOT EXISTS coach_confirmation_uses_conversation_id_idx
  ON public.coach_confirmation_uses (conversation_id);

CREATE INDEX IF NOT EXISTS account_delete_confirmation_uses_user_id_idx
  ON public.account_delete_confirmation_uses (user_id);
