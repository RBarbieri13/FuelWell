import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasSupabaseConfig: true,
  user: null as null | { id: string; email: string; created_at: string },
  tables: {} as Record<string, Array<Record<string, unknown>>>,
}));

vi.mock("@/lib/preview-session", () => ({
  hasSupabaseConfig: () => mocks.hasSupabaseConfig,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mocks.user } })),
    },
    from(table: string) {
      return makeQuery(table);
    },
  })),
}));

function makeQuery(table: string) {
  const filters: Array<{ type: "eq" | "in"; column: string; value: unknown }> = [];

  const applyFilters = () => {
    const rows = mocks.tables[table] ?? [];
    return rows.filter((row) =>
      filters.every((filter) => {
        if (filter.type === "eq") {
          return row[filter.column] === filter.value;
        }
        const values = Array.isArray(filter.value) ? filter.value : [];
        return values.includes(row[filter.column]);
      }),
    );
  };

  const builder = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ type: "eq", column, value });
      return builder;
    },
    in(column: string, value: unknown[]) {
      filters.push({ type: "in", column, value });
      return builder;
    },
    maybeSingle() {
      const rows = applyFilters();
      return Promise.resolve({
        data: rows[0] ?? null,
        error: null,
      });
    },
    then(
      resolve: (value: { data: Array<Record<string, unknown>>; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve({ data: applyFilters(), error: null }).then(resolve, reject);
    },
  };

  return builder;
}

describe("/api/account/export", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));
    mocks.hasSupabaseConfig = true;
    mocks.user = {
      id: "user-1",
      email: "member@fuelwell.test",
      created_at: "2026-08-09T12:00:00.000Z",
    };
    mocks.tables = {
      profiles: [{ id: "user-1", display_name: "Member" }],
      daily_logs: [{ id: "log-1", user_id: "user-1" }],
      foods: [{ id: "food-1", created_by: "user-1" }],
      meals: [{ id: "meal-1", user_id: "user-1" }],
      meal_items: [{ id: "meal-item-1", meal_id: "meal-1" }],
      recipes: [{ id: "recipe-1", user_id: "user-1" }],
      recipe_ingredients: [{ id: "ingredient-1", recipe_id: "recipe-1" }],
      recipe_quality_status: [{ recipe_id: "recipe-1", status: "approved" }],
      user_goals: [{ id: "goal-1", user_id: "user-1" }],
      progress_photos: [{ id: "photo-1", user_id: "user-1" }],
      ai_conversations: [{ id: "ai-1", user_id: "user-1" }],
      coach_conversations: [{ id: "conversation-1", user_id: "user-1" }],
      coach_messages: [{ id: "message-1", conversation_id: "conversation-1" }],
      coach_usage: [{ id: "usage-1", user_id: "user-1" }],
      coach_audit: [{ id: "audit-1", user_id: "user-1" }],
      goal_plans: [{ id: "plan-1", user_id: "user-1" }],
      goal_events: [{ id: "event-1", user_id: "user-1" }],
      connected_accounts: [{ id: "account-1", user_id: "user-1" }],
      integration_daily_summaries: [{ id: "summary-1", user_id: "user-1" }],
      daily_goal_contexts: [{ id: "context-1", user_id: "user-1" }],
      coach_knowledge_bases: [{ user_id: "user-1", knowledge_jsonb: {} }],
      workout_sessions: [{ id: "session-1", user_id: "user-1" }],
      workout_exercises: [{ id: "exercise-1", workout_session_id: "session-1" }],
      workout_sets: [{ id: "set-1", workout_exercise_id: "exercise-1" }],
      activity_entries: [{ id: "activity-1", user_id: "user-1" }],
      grocery_lists: [{ id: "list-1", user_id: "user-1" }],
      grocery_items: [{ id: "item-1", grocery_list_id: "list-1" }],
      body_log_entries: [{ id: "body-1", user_id: "user-1" }],
      coach_uploaded_artifacts: [{ id: "artifact-1", user_id: "user-1" }],
      user_weekly_meal_plans: [{ id: "meal-plan-1", user_id: "user-1", week_start: "2026-08-10" }],
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a downloadable JSON export covering user-scoped account tables", async () => {
    const { GET } = await import("@/app/api/account/export/route");
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain(
      'attachment; filename="fuelwell-account-export-2026-08-09.json"',
    );
    const payload = (await response.json()) as {
      account: { email: string };
      tables: Record<string, Array<Record<string, unknown>>>;
    };

    expect(payload.account.email).toBe("member@fuelwell.test");
    expect(payload.tables.profiles).toHaveLength(1);
    expect(payload.tables.meal_items).toEqual([{ id: "meal-item-1", meal_id: "meal-1" }]);
    expect(payload.tables.coach_messages).toEqual([
      { id: "message-1", conversation_id: "conversation-1" },
    ]);
    expect(payload.tables.workout_sets).toEqual([
      { id: "set-1", workout_exercise_id: "exercise-1" },
    ]);
    expect(payload.tables.grocery_items).toEqual([
      { id: "item-1", grocery_list_id: "list-1" },
    ]);
    expect(payload.tables.body_log_entries).toEqual([{ id: "body-1", user_id: "user-1" }]);
    expect(payload.tables.user_weekly_meal_plans).toEqual([
      { id: "meal-plan-1", user_id: "user-1", week_start: "2026-08-10" },
    ]);
  });

  it("requires a signed-in user", async () => {
    mocks.user = null;
    const { GET } = await import("@/app/api/account/export/route");
    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
  });

  it("fails closed when Supabase is not configured", async () => {
    mocks.hasSupabaseConfig = false;
    const { GET } = await import("@/app/api/account/export/route");
    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Supabase is not configured for account export.",
    });
  });
});
