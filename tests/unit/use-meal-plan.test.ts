import { afterEach, describe, expect, it, vi } from "vitest";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function installBrowser(storage = new MemoryStorage()) {
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

function fixtureDays(weekStart: string) {
  return [{
    id: "mon",
    label: "Mon",
    date: "Aug 10",
    iso: weekStart,
    focus: "Training",
    meals: [{
      slot: "Breakfast" as const,
      title: "Protein oats",
      calories: 420,
      protein: 31,
      prep: "10 min",
      status: "planned" as const,
    }],
  }];
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("meal plan persistence store", () => {
  it("uses only a preview-and-week local fallback for signed-out users", async () => {
    const storage = installBrowser();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ signedIn: false, days: [] })));
    const store = await import("@/lib/use-meal-plan");

    await store.initializeMealPlan();
    const weekStart = store.getMealPlanSnapshot().persistence.weekStart;
    expect(storage.getItem(`fuelwell-meal-plan-preview-v2:${weekStart}`)).not.toBeNull();
    expect(store.getMealPlanSnapshot().persistence).toMatchObject({
      mode: "preview",
      userId: null,
      weekStart,
    });
  });

  it("accepts authenticated empty server state and never replays another user's cache", async () => {
    const storage = installBrowser();
    storage.setItem("fuelwell-meal-plan-user-v2:user-a:2026-08-10", JSON.stringify({ days: fixtureDays("2026-08-10") }));
    storage.setItem("fuelwell-meal-plan-user-v2:user-b:2026-08-10", "private-b");
    const fetchMock = vi.fn(async (url: string) => {
      const weekStart = new URL(url, "http://fuelwell.test").searchParams.get("weekStart");
      return jsonResponse({ signedIn: true, userId: "user-a", weekStart, days: [] });
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = await import("@/lib/use-meal-plan");

    await store.initializeMealPlan();
    expect(store.getMealPlanSnapshot()).toMatchObject({
      days: [],
      persistence: { mode: "authenticated", userId: "user-a", status: "saved" },
    });
    expect(storage.getItem("fuelwell-meal-plan-user-v2:user-b:2026-08-10")).toBe("private-b");
  });

  it("persists a starter week and rejects a write response owned by another account", async () => {
    installBrowser();
    let weekStart = "";
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (!init?.body) {
        weekStart = new URL(url, "http://fuelwell.test").searchParams.get("weekStart") ?? "";
        return jsonResponse({ signedIn: true, userId: "user-a", weekStart, days: [] });
      }
      const body = JSON.parse(init.body as string) as { days: unknown[] };
      return jsonResponse({ signedIn: true, userId: "user-b", weekStart, days: body.days });
    });
    vi.stubGlobal("fetch", fetchMock);
    const store = await import("@/lib/use-meal-plan");

    await store.initializeMealPlan();
    const result = await store.createStarterMealPlan();
    expect(result).toEqual({
      ok: false,
      error: "Authenticated meal plan response did not match the current user.",
    });
    expect(store.getMealPlanSnapshot().days).toEqual([]);
  });

  it("clears every week cached for a user without touching another account", async () => {
    const storage = installBrowser();
    storage.setItem("fuelwell-meal-plan-user-v2:user-a:2026-08-10", "a1");
    storage.setItem("fuelwell-meal-plan-user-v2:user-a:2026-08-17", "a2");
    storage.setItem("fuelwell-meal-plan-user-v2:user-b:2026-08-10", "b1");
    const store = await import("@/lib/use-meal-plan");

    store.clearMealPlanCacheForUser("user-a");
    expect(storage.getItem("fuelwell-meal-plan-user-v2:user-a:2026-08-10")).toBeNull();
    expect(storage.getItem("fuelwell-meal-plan-user-v2:user-a:2026-08-17")).toBeNull();
    expect(storage.getItem("fuelwell-meal-plan-user-v2:user-b:2026-08-10")).toBe("b1");
  });
});
