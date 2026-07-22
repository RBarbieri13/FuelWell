import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ensureCoachKnowledgeForUser,
  loadCoachKnowledge,
  loadRecentMessages,
  mergeProfilePreferences,
  persistCoachKnowledge,
} from "@/lib/coach/persistence";
import { buildCoachKnowledgeBase } from "@/lib/coach/knowledge";
import { makeSnapshot } from "./helpers";

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
    for (const m of ["select", "eq", "is", "lt", "order", "limit", "insert", "update", "upsert"]) {
      c[m] = (...args: unknown[]) => {
        if (m === "insert" || m === "update" || m === "upsert" || m === "select") op = m === "select" ? op : m;
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

describe("coach knowledge persistence", () => {
  it("loads only the requested user's knowledge row", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const knowledge = buildCoachKnowledgeBase("user-1", makeSnapshot());
    const supabase = makeSupabase(
      {
        "coach_knowledge_bases.select": [{ data: { knowledge_jsonb: knowledge }, error: null }],
      },
      calls,
    );

    const out = await loadCoachKnowledge(supabase, "user-1");
    expect(out?.userId).toBe("user-1");
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "coach_knowledge_bases", op: "eq", args: ["user_id", "user-1"] }),
      ]),
    );
  });

  it("upserts knowledge with user_id as the conflict boundary", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const knowledge = buildCoachKnowledgeBase("user-2", makeSnapshot());
    const supabase = makeSupabase(
      { "coach_knowledge_bases.upsert": [{ data: null, error: null }] },
      calls,
    );

    await persistCoachKnowledge(supabase, knowledge);

    const upsert = calls.find((call) => call.op === "upsert");
    expect(upsert).toBeDefined();
    expect((upsert!.args as unknown[])[0]).toMatchObject({
      user_id: "user-2",
      knowledge_jsonb: expect.objectContaining({ userId: "user-2" }),
    });
    expect((upsert!.args as unknown[])[1]).toEqual({ onConflict: "user_id" });
  });

  it("bootstraps missing knowledge from the signed-in user's profile", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      {
        "coach_knowledge_bases.select": [{ data: null, error: null }],
        "profiles.select": [
          {
            data: {
              display_name: "Maya",
              goal: "lose",
              activity_level: "moderate",
              dietary_preference: "high_protein",
              weight_kg: 72,
              height_cm: 168,
              allergies: ["Shellfish"],
              meals_per_day: 3,
              experience_level: "intermediate",
              preferences_jsonb: {
                units: "imperial",
                likes: ["salmon"],
                dislikes: ["mushrooms"],
                onboarding: {
                  preferredWorkoutTypes: ["strength"],
                  workoutLocation: "gym_home",
                  coachStyle: "direct_supportive",
                },
              },
            },
            error: null,
          },
        ],
        "coach_knowledge_bases.upsert": [{ data: null, error: null }],
      },
      calls,
    );

    await ensureCoachKnowledgeForUser(supabase, "user-login");

    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "profiles", op: "eq", args: ["id", "user-login"] }),
      ]),
    );
    const upsert = calls.find((call) => call.op === "upsert");
    expect(upsert).toBeDefined();
    expect((upsert!.args as unknown[])[0]).toMatchObject({
      user_id: "user-login",
      knowledge_jsonb: expect.objectContaining({
        userId: "user-login",
        profileFacts: expect.arrayContaining(["User name is Maya.", "Primary goal is lose."]),
        preferenceFacts: expect.arrayContaining(["Allergies: Shellfish."]),
      }),
    });
  });

  it("does not rewrite an existing knowledge base during login bootstrap", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const knowledge = buildCoachKnowledgeBase("user-existing", makeSnapshot());
    const supabase = makeSupabase(
      {
        "coach_knowledge_bases.select": [{ data: { knowledge_jsonb: knowledge }, error: null }],
      },
      calls,
    );

    await ensureCoachKnowledgeForUser(supabase, "user-existing");

    expect(calls.some((call) => call.table === "profiles")).toBe(false);
    expect(calls.some((call) => call.op === "upsert")).toBe(false);
  });
});

describe("loadRecentMessages", () => {
  it("returns empty when the user has no unarchived conversation", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase({}, calls);
    const out = await loadRecentMessages(supabase, "user-1");
    expect(out).toEqual({ conversationId: null, messages: [], hasMore: false, nextBefore: null });
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
    expect(out.hasMore).toBe(false);
    expect(out.nextBefore).toBeNull();
  });

  it("caps the page at limit and reports hasMore with the oldest row as cursor", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      {
        "coach_conversations.select": [{ data: { id: "conv-1" }, error: null }],
        "coach_messages.select": [
          {
            // limit+1 rows returned (newest-first) => one more page exists.
            data: [
              { role: "assistant", content_jsonb: { text: "third" }, artifacts_jsonb: [], created_at: "2026-07-22T10:03:00Z" },
              { role: "user", content_jsonb: { text: "second" }, artifacts_jsonb: [], created_at: "2026-07-22T10:02:00Z" },
              { role: "assistant", content_jsonb: { text: "first" }, artifacts_jsonb: [], created_at: "2026-07-22T10:01:00Z" },
            ],
            error: null,
          },
        ],
      },
      calls
    );

    const out = await loadRecentMessages(supabase, "user-1", { limit: 2 });
    expect(out.messages.map((m) => m.content)).toEqual(["second", "third"]);
    expect(out.hasMore).toBe(true);
    expect(out.nextBefore).toBe("2026-07-22T10:02:00Z");
    // limit+1 requested so hasMore is observed, not guessed.
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "coach_messages", op: "limit", args: [3] }),
      ])
    );
  });

  it("filters to rows older than the before cursor", async () => {
    const calls: Array<{ table: string; op: string; args: unknown }> = [];
    const supabase = makeSupabase(
      {
        "coach_conversations.select": [{ data: { id: "conv-1" }, error: null }],
        "coach_messages.select": [
          {
            data: [
              { role: "user", content_jsonb: { text: "older" }, artifacts_jsonb: [], created_at: "2026-07-22T09:00:00Z" },
            ],
            error: null,
          },
        ],
      },
      calls
    );

    const out = await loadRecentMessages(supabase, "user-1", { before: "2026-07-22T10:00:00Z" });
    expect(out.messages.map((m) => m.content)).toEqual(["older"]);
    expect(out.hasMore).toBe(false);
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "coach_messages",
          op: "lt",
          args: ["created_at", "2026-07-22T10:00:00Z"],
        }),
      ])
    );
  });
});
