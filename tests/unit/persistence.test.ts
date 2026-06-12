import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadRecentMessages,
  mergeProfilePreferences,
} from "@/lib/coach/persistence";

/**
 * Minimal chainable Supabase stub: every query-builder method returns the
 * chain; awaiting it (or calling maybeSingle/single) resolves the queued
 * response for that table+operation.
 */
type Resp = { data: unknown; error: { message: string } | null };

function makeSupabase(responses: Record<string, Resp[]>, calls: Array<{ table: string; op: string; args: unknown }>) {
  function chain(table: string) {
    let op = "select";
    const next = () => {
      const queue = responses[`${table}.${op}`] ?? responses[table] ?? [];
      return queue.shift() ?? { data: null, error: null };
    };
    const c: Record<string, unknown> = {};
    for (const m of ["select", "eq", "is", "order", "limit", "insert", "update"]) {
      c[m] = (...args: unknown[]) => {
        if (m === "insert" || m === "update" || m === "select") op = m === "select" ? op : m;
        calls.push({ table, op: m, args });
        return c;
      };
    }
    c.maybeSingle = () => Promise.resolve(next());
    c.single = () => Promise.resolve(next());
    c.then = (resolve: (r: Resp) => unknown) => Promise.resolve(next()).then(resolve);
    return c;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

describe("mergeProfilePreferences", () => {
  it("shallow-merges the patch over the existing jsonb and updates the row", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      {
        "profiles.select": [
          { data: { preferences_jsonb: { likes: ["a"], diets: ["keto"] } }, error: null },
        ],
        "profiles.update": [{ data: null, error: null }],
      },
      calls
    );

    await mergeProfilePreferences(supabase, "user-1", { diets: ["vegan"], allergies: ["peanuts"] });

    const update = calls.find((c) => c.op === "update");
    expect(update).toBeDefined();
    expect((update!.args as unknown[])[0]).toEqual({
      preferences_jsonb: { likes: ["a"], diets: ["vegan"], allergies: ["peanuts"] },
    });
  });

  it("treats a missing profile row as empty preferences", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase({ "profiles.update": [{ data: null, error: null }] }, calls);

    await mergeProfilePreferences(supabase, "user-1", { likes: ["x"] });

    const update = calls.find((c) => c.op === "update");
    expect((update!.args as unknown[])[0]).toEqual({ preferences_jsonb: { likes: ["x"] } });
  });

  it("logs instead of throwing when the update fails", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      { "profiles.update": [{ data: null, error: { message: "nope" } }] },
      calls
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(mergeProfilePreferences(supabase, "user-1", { likes: [] })).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe("loadRecentMessages", () => {
  it("returns empty when the user has no unarchived conversation", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase({}, calls);
    const out = await loadRecentMessages(supabase, "user-1");
    expect(out).toEqual({ conversationId: null, messages: [] });
  });

  it("returns the latest conversation's messages oldest-first", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      {
        "coach_conversations.select": [{ data: { id: "conv-1" }, error: null }],
        "coach_messages.select": [
          {
            // Query orders newest-first; loader must reverse.
            data: [
              { role: "assistant", content_jsonb: { text: "hi back" }, artifacts_jsonb: [] },
              { role: "user", content_jsonb: { text: "hi" }, artifacts_jsonb: [] },
            ],
            error: null,
          },
        ],
      },
      calls
    );

    const out = await loadRecentMessages(supabase, "user-1");
    expect(out.conversationId).toBe("conv-1");
    expect(out.messages.map((m) => m.content)).toEqual(["hi", "hi back"]);
  });
});
