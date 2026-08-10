import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { version } from "../../../../package.json";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const DELETE_CONFIRM_COOKIE = "fuelwell-delete-confirmation";
const DELETE_CONFIRM_TTL_MS = 10 * 60 * 1000;
const DEV_DELETE_SECRET = randomBytes(32).toString("hex");

type TableRow = Record<string, unknown>;
type SupabaseLike = Pick<SupabaseClient, "from" | "rpc">;

type DeleteChallengeCookie = {
  userId: string;
  phrase: string;
  expiresAt: string;
};

export function accountCacheHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}

export function exportFileName(date = new Date()) {
  return `fuelwell-account-export-${date.toISOString().slice(0, 10)}.json`;
}

export function createExportHeaders(date?: Date) {
  return {
    ...accountCacheHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Content-Disposition": `attachment; filename="${exportFileName(date)}"`,
  };
}

export function createJsonError(message: string, status: number, extraHeaders?: HeadersInit) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        ...accountCacheHeaders(),
        ...(extraHeaders ?? {}),
      },
    },
  );
}

export function buildDeleteConfirmationPhrase(user: Pick<User, "email" | "id">) {
  return `DELETE ${(user.email ?? user.id).trim().toLowerCase()}`;
}

export function resolveAccountDeleteSecret(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return (
    env.ACCOUNT_DELETE_CONFIRMATION_SECRET?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    env.COACH_CONFIRMATION_SECRET?.trim() ||
    (env.NODE_ENV === "production" ? null : DEV_DELETE_SECRET)
  );
}

export function createDeleteChallenge(
  user: Pick<User, "id" | "email">,
  env: Record<string, string | undefined> = process.env,
) {
  const secret = resolveAccountDeleteSecret(env);
  if (!secret) return null;
  const expiresAt = new Date(Date.now() + DELETE_CONFIRM_TTL_MS).toISOString();
  const phrase = buildDeleteConfirmationPhrase(user);
  return {
    phrase,
    expiresAt,
    cookieValue: encodeDeleteChallengeCookie({
      userId: user.id,
      phrase,
      expiresAt,
    }, secret),
  };
}

export function deleteChallengeCookieName() {
  return DELETE_CONFIRM_COOKIE;
}

export function serializeSetCookie(name: string, value: string, options?: {
  maxAge?: number;
  httpOnly?: boolean;
  path?: string;
  sameSite?: "Strict" | "Lax" | "None";
}) {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options?.path ?? "/"}`);
  if (typeof options?.maxAge === "number") parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if (options?.httpOnly ?? true) parts.push("HttpOnly");
  parts.push(`SameSite=${options?.sameSite ?? "Strict"}`);
  return parts.join("; ");
}

export function clearDeleteChallengeCookie() {
  return serializeSetCookie(DELETE_CONFIRM_COOKIE, "", { maxAge: 0 });
}

export function readDeleteChallengeFromCookieHeader(
  cookieHeader: string | null,
  env: Record<string, string | undefined> = process.env,
) {
  if (!cookieHeader) return null;

  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DELETE_CONFIRM_COOKIE}=`))
    ?.slice(DELETE_CONFIRM_COOKIE.length + 1);

  const secret = resolveAccountDeleteSecret(env);
  return raw && secret ? decodeDeleteChallengeCookie(raw, secret) : null;
}

function signDeleteChallenge(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest();
}

function encodeDeleteChallengeCookie(payload: DeleteChallengeCookie, secret: string) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signDeleteChallenge(encodedPayload, secret).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

