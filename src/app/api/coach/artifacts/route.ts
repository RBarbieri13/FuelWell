import { createClient } from "@/lib/supabase/server";
import { loadRecentCoachUploadedArtifacts } from "@/lib/coach/persistence";
import { hasSupabaseConfig } from "@/lib/preview-session";

/**
 * GET /api/coach/artifacts — signed-in user's own uploaded Coach artifact
 * metadata. Raw files stay in private Supabase Storage; this endpoint returns
 * only metadata useful for account/export/debug surfaces.
 */
export async function GET() {
  if (!hasSupabaseConfig()) {
    return Response.json({ signedIn: false, artifacts: [], storageConfigured: false });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ signedIn: false, artifacts: [], storageConfigured: true });
  }

  const artifacts = await loadRecentCoachUploadedArtifacts(supabase, user.id);
  return Response.json({ signedIn: true, artifacts, storageConfigured: true });
}
