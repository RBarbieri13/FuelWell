import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadWeeklyMealPlan, replaceWeeklyMealPlan } from "@/lib/meal-plan-repository";
import type { PlanDay } from "@/lib/meal-plan-types";

type ResponseValue = { data: unknown; error: { message: string } | null };
type Call = { table: string; method: string; args: unknown[] };

const days: PlanDay[] = [{
  id: "mon",
  label: "Mon",
  date: "Aug 10",
  iso: "2026-08-10",
  focus: "Training day",
  meals: [{
    slot: "Breakfast",
    recipeId: "oats",
    title: "Protein oats",
    calories: 420,
    protein: 31,
    prep: "10 min",
    status: "planned",
  }],
}];

function makeSupabase(responses: Record<string, ResponseValue[]>, calls: Call[]) {
  function chain(table: string) {
    let operation = "select";
    const result = () => (
      responses[`${table}.${operation}`]?.shift() ?? { data: null, error: null }
    );
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "upsert"]) {
      builder[method] = (...args: unknown[]) => {
        if (method === "upsert") operation = method;
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.single = () => Promise.resolve(result());
    builder.maybeSingle = () => Promise.resolve(result());
    return builder;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

describe("weekly meal plan repository", () => {
  it("loads only the requested user's week and treats a missing row as authoritative empty state", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "user_weekly_meal_plans.select": [{ data: null, error: null }],
    }, calls);

    await expect(loadWeeklyMealPlan(supabase, "user-a", "2026-08-10")).resolves.toEqual([]);
    expect(calls).toEqual(expect.arrayContaining([
      { table: "user_weekly_meal_plans", method: "eq", args: ["user_id", "user-a"] },
      { table: "user_weekly_meal_plans", method: "eq", args: ["week_start", "2026-08-10"] },
    ]));
  });

  it("upserts a complete week by user/week and returns the saved server document", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "user_weekly_meal_plans.upsert": [{ data: { plan_days: days }, error: null }],
    }, calls);

    await expect(
      replaceWeeklyMealPlan(supabase, "user-a", "2026-08-10", days),
    ).resolves.toEqual(days);
    expect(calls.find((call) => call.method === "upsert")?.args).toEqual([
      { user_id: "user-a", week_start: "2026-08-10", plan_days: days },
      { onConflict: "user_id,week_start" },
    ]);
  });

  it("rejects a non-Monday week before querying", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({}, calls);
    await expect(loadWeeklyMealPlan(supabase, "user-a", "2026-08-11"))
      .rejects.toThrow("Week start must be a Monday");
    expect(calls).toEqual([]);
  });

  it("fails closed on malformed persisted plan JSON", async () => {
    const supabase = makeSupabase({
      "user_weekly_meal_plans.select": [{ data: { plan_days: { leaked: true } }, error: null }],
    }, []);
    await expect(loadWeeklyMealPlan(supabase, "user-a", "2026-08-10"))
      .rejects.toThrow("Stored meal plan data is invalid");
  });
});
