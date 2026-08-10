import type { SupabaseClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";
import type { ArtifactSpec, CoachAttachment, CoachMutation } from "./types";
import {
  buildCoachKnowledgeFromProfile,
  type CoachKnowledgeBase,
  type CoachProfileKnowledgeInput,
} from "@/lib/coach/knowledge";
import type { DailyGoalContext, GoalPlan, IntegrationDailySummary } from "@/lib/goal-context";
import { deleteDayMeal, saveMeal } from "@/lib/day-log-repository";
import { deleteWorkoutEntry, saveWorkoutEntry } from "@/lib/workout-log-repository";
import { replaceGroceryList } from "@/lib/grocery-repository";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import { saveBodyLogEntry } from "@/lib/body-log-repository";
import { mergeOwnProfilePreferences } from "@/lib/authenticated-storage-repository";

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
    const { data, error } = await supabase
      .from("coach_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`Unable to verify Coach conversation: ${error.message}`);
    if (data) return data.id;
  }
  const { data, error } = await supabase
    .from("coach_conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) {
    throw new Error(`Unable to create Coach conversation: ${error.message}`);
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
  if (error) throw new Error(`Unable to save Coach messages: ${error.message}`);
}

export async function loadRecentMessages(
  supabase: SupabaseClient,
  userId: string,
  options?: { limit?: number; before?: string }
): Promise<{
  conversationId: string | null;
  messages: Array<{ role: "user" | "assistant"; content: string; artifacts: ArtifactSpec[] }>;
  hasMore: boolean;
  nextBefore: string | null;
}> {
  const limit = Math.min(Math.max(Math.trunc(options?.limit ?? 30), 1), 100);
  const { data: convo, error: conversationError } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (conversationError) throw new Error(`Unable to load Coach conversation: ${conversationError.message}`);
  if (!convo) return { conversationId: null, messages: [], hasMore: false, nextBefore: null };

  let query = supabase
    .from("coach_messages")
    .select("role, content_jsonb, artifacts_jsonb, created_at")
    .eq("conversation_id", convo.id);
  if (options?.before) query = query.lt("created_at", options.before);
  // Fetch one extra row so hasMore reflects reality, not a guess.
  const { data: rows, error: messagesError } = await query.order("created_at", { ascending: false }).limit(limit + 1);
  if (messagesError) throw new Error(`Unable to load Coach messages: ${messagesError.message}`);

  const hasMore = (rows ?? []).length > limit;
  const page = (rows ?? []).slice(0, limit);
  const nextBefore = hasMore ? ((page[page.length - 1]?.created_at as string | undefined) ?? null) : null;

  return {
    conversationId: convo.id,
    hasMore,
    nextBefore,
    messages: page
      .reverse()
      .map((r) => ({
        role: r.role as "user" | "assistant",
        content: (r.content_jsonb as { text?: string })?.text ?? "",
        artifacts: (r.artifacts_jsonb as ArtifactSpec[]) ?? [],
      })),
  };
}

const COACH_ARTIFACT_BUCKET = "coach-artifacts";

function safeFileSegment(input: string): string {
  const cleaned = input
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

  return cleaned || "attachment";
}

function attachmentBytes(attachment: CoachAttachment): Buffer | null {
  if (attachment.data) return Buffer.from(attachment.data, "base64");
  if (attachment.text) return Buffer.from(attachment.text, "utf8");
  return null;
}

export async function saveCoachUploadedArtifacts(
  supabase: SupabaseClient,
  row: {
    userId: string;
    conversationId: string;
    attachments: CoachAttachment[];
  }
): Promise<void> {
  if (row.attachments.length === 0) return;

  for (const attachment of row.attachments) {
    const safeName = safeFileSegment(attachment.name);
    const storagePath = `${row.userId}/${row.conversationId}/${attachment.id}-${safeName}`;
    const bytes = attachmentBytes(attachment);
    let uploadedPath: string | null = null;

    if (bytes) {
      const { error: uploadError } = await supabase.storage
        .from(COACH_ARTIFACT_BUCKET)
        .upload(storagePath, bytes, {
          contentType: attachment.mediaType,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Unable to save Coach attachment: ${uploadError.message}`);
      } else {
        uploadedPath = storagePath;
      }
    }

    const { error } = await supabase.from("coach_uploaded_artifacts").upsert(
      {
        user_id: row.userId,
        conversation_id: row.conversationId,
        attachment_id: attachment.id,
        file_name: attachment.name,
        media_type: attachment.mediaType,
        kind: attachment.kind,
        size_bytes: attachment.size,
        storage_bucket: COACH_ARTIFACT_BUCKET,
        storage_path: uploadedPath,
        text_excerpt: attachment.text?.slice(0, 2000) ?? null,
        metadata_jsonb: {
          hasPayload: Boolean(bytes),
          persistedToStorage: Boolean(uploadedPath),
        },
      },
      { onConflict: "user_id,attachment_id" },
    );

    if (error) throw new Error(`Unable to save Coach attachment metadata: ${error.message}`);
  }
}

export async function loadRecentCoachUploadedArtifacts(
  supabase: SupabaseClient,
  userId: string
): Promise<
  Array<{
    id: string;
    fileName: string;
    mediaType: string;
    kind: CoachAttachment["kind"];
    sizeBytes: number;
    storagePath: string | null;
    createdAt: string;
  }>
> {
  const { data, error } = await supabase
    .from("coach_uploaded_artifacts")
    .select("id, file_name, media_type, kind, size_bytes, storage_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Unable to load Coach attachments: ${error.message}`);
  }

  return (data ?? []).map((artifact) => ({
    id: artifact.id,
    fileName: artifact.file_name,
    mediaType: artifact.media_type,
    kind: artifact.kind as CoachAttachment["kind"],
    sizeBytes: artifact.size_bytes ?? 0,
    storagePath: artifact.storage_path ?? null,
    createdAt: artifact.created_at,
  }));
}

export async function loadCoachKnowledge(
  supabase: SupabaseClient,
  userId: string,
): Promise<CoachKnowledgeBase | null> {
  const { data, error } = await supabase
    .from("coach_knowledge_bases")
    .select("knowledge_jsonb")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Unable to load Coach knowledge: ${error.message}`);
  }
  return (data?.knowledge_jsonb as CoachKnowledgeBase | null) ?? null;
}

export async function persistCoachKnowledge(
  supabase: SupabaseClient,
  knowledge: CoachKnowledgeBase,
): Promise<void> {
  const { error } = await supabase.from("coach_knowledge_bases").upsert(
    {
      user_id: knowledge.userId,
      knowledge_jsonb: knowledge,
      updated_at: knowledge.updatedAt,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Unable to save Coach knowledge: ${error.message}`);
}

export async function ensureCoachKnowledgeForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const existing = await loadCoachKnowledge(supabase, userId);
  if (existing) return;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "display_name, goal, activity_level, dietary_preference, weight_kg, height_cm, allergies, meals_per_day, experience_level, preferences_jsonb"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the profile for Coach: ${error.message}`);
  }

  if (!profile) return;
  await persistCoachKnowledge(
    supabase,
    buildCoachKnowledgeFromProfile(userId, profile as CoachProfileKnowledgeInput),
  );
}

/**
 * Merge a coach set_preferences patch into profiles.preferences_jsonb so
 * preference changes made in chat survive across devices and sessions.
 * The security-invoker RPC merges against the current authenticated user's
 * row atomically, avoiding lost updates from concurrent tabs or Coach turns.
 */
export async function mergeProfilePreferences(
  supabase: SupabaseClient,
  _userId: string,
  patch: Record<string, unknown>
): Promise<void> {
  await mergeOwnProfilePreferences(supabase, patch);
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

function goalPlanRow(userId: string, plan: GoalPlan) {
  return {
    id: plan.id.startsWith("goal-default") ? undefined : plan.id,
    user_id: userId,
    primary_goal: plan.primaryGoal,
    goal_reason: plan.goalReason,
    target_weight_kg: plan.targetWeightKg,
    weekly_rate_kg: plan.weeklyRateKg,
    protein_strategy: plan.proteinStrategy,
    training_priority: plan.trainingPriority,
    calorie_floor: plan.calorieFloor,
    calorie_ceiling: plan.calorieCeiling,
    macro_targets: plan.macroTargets,
    adaptation_policy: plan.adaptationPolicy,
    status: plan.status,
    updated_at: plan.updatedAt,
  };
}

export async function persistGoalPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: GoalPlan,
  reason: string,
): Promise<void> {
  const row = goalPlanRow(userId, plan);
  const { data, error } = await supabase
    .from("goal_plans")
    .upsert(row, { onConflict: "id" })
    .select("id")
    .single();
  if (error) {
    throw new Error(`Unable to save goal plan: ${error.message}`);
  }
  const { error: eventError } = await supabase.from("goal_events").insert({
    user_id: userId,
    goal_plan_id: data?.id ?? null,
    event_type: "updated",
    reason,
    after_jsonb: plan,
  });
  if (eventError) throw new Error(`Unable to save goal history: ${eventError.message}`);
}

export async function persistIntegrationSummary(
  supabase: SupabaseClient,
  userId: string,
  summary: IntegrationDailySummary,
): Promise<void> {
  const { data: account, error: accountError } = await supabase
    .from("connected_accounts")
    .upsert(
      {
        user_id: userId,
        provider: summary.provider,
        status: summary.status,
        metadata_jsonb: { sourceLabel: summary.sourceLabel, note: summary.note },
        last_sync_at: summary.lastSyncAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    )
    .select("id")
    .single();
  if (accountError) {
    throw new Error(`Unable to save connected account: ${accountError.message}`);
  }
  const { error } = await supabase.from("integration_daily_summaries").upsert(
    {
      user_id: userId,
      connected_account_id: account?.id ?? null,
      provider: summary.provider,
      summary_date: summary.date,
      steps: summary.steps,
      active_calories: summary.activeCalories,
      sleep_hours: summary.sleepHours,
      stress_level: summary.stressLevel,
      body_battery: summary.bodyBattery,
      recovery_label: summary.recoveryLabel,
      workout_planned: summary.workoutPlanned,
      confidence_jsonb: { status: summary.status },
      raw_jsonb: summary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider,summary_date" },
  );
  if (error) throw new Error(`Unable to save integration summary: ${error.message}`);
}

export async function persistDailyGoalContext(
  supabase: SupabaseClient,
  userId: string,
  context: DailyGoalContext,
): Promise<void> {
  const { error } = await supabase.from("daily_goal_contexts").upsert(
    {
      user_id: userId,
      goal_plan_id: context.goalPlan.id.startsWith("goal-default") ? null : context.goalPlan.id,
      context_date: context.date,
      targets_jsonb: context.targets,
      totals_jsonb: context.totals,
      remaining_jsonb: context.remaining,
      data_sources: context.dataSources,
      guidance_jsonb: context.guidance,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,context_date" },
  );
  if (error) throw new Error(`Unable to save daily goal context: ${error.message}`);
}

export async function persistCoachMutations(
  supabase: SupabaseClient,
  userId: string,
  mutations: CoachMutation[],
  context?: DailyGoalContext,
): Promise<void> {
  const date = context?.date ?? new Date().toISOString().slice(0, 10);
  for (const mutation of mutations) {
    if (mutation.kind === "add_meal" || mutation.kind === "update_meal") {
      await saveMeal(supabase, userId, date, mutation.meal);
    }
    if (mutation.kind === "remove_meal") {
      await deleteDayMeal(supabase, userId, date, mutation.mealId);
    }
    if (mutation.kind === "add_workout") {
      await saveWorkoutEntry(supabase, userId, date, mutation.workout);
    }
    if (mutation.kind === "remove_workout") {
      await deleteWorkoutEntry(supabase, userId, date, mutation.workoutId);
    }
    if (mutation.kind === "set_grocery") {
      await replaceGroceryList(
        supabase,
        userId,
        date,
        mutation.items.map((item) => {
          const normalized = normalizeGroceryInput(item.name, item.quantity);
          const amount = normalized.quantity ?? "1 item";
          return {
            id: item.id,
            name: normalized.name,
            amount,
            quantity: amount,
            category: "Other" as const,
            source: "Coach",
            checked: item.checked,
          };
        }),
      );
    }
    if (mutation.kind === "add_body_log") {
      await saveBodyLogEntry(
        supabase,
        userId,
        crypto.randomUUID(),
        mutation.entry,
      );
    }
    if (mutation.kind === "set_goal_plan") {
      await persistGoalPlan(supabase, userId, mutation.plan, "Coach goal tool update");
    }
    if (mutation.kind === "set_integration_summary") {
      await persistIntegrationSummary(supabase, userId, mutation.summary);
    }
  }
  if (context) {
    await persistDailyGoalContext(supabase, userId, context);
  }
}
