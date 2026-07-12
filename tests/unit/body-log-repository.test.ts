import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadBodyLog, saveBodyLogEntry } from "@/lib/body-log-repository";

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
    for (const method of ["select", "eq", "order", "upsert"]) {
      builder[method] = (...args: unknown[]) => {
        if (method === "upsert") operation = method;
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.maybeSingle = () => Promise.resolve(result());
    builder.then = (resolve: (value: ResponseValue) => unknown) =>
      Promise.resolve(result()).then(resolve);
    return builder;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

const row = {
  entry_date: "2026-07-12",
  weight_kg: "79.80",
  mood: 4,
  water_ml: 1800,
};

describe("body log repository", () => {
  it("loads only the requested user's entries in date order", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "body_log_entries.select": [{ data: [row], error: null }],
    }, calls);

    await expect(loadBodyLog(supabase, "user-a")).resolves.toEqual([{
      date: "2026-07-12",
      weightKg: 79.8,
      mood: 4,
      waterMl: 1800,
    }]);
    expect(calls).toEqual(expect.arrayContaining([
      { table: "body_log_entries", method: "eq", args: ["user_id", "user-a"] },
      { table: "body_log_entries", method: "order", args: ["entry_date", { ascending: true }] },
    ]));
  });

  it("merges partial daily updates and writes a UUID idempotency key", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "body_log_entries.select": [
        { data: { weight_kg: 79.8, mood: null, water_ml: 1200 }, error: null },
        { data: [{ ...row, mood: 5, water_ml: 1200 }], error: null },
      ],
      "body_log_entries.upsert": [{ data: null, error: null }],
    }, calls);
    const idempotencyKey = "11111111-1111-4111-8111-111111111111";

    await expect(saveBodyLogEntry(
      supabase,
      "user-a",
      idempotencyKey,
      { date: "2026-07-12", mood: 5 },
    )).resolves.toEqual([expect.objectContaining({ mood: 5, weightKg: 79.8 })]);

    const upsert = calls.find((call) => call.method === "upsert");
    expect(upsert?.args).toEqual([
      expect.objectContaining({
        user_id: "user-a",
        idempotency_key: idempotencyKey,
        entry_date: "2026-07-12",
        weight_kg: 79.8,
        mood: 5,
        water_ml: 1200,
      }),
      { onConflict: "user_id,entry_date" },
    ]);
  });

  it("validates dates, values, and UUIDs before writing", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({}, calls);
    await expect(saveBodyLogEntry(
      supabase,
      "user-a",
      "not-a-uuid",
      { date: "2026-07-12", mood: 4 },
    )).rejects.toThrow("UUIDs");
    await expect(saveBodyLogEntry(
      supabase,
      "user-a",
      "11111111-1111-4111-8111-111111111111",
      { date: "07/12/2026", waterMl: 500 },
    )).rejects.toThrow("YYYY-MM-DD");
    await expect(saveBodyLogEntry(
      supabase,
      "user-a",
      "11111111-1111-4111-8111-111111111111",
      { date: "2026-07-12", mood: 6 },
    )).rejects.toThrow("1 to 5");
    expect(calls).toEqual([]);
  });
});
