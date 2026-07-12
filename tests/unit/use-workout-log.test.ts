import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkoutEntry } from "@/lib/coach/types";
import { todayIsoDate } from "@/lib/fuelwell-data";

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
const workout: WorkoutEntry = {
  id: "workout-1",
  name: "Strength session",
  category: "Strength",
  durationMin: 40,
  loggedAt: `${date}T14:00:00.000Z`,
  source: "database",
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

describe("use-workout-log persistence store", () => {
  it("migrates legacy data only into the date-scoped preview cache", async () => {
    const storage = installBrowser();
    storage.setItem("fuelwell-workout-log-v1", JSON.stringify([workout]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ signedIn: false, workouts: [] }),
    ));

    const store = await import("@/lib/use-workout-log");
    await store.initializeWorkoutLog();
    expect(store.getWorkoutLogSnapshot()).toMatchObject({
      workouts: [workout],
      persistence: { mode: "preview", status: "saved", userId: null },
    });
    await store.addWorkout({ ...workout, id: "workout-2" });
    expect(JSON.parse(
      storage.getItem(`fuelwell-workout-log-preview-v2:${date}`)!,
    ).workouts).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses authenticated server state and never reads another user's cache", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-workout-log-user-v2:user-a:${date}`, JSON.stringify({
      workouts: [{ ...workout, name: "Stale cache" }],
    }));
    storage.setItem(`fuelwell-workout-log-user-v2:user-b:${date}`, JSON.stringify({
      workouts: [{ ...workout, name: "Other user" }],
    }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      signedIn: true,
      userId: "user-a",
      date,
      workouts: [workout],
    })));

    const store = await import("@/lib/use-workout-log");
    await store.initializeWorkoutLog();
    expect(store.getWorkoutLogSnapshot()).toMatchObject({
      workouts: [workout],
      persistence: { mode: "authenticated", userId: "user-a" },
    });
    expect(JSON.parse(
      storage.getItem(`fuelwell-workout-log-user-v2:user-a:${date}`)!,
    ).workouts).toEqual([workout]);
    expect(JSON.parse(
      storage.getItem(`fuelwell-workout-log-user-v2:user-b:${date}`)!,
    ).workouts[0].name).toBe("Other user");
  });

  it("rolls back a failed signed-in write and exposes the error", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [workout],
      }))
      .mockResolvedValueOnce(jsonResponse({ error: "database unavailable" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-workout-log");
    await store.initializeWorkoutLog();
    const result = await store.addWorkout({ ...workout, id: "failed-workout" });
    expect(result).toEqual({ ok: false, error: "database unavailable" });
    expect(store.getWorkoutLogSnapshot()).toMatchObject({
      workouts: [workout],
      persistence: { status: "error", error: "database unavailable" },
    });
  });

  it("serializes add, update, and delete through the durable API", async () => {
    installBrowser();
    const updated = { ...workout, durationMin: 50, source: "manual_edit" as const };
    const added = { ...workout, id: "workout-2" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [workout],
      }))
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [workout, added],
      }))
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [updated, added],
      }))
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [updated],
      }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-workout-log");
    await store.initializeWorkoutLog();
    await expect(store.addWorkout(added)).resolves.toMatchObject({ ok: true });
    await expect(store.updateWorkout(workout.id, { durationMin: 50 })).resolves.toMatchObject({ ok: true });
    await expect(store.removeWorkout(added.id)).resolves.toMatchObject({ ok: true });

    expect(fetchMock.mock.calls.slice(1).map((call) => call[1].method)).toEqual([
      "POST", "POST", "DELETE",
    ]);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body as string)).toMatchObject({
      workout: { id: workout.id, durationMin: 50, source: "manual_edit" },
    });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body as string)).toEqual({
      date,
      workoutId: added.id,
    });
  });

  it("keeps edited manual movement in the activity repository path", async () => {
    installBrowser();
    const activity: WorkoutEntry = {
      ...workout,
      id: "walk-1",
      category: "Walking",
      source: "manual_activity",
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true, userId: "user-a", date, workouts: [activity],
      }))
      .mockResolvedValueOnce(jsonResponse({
        signedIn: true,
        userId: "user-a",
        date,
        workouts: [{ ...activity, durationMin: 55 }],
      }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-workout-log");
    await store.initializeWorkoutLog();
    await store.updateWorkout(activity.id, { durationMin: 55, source: "manual_edit" });

    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toMatchObject({
      workout: { id: activity.id, durationMin: 55, source: "manual_activity" },
    });
  });
});
