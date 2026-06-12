import { createClient } from "@/lib/supabase/server";
import { loadRecentMessages } from "@/lib/coach/persistence";

/**
 * GET /api/coach/history — replay the signed-in user's latest coach
 * conversation from Supabase (RLS-scoped). Preview/signed-out users get
 * { signedIn: false } and the client falls back to localStorage replay.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ signedIn: false, conversationId: null, messages: [] });
  }

  const { conversationId, messages } = await loadRecentMessages(supabase, user.id);
  return Response.json({ signedIn: true, conversationId, messages });
}

/**
 * DELETE /api/coach/history — archive the user's active conversations so
 * "New conversation" starts clean on the next turn and reloads don't replay
 * the old thread. Rows are kept (archived_at set), not deleted.
 */
export async function DELETE() {
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