function decodeDeleteChallengeCookie(encoded: string, secret: string) {
  try {
    const [encodedPayload, encodedSignature] = encoded.split(".");
    if (!encodedPayload || !encodedSignature) return null;
    const expected = signDeleteChallenge(encodedPayload, secret);
    const actual = Buffer.from(encodedSignature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<DeleteChallengeCookie>;
    if (
      typeof parsed.userId === "string" &&
      typeof parsed.phrase === "string" &&
      typeof parsed.expiresAt === "string"
    ) {
      return parsed as DeleteChallengeCookie;
    }
  } catch {
    return null;
  }
  return null;
}

async function requireRows<T extends TableRow>(
  label: string,
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const { data, error } = await query;
  if (error) throw new Error(`Failed to export ${label}: ${error.message}`);
  return data ?? [];
}

async function requireMaybeSingle<T extends TableRow>(
  label: string,
  query: PromiseLike<{ data: T | null; error: { message: string } | null }>,
) {
  const { data, error } = await query;
  if (error) throw new Error(`Failed to export ${label}: ${error.message}`);
  return data ? [data] : [];
}

export async function buildAccountExportPayload(supabase: SupabaseLike, user: Pick<User, "id" | "email" | "created_at">) {
  const profiles = await requireMaybeSingle(
    "profiles",
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  );
  const dailyLogs = await requireRows(
    "daily_logs",
    supabase.from("daily_logs").select("*").eq("user_id", user.id),
  );
  const foods = await requireRows(
    "foods",
    supabase.from("foods").select("*").eq("created_by", user.id),
  );
  const meals = await requireRows(
    "meals",
    supabase.from("meals").select("*").eq("user_id", user.id),
  );
  const mealIds = meals.map((meal) => String(meal.id));
  const mealItems = mealIds.length > 0
    ? await requireRows(
        "meal_items",
        supabase.from("meal_items").select("*").in("meal_id", mealIds),
      )
    : [];
  const recipes = await requireRows(
    "recipes",
    supabase.from("recipes").select("*").eq("user_id", user.id),
  );
  const recipeIds = recipes.map((recipe) => String(recipe.id));
  const recipeIngredients = recipeIds.length > 0
    ? await requireRows(
        "recipe_ingredients",
        supabase.from("recipe_ingredients").select("*").in("recipe_id", recipeIds),
      )
    : [];
  const recipeQualityStatus = recipeIds.length > 0
    ? await requireRows(
        "recipe_quality_status",
        supabase.from("recipe_quality_status").select("*").in("recipe_id", recipeIds),
      )
    : [];
  const userGoals = await requireRows(
    "user_goals",
    supabase.from("user_goals").select("*").eq("user_id", user.id),
  );
  const progressPhotos = await requireRows(
    "progress_photos",
    supabase.from("progress_photos").select("*").eq("user_id", user.id),
  );
  const aiConversations = await requireRows(
    "ai_conversations",
    supabase.from("ai_conversations").select("*").eq("user_id", user.id),
  );
  const coachConversations = await requireRows(
    "coach_conversations",
    supabase.from("coach_conversations").select("*").eq("user_id", user.id),
  );
  const conversationIds = coachConversations.map((conversation) => String(conversation.id));
  const coachMessages = conversationIds.length > 0
    ? await requireRows(
        "coach_messages",
        supabase.from("coach_messages").select("*").in("conversation_id", conversationIds),
      )
    : [];
  const coachUsage = await requireRows(
    "coach_usage",
    supabase.from("coach_usage").select("*").eq("user_id", user.id),
  );
  const coachAudit = await requireRows(
    "coach_audit",
    supabase.from("coach_audit").select("*").eq("user_id", user.id),
  );
  const goalPlans = await requireRows(
    "goal_plans",
    supabase.from("goal_plans").select("*").eq("user_id", user.id),
  );
  const goalEvents = await requireRows(
    "goal_events",
    supabase.from("goal_events").select("*").eq("user_id", user.id),
  );
  const connectedAccounts = await requireRows(
    "connected_accounts",
    supabase.from("connected_accounts").select("*").eq("user_id", user.id),
  );
  const integrationDailySummaries = await requireRows(
    "integration_daily_summaries",
    supabase.from("integration_daily_summaries").select("*").eq("user_id", user.id),
  );
  const dailyGoalContexts = await requireRows(
    "daily_goal_contexts",
    supabase.from("daily_goal_contexts").select("*").eq("user_id", user.id),
  );
  const coachKnowledgeBases = await requireRows(
    "coach_knowledge_bases",
    supabase.from("coach_knowledge_bases").select("*").eq("user_id", user.id),
  );
  const workoutSessions = await requireRows(
    "workout_sessions",
    supabase.from("workout_sessions").select("*").eq("user_id", user.id),
  );
  const workoutSessionIds = workoutSessions.map((session) => String(session.id));
  const workoutExercises = workoutSessionIds.length > 0
    ? await requireRows(
        "workout_exercises",
        supabase.from("workout_exercises").select("*").in("workout_session_id", workoutSessionIds),
      )
    : [];
  const workoutExerciseIds = workoutExercises.map((exercise) => String(exercise.id));
  const workoutSets = workoutExerciseIds.length > 0
    ? await requireRows(
        "workout_sets",
        supabase.from("workout_sets").select("*").in("workout_exercise_id", workoutExerciseIds),
      )
    : [];
  const activityEntries = await requireRows(
    "activity_entries",
    supabase.from("activity_entries").select("*").eq("user_id", user.id),
  );
  const groceryLists = await requireRows(
    "grocery_lists",
    supabase.from("grocery_lists").select("*").eq("user_id", user.id),
  );
  const groceryListIds = groceryLists.map((list) => String(list.id));
  const groceryItems = groceryListIds.length > 0
    ? await requireRows(
        "grocery_items",
        supabase.from("grocery_items").select("*").in("grocery_list_id", groceryListIds),
      )
    : [];
  const bodyLogEntries = await requireRows(
    "body_log_entries",
    supabase.from("body_log_entries").select("*").eq("user_id", user.id),
  );
  const coachUploadedArtifacts = await requireRows(
    "coach_uploaded_artifacts",
    supabase.from("coach_uploaded_artifacts").select("*").eq("user_id", user.id),
  );

  return {
    exportedAt: new Date().toISOString(),
    appVersion: version,
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
    },
    tables: {
      profiles,
      daily_logs: dailyLogs,
      foods,
      meals,
      meal_items: mealItems,
      recipes,
      recipe_ingredients: recipeIngredients,
      recipe_quality_status: recipeQualityStatus,
      user_goals: userGoals,
      progress_photos: progressPhotos,
      ai_conversations: aiConversations,
      coach_conversations: coachConversations,
      coach_messages: coachMessages,
      coach_usage: coachUsage,
      coach_audit: coachAudit,
      goal_plans: goalPlans,
      goal_events: goalEvents,
      connected_accounts: connectedAccounts,
      integration_daily_summaries: integrationDailySummaries,
      daily_goal_contexts: dailyGoalContexts,
      coach_knowledge_bases: coachKnowledgeBases,
      workout_sessions: workoutSessions,
      workout_exercises: workoutExercises,
      workout_sets: workoutSets,
      activity_entries: activityEntries,
      grocery_lists: groceryLists,
      grocery_items: groceryItems,
      body_log_entries: bodyLogEntries,
      coach_uploaded_artifacts: coachUploadedArtifacts,
    },
  };
}
