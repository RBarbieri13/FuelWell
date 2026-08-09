import { createClient } from "@/lib/supabase/server";
import { loadRecentMessages } from "@/lib/coach/persistence";
import { hasSupabaseConfig } from "@/lib/preview-session";

/**
 * GET /api/coach/history — replay the signed-in user's latest coach
 * conversation from Supabase (RLS-scoped). Preview/signed-out users get
 * { signedIn: false } and the client falls back to localStorage replay.
 * Supports cursor pagination: ?before=<created_at ISO> returns the page of
 * messages older than the cursor; hasMore/nextBefore drive "show earlier".
 */
export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return Response.json({ signedIn: false, userId: null, conversationId: null, messages: [] });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ signedIn: false, userId: null, conversationId: null, messages: [] });
  }

  const url = new URL(request.url);
  const before = url.searchParams.get("before") ?? undefined;
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  const { conversationId, messages, hasMore, nextBefore } = await loadRecentMessages(
    supabase,
    user.id,
    { before, limit }
  );
  return Response.json({ signedIn: true, userId: user.id, conversationId, messages, hasMore, nextBefore });
}

/**
 * DELETE /api/coach/history — archive the user's active conversations so
 * "New conversation" starts clean on the next turn and reloads don't replay
 * the old thread. Rows are kept (archived_at set), not deleted.
 */
export async function DELETE() {
  if (!hasSupabaseConfig()) return Response.json({ signedIn: false });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ signedIn: false });

  const { error } = await supabase
    .from("coach_conversations")
    .update({ archived_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("archived_at", null);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ signedIn: true, archived: true });
}
