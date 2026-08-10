import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { buildDailyGoalContext, buildDefaultGoalPlan } from "@/lib/goal-context";
import { issueCoachConfirmationToken } from "@/lib/coach/confirmation";
import { makeSnapshot } from "./helpers";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  currentUser: { id: "user-1" } as { id: string } | null,
  getTool: vi.fn(),
  persistCoachMutations: vi.fn(),
  insertSupabaseAudit: vi.fn(),
  loadServerDailyGoalContext: vi.fn(),
  consumedConfirmationNonces: new Set<string>(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ host: "fuelwell.test" })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/coach/knowledge", () => ({
  buildCoachKnowledgeBase: vi.fn(() => null),
  formatKnowledgeForPrompt: vi.fn(() => ""),
  mergeCoachKnowledge: vi.fn((_existing, next) => next),
  retrieveCoachKnowledge: vi.fn(() => []),
}));

vi.mock("@/lib/coach/registry", () => ({
  getTool: mocks.getTool,
  toAnthropicTools: vi.fn(() => []),
}));

vi.mock("@/lib/coach/tools", () => ({}));

vi.mock("@/lib/coach/persistence", () => ({
  ensureConversation: vi.fn(async () => "conversation-1"),
  getSupabaseDayCents: vi.fn(async () => 0),
  insertSupabaseAudit: vi.fn(async (_supabase, row) => {
    mocks.insertSupabaseAudit(row);
  }),
  insertSupabaseUsage: vi.fn(async () => undefined),
  loadCoachKnowledge: vi.fn(async () => null),
  mergeProfilePreferences: vi.fn(async () => undefined),
  persistCoachKnowledge: vi.fn(async () => undefined),
  persistCoachMutations: vi.fn(async (...args) => {
    mocks.persistCoachMutations(...args);
  }),
  saveCoachUploadedArtifacts: vi.fn(async () => undefined),
  saveMessages: vi.fn(async () => undefined),
}));

vi.mock("@/lib/server-goal-context", () => ({
  loadServerDailyGoalContext: vi.fn(async (...args) => mocks.loadServerDailyGoalContext(...args)),
}));

beforeEach(() => {
  mocks.currentUser = { id: "user-1" };
  mocks.createClient.mockReset();
  mocks.createClient.mockResolvedValue({
    auth: { getUser: vi.fn(async () => ({ data: { user: mocks.currentUser } })) },
    from: vi.fn((table: string) => {
      if (table !== "coach_confirmation_uses") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        insert: vi.fn(async (row: { nonce_hash: string }) => {
          if (mocks.consumedConfirmationNonces.has(row.nonce_hash)) {
            return { error: { code: "23505", message: "duplicate" } };
          }
          mocks.consumedConfirmationNonces.add(row.nonce_hash);
          return { error: null };
        }),
      };
    }),
  });
  mocks.getTool.mockReset();
  mocks.persistCoachMutations.mockReset();
  mocks.insertSupabaseAudit.mockReset();
  mocks.loadServerDailyGoalContext.mockReset();
  mocks.consumedConfirmationNonces.clear();
  mocks.loadServerDailyGoalContext.mockImplementation(async (_supabase, input) => {
    const serverPlan = {
      ...buildDefaultGoalPlan({ goal: "gain" }),
      id: "server-goal-plan",
    };
    return buildDailyGoalContext({
      date: input.date,
      meals: input.meals,
      totals: input.totals,
      targets: input.targets,
      profile: input.profile,
      goalPlan: serverPlan,
    });
  });
  process.env.ANTHROPIC_API_KEY = "test-confirm-secret";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fuelwell.test";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("coach turn confirmation integrity", () => {
  it("rejects destructive confirmedTool requests without a server-issued token", async () => {
    const run = vi.fn(async () => ({
      modelResult: { deleted: { name: "Lunch" } },
      mutations: [{ kind: "remove_meal", mealId: "meal-1" as const }],
      persisted: true,
    }));
    mocks.getTool.mockReturnValue({
      name: "delete_meal",
      destructive: true,
      schema: z.object({ mealId: z.string() }),
      run,
    });

    const { POST } = await import("@/app/api/coach/turn/route");
    const response = await POST(
      new Request("https://fuelwell.test/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: "conversation-1",
          messages: [{ role: "user", content: "Yes, delete it." }],
          snapshot: makeSnapshot(),
          confirmedTool: { name: "delete_meal", input: { mealId: "meal-1" } },
        }),
      }),
    );

    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain("couldn't verify that confirmation");
    expect(run).not.toHaveBeenCalled();
    expect(mocks.insertSupabaseAudit).toHaveBeenCalledWith(
      expect.objectContaining({ resultSummary: "rejected-confirmed-tool" }),
    );
  });

  it("executes destructive confirmations only with a matching token and uses the server goal context", async () => {
    const run = vi.fn(async () => ({
      modelResult: { deleted: { name: "Lunch" } },
      mutations: [{ kind: "remove_meal", mealId: "meal-1" as const }],
      persisted: true,
    }));
    mocks.getTool.mockReturnValue({
      name: "delete_meal",
      destructive: true,
      schema: z.object({ mealId: z.string() }),
      run,
    });

    const token = issueCoachConfirmationToken({
      userId: "user-1",
      conversationId: "conversation-1",
      toolName: "delete_meal",
      input: { mealId: "meal-1" },
      env: { ANTHROPIC_API_KEY: "test-confirm-secret" },
    });

    const { POST } = await import("@/app/api/coach/turn/route");
    const response = await POST(
      new Request("https://fuelwell.test/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: "conversation-1",
          messages: [{ role: "user", content: "Yes, delete it." }],
          snapshot: makeSnapshot({
            goalPlan: { ...buildDefaultGoalPlan({ goal: "lose" }), id: "client-goal-plan" },
          }),
          confirmedTool: {
            name: "delete_meal",
            input: { mealId: "meal-1" },
            token,
          },
        }),
      }),
    );

    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain("Done. I deleted Lunch");
    expect(run).toHaveBeenCalledOnce();
    expect(mocks.persistCoachMutations).toHaveBeenCalled();
    expect(mocks.persistCoachMutations.mock.calls[0][3]).toMatchObject({
      goalPlan: { id: "server-goal-plan" },
    });

    const replay = await POST(
      new Request("https://fuelwell.test/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: "conversation-1",
          messages: [{ role: "user", content: "Yes, delete it again." }],
          snapshot: makeSnapshot(),
          confirmedTool: {
            name: "delete_meal",
            input: { mealId: "meal-1" },
            token,
          },
        }),
      }),
    );
    expect(await replay.text()).toContain("confirmation was already used");
    expect(run).toHaveBeenCalledOnce();
  });
});
