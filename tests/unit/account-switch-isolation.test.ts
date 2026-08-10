import { afterEach, describe, expect, it, vi } from "vitest";
import { todayIsoDate, type MealRecord } from "@/lib/fuelwell-data";
import type { WorkoutEntry } from "@/lib/coach/types";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const date = todayIsoDate();
const endpoints = ["/api/day-log", "/api/workout-log", "/api/body-log", "/api/grocery-list"];

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mealFor(label: string): MealRecord {
  return {
    id: `${label}-meal`,
    mealType: "breakfast",
    name: `${label} breakfast`,
    loggedAt: `${date}T12:00:00.000Z`,
    items: [{
      id: `${label}-item`,
      name: `${label} eggs`,
      servings: 1,
      calories: 180,
      protein: 14,
      carbs: 2,
      fat: 12,
    }],
  };
}

function workoutFor(label: string): WorkoutEntry {
  return {
    id: `${label}-workout`,
    name: `${label} workout`,
    category: "Strength",
    durationMin: 30,
    loggedAt: `${date}T14:00:00.000Z`,
    source: "database",
  };
}

function groceryFor(label: string) {
  return {
    id: `${label}-grocery`,
    name: `${label} bananas`,
    amount: "2",
    quantity: "2",
    category: "Produce" as const,
    source: "Test",
    checked: false,
  };
}

function responseFor(userId: string, label: string, input: RequestInfo | URL) {
  const path = new URL(String(input), "https://fuelwell.test").pathname;
  if (path === "/api/day-log") {
    return jsonResponse({ signedIn: true, userId, date, meals: [mealFor(label)] });
  }
  if (path === "/api/workout-log") {
    return jsonResponse({ signedIn: true, userId, date, workouts: [workoutFor(label)] });
  }
  if (path === "/api/body-log") {
    return jsonResponse({ signedIn: true, userId, entries: [{ date, mood: label === "A" ? 1 : 5 }] });
  }
  if (path === "/api/grocery-list") {
    return jsonResponse({ signedIn: true, userId, date, items: [groceryFor(label)] });
  }
  throw new Error(`Unexpected request: ${path}`);
}

function signedOutResponse(input: RequestInfo | URL) {
  const path = new URL(String(input), "https://fuelwell.test").pathname;
  if (path === "/api/day-log") return jsonResponse({ signedIn: false, date, meals: [] });
  if (path === "/api/workout-log") return jsonResponse({ signedIn: false, date, workouts: [] });
  if (path === "/api/body-log") return jsonResponse({ signedIn: false, entries: [] });
  if (path === "/api/grocery-list") return jsonResponse({ signedIn: false, date, items: [] });
  throw new Error(`Unexpected request: ${path}`);
}

function installBrowser(storage = new MemoryStorage()) {
  vi.stubGlobal("window", { localStorage: storage, location: { host: "fuelwell.test" } });
  return storage;
}

async function loadStores() {
  const [identity, day, workout, body, grocery] = await Promise.all([
    import("@/lib/profile-preferences"),
    import("@/lib/use-day-log"),
    import("@/lib/use-workout-log"),
    import("@/lib/use-body-log"),
    import("@/lib/use-grocery-list"),
  ]);
  return { identity, day, workout, body, grocery };
}

function initializeAll(stores: Awaited<ReturnType<typeof loadStores>>) {
  return Promise.all([
    stores.day.initializeDayLog(),
    stores.workout.initializeWorkoutLog(),
    stores.body.initializeBodyLog(),
    stores.grocery.initializeGroceryList(),
  ]);
}

function expectAllDataEmpty(stores: Awaited<ReturnType<typeof loadStores>>) {
  expect(stores.day.getDayLogSnapshot().meals).toEqual([]);
  expect(stores.workout.getWorkoutLogSnapshot().workouts).toEqual([]);
  expect(stores.body.getBodyLogSnapshot().entries).toEqual([]);
  expect(stores.grocery.getGrocerySnapshot().items).toEqual([]);
}

