-- Tighten Data API privileges for the Coach uploaded artifacts table.
-- The table is RLS-protected; authenticated users only need CRUD privileges.

REVOKE ALL ON TABLE public.coach_uploaded_artifacts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coach_uploaded_artifacts TO authenticated;
