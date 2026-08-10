import { afterEach, describe, expect, it, vi } from "vitest";
import { buildDefaultGoalPlan } from "@/lib/goal-context";

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
  it("does not hydrate a signed-in scope from legacy browser state", async () => {
    const storage = new MemoryStorage();
    vi.stubGlobal("window", { location: { host: "app.fuelwell.test" }, localStorage: storage });

    const store = await import("@/lib/use-goal-context");
    const persistedPlan = {
      ...buildDefaultGoalPlan({ goal: "gain" }),
      id: "goal-user-a",
    };

    storage.setItem(
      store.goalPlanStorageKey("user-a"),
      JSON.stringify({ plan: persistedPlan }),
    );
    store.configureGoalContextPersistence("user-a", {
      saveGoalPlan: async (plan) => plan,
      saveIntegrationSummary: async (summary) => summary,
    });

    expect(store.getGoalContextSnapshot().goalPlan.id).not.toBe("goal-user-a");
  });
});