function expectUserData(stores: Awaited<ReturnType<typeof loadStores>>, userId: string, label: string) {
  expect(stores.day.getDayLogSnapshot()).toMatchObject({
    meals: [{ name: `${label} breakfast` }],
    persistence: { mode: "authenticated", userId },
  });
  expect(stores.workout.getWorkoutLogSnapshot()).toMatchObject({
    workouts: [{ name: `${label} workout` }],
    persistence: { mode: "authenticated", userId },
  });
  expect(stores.body.getBodyLogSnapshot()).toMatchObject({
    entries: [{ mood: label === "A" ? 1 : 5 }],
    persistence: { mode: "authenticated", userId },
  });
  expect(stores.grocery.getGrocerySnapshot()).toMatchObject({
    items: [{ name: `${label} Bananas` }],
    persistence: { mode: "authenticated", userId },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("same-tab account identity isolation", () => {
  it("exposes no user A state after logout or while user B is loading", async () => {
    installBrowser();
    let phase: "A" | "B" = "A";
    const pendingB = new Map(endpoints.map((path) => [path, deferred<Response>()]));
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const path = new URL(String(input), "https://fuelwell.test").pathname;
      return phase === "A"
        ? Promise.resolve(responseFor("user-a", "A", input))
        : pendingB.get(path)!.promise;
    }));

    const stores = await loadStores();
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-a" });
    await initializeAll(stores);
    expectUserData(stores, "user-a", "A");

    stores.identity.clearUserScopedIdentityCaches("user-a");
    expectAllDataEmpty(stores);

    phase = "B";
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-b" });
    const loadingB = initializeAll(stores);
    expectAllDataEmpty(stores);
    expect(stores.day.getDayLogSnapshot().persistence.userId).toBe("user-b");
    expect(stores.workout.getWorkoutLogSnapshot().persistence.userId).toBe("user-b");
    expect(stores.body.getBodyLogSnapshot().persistence.userId).toBe("user-b");
    expect(stores.grocery.getGrocerySnapshot().persistence.userId).toBe("user-b");

    for (const [path, request] of pendingB) {
      request.resolve(responseFor("user-b", "B", path));
    }
    await expect(loadingB).resolves.toEqual([true, true, true, true]);
    expectUserData(stores, "user-b", "B");
  });

  it("ignores late failures from user A after user B has loaded", async () => {
    installBrowser();
    let phase: "A" | "B" = "A";
    const pendingA = new Map(endpoints.map((path) => [path, deferred<Response>()]));
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const path = new URL(String(input), "https://fuelwell.test").pathname;
      return phase === "A"
        ? pendingA.get(path)!.promise
        : Promise.resolve(responseFor("user-b", "B", input));
    }));

    const stores = await loadStores();
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-a" });
    const staleA = initializeAll(stores);

    phase = "B";
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-b" });
    await initializeAll(stores);
    expectUserData(stores, "user-b", "B");

    for (const request of pendingA.values()) request.reject(new Error("user A request failed"));
    await expect(staleA).resolves.toEqual([false, false, false, false]);
    expectUserData(stores, "user-b", "B");
  });

  it("drops user A mutations that were in flight or queued when identity changes", async () => {
    installBrowser();
    let phase: "A" | "B" = "A";
    const pendingAMutations = new Map(endpoints.map((path) => [path, deferred<Response>()]));
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input), "https://fuelwell.test").pathname;
      if (init?.method && init.method !== "GET") {
        return pendingAMutations.get(path)!.promise;
      }
      return Promise.resolve(
        phase === "A"
          ? responseFor("user-a", "A", input)
          : responseFor("user-b", "B", input),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const stores = await loadStores();
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-a" });
    await initializeAll(stores);

    const first = [
      stores.day.addMeal({
        mealType: "lunch",
        name: "A queued meal one",
        items: [{ name: "Soup", servings: 1, calories: 200, protein: 8, carbs: 30, fat: 5 }],
      }),
      stores.workout.addWorkout({ ...workoutFor("A"), id: "a-workout-one" }),
      stores.body.addBodyLogEntry({ date, mood: 2 }),
      stores.grocery.setGroceryItems([{ ...groceryFor("A"), id: "a-grocery-one" }]),
    ];
    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.filter(([, init]) => init?.method && init.method !== "GET")).toHaveLength(4);
    });
    const queued = [
      stores.day.addMeal({
        mealType: "dinner",
        name: "A queued meal two",
        items: [{ name: "Rice", servings: 1, calories: 220, protein: 4, carbs: 45, fat: 2 }],
      }),
      stores.workout.addWorkout({ ...workoutFor("A"), id: "a-workout-two" }),
      stores.body.addBodyLogEntry({ date, mood: 3 }),
      stores.grocery.setGroceryItems([{ ...groceryFor("A"), id: "a-grocery-two" }]),
    ];

    phase = "B";
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-b" });
    await initializeAll(stores);
    expectUserData(stores, "user-b", "B");

    for (const [path, request] of pendingAMutations) {
      request.resolve(responseFor("user-a", "A", path));
    }
    const results = await Promise.all([...first, ...queued]);
    expect(results.every((result) => !result.ok)).toBe(true);
    expectUserData(stores, "user-b", "B");
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method && init.method !== "GET")).toHaveLength(4);
  });

  it("starts a fresh authenticated session empty and trusts only that user's server response", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-day-log-user-v1:user-a:${date}`, JSON.stringify({ meals: [mealFor("A")] }));
    storage.setItem(`fuelwell-workout-log-user-v2:user-a:${date}`, JSON.stringify({ workouts: [workoutFor("A")] }));
    storage.setItem(`fuelwell-body-log-user-v2:user-a:${date}`, JSON.stringify({ entries: [{ date, mood: 1 }] }));
    storage.setItem(`fuelwell-grocery-user-v2:user-a:${date}`, JSON.stringify([groceryFor("A")]));
    const pendingB = new Map(endpoints.map((path) => [path, deferred<Response>()]));
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => {
      const path = new URL(String(input), "https://fuelwell.test").pathname;
      return pendingB.get(path)!.promise;
    }));

    const stores = await loadStores();
    stores.identity.synchronizeIdentityScope({ mode: "authenticated", userId: "user-b" });
    const loading = initializeAll(stores);
    expectAllDataEmpty(stores);

    for (const [path, request] of pendingB) {
      request.resolve(responseFor("user-b", "B", path));
    }
    await loading;
    expectUserData(stores, "user-b", "B");
  });

  it("keeps a fresh preview session isolated from authenticated caches", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-day-log-preview-v1:${date}`, JSON.stringify({ meals: [mealFor("Preview")] }));
    storage.setItem(`fuelwell-workout-log-preview-v2:${date}`, JSON.stringify({ workouts: [workoutFor("Preview")] }));
    storage.setItem(`fuelwell-body-log-preview-v2:${date}`, JSON.stringify({ entries: [{ date, mood: 3 }] }));
    storage.setItem(`fuelwell-grocery-preview-v2:${date}`, JSON.stringify([groceryFor("Preview")]));
    storage.setItem(`fuelwell-day-log-user-v1:user-a:${date}`, JSON.stringify({ meals: [mealFor("A")] }));
    storage.setItem(`fuelwell-workout-log-user-v2:user-a:${date}`, JSON.stringify({ workouts: [workoutFor("A")] }));
    storage.setItem(`fuelwell-body-log-user-v2:user-a:${date}`, JSON.stringify({ entries: [{ date, mood: 1 }] }));
    storage.setItem(`fuelwell-grocery-user-v2:user-a:${date}`, JSON.stringify([groceryFor("A")]));
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => Promise.resolve(signedOutResponse(input))));

    const stores = await loadStores();
    stores.identity.synchronizeIdentityScope({ mode: "preview" });
    await initializeAll(stores);

    expect(stores.day.getDayLogSnapshot()).toMatchObject({
      meals: [{ name: "Preview breakfast" }],
      persistence: { mode: "preview", userId: null },
    });
    expect(stores.workout.getWorkoutLogSnapshot()).toMatchObject({
      workouts: [{ name: "Preview workout" }],
      persistence: { mode: "preview", userId: null },
    });
    expect(stores.body.getBodyLogSnapshot()).toMatchObject({
      entries: [{ mood: 3 }],
      persistence: { mode: "preview", userId: null },
    });
    expect(stores.grocery.getGrocerySnapshot()).toMatchObject({
      items: [{ name: "Preview Bananas" }],
      persistence: { mode: "preview", userId: null },
    });
  });
});
