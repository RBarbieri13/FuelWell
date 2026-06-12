import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArtifactSpec } from "./types";

/**
 * Server-side Supabase persistence for signed-in users. Preview users skip
 * all of this (their conversation lives in localStorage on the client; cost
 * and audit fall back to the in-memory stores in cost.ts / audit.ts).
 * All queries run through the user-scoped client, so RLS applies.
 */

export async function ensureConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId?: string
): Promise<string | null> {
  if (conversationId) {
    const { data } = await supabase
      .from("coach_conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();
    if (data) return data.id;
  }
  const { data, error } = await supabase
    .from("coach_conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) {
    console.error("coach_conversations insert failed", error.message);
    return null;
  }
  return data.id;
}

export async function saveMessages(
  supabase: SupabaseClient,
  conversationId: string,
  rows: Array<{
    role: "user" | "assistant";
    content: string;
    toolCalls?: unknown[];
    artifacts?: ArtifactSpec[];
    model?: string;
    tokensIn?: number;
    tokensOut?: number;
  }>
): Promise<void> {
  const { error } = await supabase.from("coach_messages").insert(
    rows.map((r) => ({
      conversation_id: conversationId,
      role: r.role,
      content_jsonb: { text: r.content },
      tool_calls_jsonb: r.toolCalls ?? [],
      artifacts_jsonb: r.artifacts ?? [],
      model: r.model,
      tokens_in: r.tokensIn ?? 0,
      tokens_out: r.tokensOut ?? 0,
    }))
  );
  if (error) console.error("coach_messages insert failed", error.message);
}

export async function loadRecentMessages(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  conversationId: string | null;
  messages: Array<{ role: "user" | "assistant"; content: string; artifacts: ArtifactSpec[] }>;
}> {
  const { data: convo } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!convo) return { conversationId: null, messages: [] };

  const { data: rows } = await supabase
    .from("coach_messages")
    .select("role, content_jsonb, artifacts_jsonb")
    .eq("conversation_id", convo.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return {
    conversationId: convo.id,
    messages: (rows ?? [])
      .reverse()
      .map((r) => ({
        role: r.role as "user" | "assistant",
        content: (r.content_jsonb as { text?: string })?.text ?? "",
        artifacts: (r.artifacts_jsonb as ArtifactSpec[]) ?? [],
      })),
  };
}

export async function getSupabaseDayCents(
  supabase: SupabaseClient,
  userId: string,
  day: string
): Promise<number> {
  const { data } = await supabase
    .from("coach_usage")
    .select("cost_usd_cents")
    .eq("user_id", userId)
    .eq("day", day);
  return (data ?? []).reduce((sum, r) => sum + (r.cost_usd_cents ?? 0), 0);
}

export async function insertSupabaseUsage(
  supabase: SupabaseClient,
  row: {
    userId: string;
    day: string;
    inputTokens: number;
    outputTokens: number;
    costUsdCents: number;
    model: string;
  }
): Promise<void> {
  const { error } = await supabase.from("coach_usage").insert({
    user_id: row.userId,
    day: row.day,
    input_tokens: row.inputTokens,
    output_tokens: row.outputTokens,
    cost_usd_cents: row.costUsdCents,
    model: row.model,
  });
  if (error) console.error("coach_usage insert failed", error.message);
}

export async function insertSupabaseAudit(
  supabase: SupabaseClient,
  row: { userId: string; tool: string; args: unknown; resultSummary: string }
): Promise<void> {
  const { error } = await supabase.from("coach_audit").insert({
    user_id: row.userId,
    tool: row.tool,
    args_jsonb: row.args ?? {},
    result_summary: row.resultSummary,
  });
  if (error) console.error("coach_audit insert failed", error.message);
}
