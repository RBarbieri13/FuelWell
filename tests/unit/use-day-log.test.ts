import { afterEach, describe, expect, it, vi } from "vitest";
import { todayIsoDate, type MealRecord } from "@/lib/fuelwell-data";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

const date = todayIsoDate();
const serverMeal: MealRecord = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  mealType: "breakfast",
  name: "Server breakfast",
  loggedAt: `${date}T12:00:00.000Z`,
  items: [{
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Eggs",
    servings: 1,
    calories: 180,
    protein: 14,
    carbs: 2,
    fat: 12,
  }],
};

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("use-day-log persistence store", () => {
  it("keeps signed-out preview data in the separate date cache", async () => {
    const storage = installBrowser();
    const previewMeal = { ...serverMeal, id: "preview-meal", name: "Preview only" };
    storage.setItem(`fuelwell-day-log-preview-v1:${date}`, JSON.stringify({ meals: [previewMeal] }));
    storage.setItem("fuelwell-day-log-v1", JSON.stringify({ meals: [serverMeal] }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ signedIn: false, meals: [] })));

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();
    expect(store.getDayLogSnapshot()).toMatchObject({
      meals: [previewMeal],
      persistence: { mode: "preview", status: "saved", userId: null },
    });

    const result = await store.addMeal({
      mealType: "snack",
      name: "Apple",
      items: [{ name: "Apple", servings: 1, calories: 95, protein: 0, carbs: 25, fat: 0 }],
    });
    expect(result.ok).toBe(true);
    expect(JSON.parse(storage.getItem(`fuelwell-day-log-preview-v1:${date}`)!).meals).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses the server over divergent cache data and namespaces the user snapshot", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-day-log-user-v1:user-a:${date}`, JSON.stringify({
      meals: [{ ...serverMeal, name: "Stale cache" }],
    }));
    storage.setItem(`fuelwell-day-log-user-v1:user-b:${date}`, JSON.stringify({ meals: [] }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      signedIn: true,
      userId: "user-a",
      date,
      meals: [serverMeal],
    })));

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();

    expect(store.getDayLogSnapshot()).toMatchObject({
      meals: [serverMeal],
      persistence: { mode: "authenticated", status: "saved", userId: "user-a" },
    });
    expect(JSON.parse(storage.getItem(`fuelwell-day-log-user-v1:user-a:${date}`)!).meals).toEqual([serverMeal]);
    expect(JSON.parse(storage.getItem(`fuelwell-day-log-user-v1:user-b:${date}`)!).meals).toEqual([]);
  });

  it("rolls back a failed authenticated write and exposes the failure", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [serverMeal] }))
      .mockResolvedValueOnce(jsonResponse({ error: "database unavailable" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();
    const result = await store.addMeal({
      mealType: "lunch",
      name: "Failed lunch",
      items: [{ name: "Soup", servings: 1, calories: 200, protein: 8, carbs: 30, fat: 5 }],
    });

    expect(result).toEqual({ ok: false, error: "database unavailable" });
    expect(store.getDayLogSnapshot()).toMatchObject({
      meals: [serverMeal],
      persistence: { status: "error", error: "database unavailable" },
    });
    const request = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(request.meal.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(request.meal.items[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("replaces optimistic state with the server response after a successful write", async () => {
    installBrowser();
    const persisted = [{ ...serverMeal, name: "Canonical server name" }];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: persisted }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();
    const result = await store.addMeal({
      mealType: "breakfast",
      name: "Client name",
      items: [{ name: "Eggs", servings: 1, calories: 180, protein: 14, carbs: 2, fat: 12 }],
    });

    expect(result.ok).toBe(true);
    expect(store.getDayLogSnapshot()).toMatchObject({
      meals: persisted,
      persistence: { status: "saved", error: null },
    });
  });

  it("persists duplicate, item update, and delete through their durable API methods", async () => {
    installBrowser();
    const duplicated = {
      ...serverMeal,
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      name: "Server breakfast copy",
      items: [{ ...serverMeal.items[0], id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" }],
    };
    const updated = {
      ...duplicated,
      items: [{ ...duplicated.items[0], calories: 220 }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [serverMeal] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [serverMeal, duplicated] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [serverMeal, updated] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, meals: [serverMeal] }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();
    await expect(store.duplicateMeal(serverMeal.id)).resolves.toMatchObject({ ok: true });
    await expect(store.updateMealItem(duplicated.id, duplicated.items[0].id, { calories: 220 })).resolves.toMatchObject({ ok: true });
    await expect(store.removeMeal(duplicated.id)).resolves.toMatchObject({ ok: true });

    expect(fetchMock.mock.calls.slice(1).map((call) => call[1].method)).toEqual(["POST", "PATCH", "DELETE"]);
    const duplicateBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(duplicateBody.meal.id).not.toBe(serverMeal.id);
    expect(duplicateBody.meal.items[0].id).not.toBe(serverMeal.items[0].id);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body as string)).toMatchObject({
      mealId: duplicated.id,
      itemId: duplicated.items[0].id,
      patch: { calories: 220 },
    });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body as string)).toMatchObject({
      mealId: duplicated.id,
    });
  });

  it("reuses aliases when the same legacy client meal is replayed", async () => {
    installBrowser();
    const legacyMeal: MealRecord = {
      ...serverMeal,
      id: "coach-meal-1",
      items: [{ ...serverMeal.items[0], id: "coach-item-1" }],
    };
    const posted: MealRecord[] = [];
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) {
        return jsonResponse({ signedIn: true, userId: "user-a", date, meals: [] });
      }
      const body = JSON.parse(init.body as string) as { meal: MealRecord };
      posted.push(body.meal);
      return jsonResponse({ signedIn: true, userId: "user-a", date, meals: [body.meal] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-day-log");
    await store.initializeDayLog();
    await store.addMealRecord(legacyMeal);
    await store.addMealRecord(legacyMeal);

    expect(posted).toHaveLength(2);
    expect(posted[1].id).toBe(posted[0].id);
    expect(posted[1].items[0].id).toBe(posted[0].items[0].id);
  });
});
