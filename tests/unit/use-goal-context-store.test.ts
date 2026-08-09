import { afterEach, describe, expect, it, vi } from "vitest";
import { buildDefaultGoalPlan, type IntegrationDailySummary } from "@/lib/goal-context";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("goal-context store", () => {
  it("hydrates the signed-in scope from that user's persisted goal plan and integration summary", async () => {
    const storage = new MemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });

    const store = await import("@/lib/use-goal-context");
    const persistedPlan = {
      ...buildDefaultGoalPlan({ goal: "gain" }),
      id: "goal-user-a",
    };
    const persistedIntegration: IntegrationDailySummary = {
      provider: "garmin",
      status: "connected",
      date: "2026-08-09",
      sourceLabel: "Garmin Connect",
      steps: 12000,
    };

    storage.setItem(
      store.goalPlanStorageKey("user-a"),
      JSON.stringify({ plan: persistedPlan }),
    );
    storage.setItem(
      store.integrationSummaryStorageKey("user-a"),
      JSON.stringify({ summary: persistedIntegration }),
    );

    store.setGoalContextScope("user-a");
    expect(store.getGoalContextSnapshot()).toMatchObject({
      goalPlan: persistedPlan,
      integrationSummary: persistedIntegration,
    });

    store.setGoalContextScope("user-b");
    expect(store.getGoalContextSnapshot().goalPlan.id).not.toBe("goal-user-a");
  });
});
