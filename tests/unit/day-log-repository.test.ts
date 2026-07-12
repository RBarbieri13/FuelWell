import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadDayMeals, saveMeal } from "@/lib/day-log-repository";
import type { MealRecord } from "@/lib/fuelwell-data";

type ResponseValue = { data: unknown; error: { message: string } | null };
type Call = { table: string; method: string; args: unknown[] };

function makeSupabase(responses: Record<string, ResponseValue[]>, calls: Call[]) {
  function chain(table: string) {
    let operation = "select";
    const result = () => {
      const queue = responses[`${table}.${operation}`] ?? [];
      return queue.shift() ?? { data: null, error: null };
    };
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "gte", "lt", "order", "upsert", "update", "delete", "in"]) {
      builder[method] = (...args: unknown[]) => {
        if (["upsert", "update", "delete"].includes(method)) operation = method;
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.single = () => Promise.resolve(result());
    builder.maybeSingle = () => Promise.resolve(result());
    builder.then = (resolve: (value: ResponseValue) => unknown) => Promise.resolve(result()).then(resolve);
    return builder;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

const meal: MealRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  mealType: "lunch",
  name: "Chicken bowl",
  loggedAt: "2026-07-12T18:00:00.000Z",
  items: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Chicken and rice",
      servings: 1,
      calories: 500,
      protein: 42,
      carbs: 55,
      fat: 10,
    },
  ],
};

const mealRow = {
  id: meal.id,
  meal_type: meal.mealType,
  name: meal.name,
  logged_at: meal.loggedAt,
  meal_items: [
    {
      id: meal.items[0].id,
      custom_name: meal.items[0].name,
      servings: 1,
      calories: 500,
      protein: 42,
      carbs: 55,
      fat: 10,
    },
  ],
};

describe("day log repository", () => {
  it("loads only the requested user's UTC day", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase(
      { "meals.select": [{ data: [mealRow], error: null }] },
      calls,
    );

    await expect(loadDayMeals(supabase, "user-a", "2026-07-12")).resolves.toEqual([meal]);
    expect(calls).toEqual(expect.arrayContaining([
      { table: "meals", method: "eq", args: ["user_id", "user-a"] },
      { table: "meals", method: "gte", args: ["logged_at", "2026-07-12T00:00:00.000Z"] },
      { table: "meals", method: "lt", args: ["logged_at", "2026-07-13T00:00:00.000Z"] },
    ]));
  });

  it("upserts stable client IDs and returns the authoritative day", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase(
      {
        "daily_logs.upsert": [
          { data: { id: "day-1" }, error: null },
          { data: { id: "day-1" }, error: null },
        ],
        "meals.select": [
          { data: { id: meal.id }, error: null },
          { data: [mealRow], error: null },
        ],
        "meals.upsert": [{ data: null, error: null }],
        "meal_items.select": [{ data: [{ id: meal.items[0].id }], error: null }],
        "meal_items.upsert": [{ data: null, error: null }],
        "daily_logs.update": [{ data: null, error: null }],
      },
      calls,
    );

    await expect(saveMeal(supabase, "user-a", "2026-07-12", meal)).resolves.toEqual([meal]);

    const mealUpsert = calls.find((call) => call.table === "meals" && call.method === "upsert");
    expect(mealUpsert?.args[0]).toMatchObject({
      id: meal.id,
      user_id: "user-a",
      daily_log_id: "day-1",
    });
    expect(mealUpsert?.args[1]).toEqual({ onConflict: "id" });
    const itemUpsert = calls.find((call) => call.table === "meal_items" && call.method === "upsert");
    expect(itemUpsert?.args[0]).toEqual([
      expect.objectContaining({ id: meal.items[0].id, meal_id: meal.id }),
    ]);
    expect(calls).toEqual(expect.arrayContaining([
      { table: "daily_logs", method: "upsert", args: [
        { user_id: "user-a", log_date: "2026-07-12" },
        { onConflict: "user_id,log_date" },
      ] },
    ]));
  });

  it("removes a newly-created meal when its item write fails", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase(
      {
        "daily_logs.upsert": [{ data: { id: "day-1" }, error: null }],
        "meals.select": [{ data: null, error: null }],
        "meals.upsert": [{ data: null, error: null }],
        "meal_items.select": [{ data: [], error: null }],
        "meal_items.upsert": [{ data: null, error: { message: "item insert failed" } }],
        "meals.delete": [{ data: null, error: null }],
      },
      calls,
    );

    await expect(saveMeal(supabase, "user-a", "2026-07-12", meal)).rejects.toThrow("item insert failed");
    expect(calls).toEqual(expect.arrayContaining([
      { table: "meals", method: "delete", args: [] },
      { table: "meals", method: "eq", args: ["user_id", "user-a"] },
    ]));
  });
});
