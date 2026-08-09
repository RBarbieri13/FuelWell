-- Backfill explicit browser-role table grants for user-scoped release tables
-- and add a server-authorized self-delete function for account cleanup.

REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.daily_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.foods FROM anon, authenticated;
REVOKE ALL ON TABLE public.meals FROM anon, authenticated;
REVOKE ALL ON TABLE public.meal_items FROM anon, authenticated;
REVOKE ALL ON TABLE public.recipes FROM anon, authenticated;
REVOKE ALL ON TABLE public.recipe_ingredients FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_goals FROM anon, authenticated;
REVOKE ALL ON TABLE public.progress_photos FROM anon, authenticated;
REVOKE ALL ON TABLE public.ai_conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.coach_conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.coach_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.coach_usage FROM anon, authenticated;
REVOKE ALL ON TABLE public.coach_audit FROM anon, authenticated;
REVOKE ALL ON TABLE public.goal_plans FROM anon, authenticated;
REVOKE ALL ON TABLE public.goal_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.connected_accounts FROM anon, authenticated;
REVOKE ALL ON TABLE public.integration_daily_summaries FROM anon, authenticated;
REVOKE ALL ON TABLE public.daily_goal_contexts FROM anon, authenticated;
REVOKE ALL ON TABLE public.coach_knowledge_bases FROM anon, authenticated;

GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.daily_logs TO anon;
GRANT SELECT ON TABLE public.foods TO anon;
GRANT SELECT ON TABLE public.meals TO anon;
GRANT SELECT ON TABLE public.meal_items TO anon;
GRANT SELECT ON TABLE public.recipes TO anon;
GRANT SELECT ON TABLE public.recipe_ingredients TO anon;
GRANT SELECT ON TABLE public.user_goals TO anon;
GRANT SELECT ON TABLE public.progress_photos TO anon;
GRANT SELECT ON TABLE public.ai_conversations TO anon;
GRANT SELECT ON TABLE public.coach_conversations TO anon;
GRANT SELECT ON TABLE public.coach_messages TO anon;
GRANT SELECT ON TABLE public.coach_usage TO anon;
GRANT SELECT ON TABLE public.coach_audit TO anon;
GRANT SELECT ON TABLE public.goal_plans TO anon;
GRANT SELECT ON TABLE public.goal_events TO anon;
GRANT SELECT ON TABLE public.connected_accounts TO anon;
GRANT SELECT ON TABLE public.integration_daily_summaries TO anon;
GRANT SELECT ON TABLE public.daily_goal_contexts TO anon;
GRANT SELECT ON TABLE public.coach_knowledge_bases TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.foods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.meals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.meal_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recipes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recipe_ingredients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.progress_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_audit TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.goal_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.goal_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.connected_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.integration_daily_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_goal_contexts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_knowledge_bases TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  deleted_storage_objects INTEGER := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.'
      USING ERRCODE = '42501';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'coach-artifacts'
    AND (storage.foldername(name))[1] = current_user_id::TEXT;
  GET DIAGNOSTICS deleted_storage_objects = ROW_COUNT;

  DELETE FROM auth.users
  WHERE id = current_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.'
      USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'deleted_user_id', current_user_id,
    'deleted_storage_objects', deleted_storage_objects
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'Deletes the authenticated user, cascades user-owned rows, and removes private coach-artifact storage objects.';
