import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutEntry } from "@/lib/coach/types";
import {
  loadWorkoutLog,
  saveWorkoutEntry,
} from "@/lib/workout-log-repository";

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
    for (const method of [
      "select", "eq", "order", "upsert", "delete", "in", "gt",
    ]) {
      builder[method] = (...args: unknown[]) => {
        if (["upsert", "delete"].includes(method)) operation = method;
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.single = () => Promise.resolve(result());
    builder.maybeSingle = () => Promise.resolve(result());
    builder.then = (resolve: (value: ResponseValue) => unknown) =>
      Promise.resolve(result()).then(resolve);
    return builder;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

const workout: WorkoutEntry = {
  id: "client-workout-1",
  name: "Strength session",
  category: "Strength",
  durationMin: 45,
  loggedAt: "2026-07-12T14:00:00.000Z",
  calories: 320,
  source: "database",
  exercises: [{ name: "Squat", sets: 3, reps: 8, weightKg: 60 }],
  notes: "Felt steady",
};

const sessionRow = {
  id: "session-1",
  idempotency_key: "workout-entry:2026-07-12:client-workout-1",
  workout_library_id: "Strength",
  title: "Strength session",
  session_date: "2026-07-12",
  started_at: workout.loggedAt,
  duration_minutes: 45,
  calories_burned: 320,
  source: "database",
  notes: "Felt steady",
  workout_exercises: [{
    id: "exercise-1",
    name: "Squat",
    position: 0,
    target_sets: 3,
    target_reps: "8",
    workout_sets: [{ set_number: 1, reps: 8, weight_kg: 60 }],
  }],
};

describe("workout log repository", () => {
  it("loads workout sessions and activities for only the requested user and date", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "workout_sessions.select": [{ data: [sessionRow], error: null }],
      "activity_entries.select": [{
        data: [{
          idempotency_key: "activity-entry:2026-07-12:walk-1",
          activity_date: "2026-07-12",
          activity_type: "Walking",
          source: "manual_activity",
          started_at: "2026-07-12T16:00:00.000Z",
          duration_minutes: 20,
          calories_burned: 90,
          distance_meters: 1609.344,
          metadata: { name: "Lunch walk", met: 3.5 },
          notes: null,
        }],
        error: null,
      }],
    }, calls);

    const result = await loadWorkoutLog(supabase, "user-a", "2026-07-12");
    expect(result).toEqual([
      expect.objectContaining({ id: workout.id, exercises: workout.exercises }),
      expect.objectContaining({
        id: "walk-1",
        name: "Lunch walk",
        source: "manual_activity",
        distanceMiles: 1,
      }),
    ]);
    for (const table of ["workout_sessions", "activity_entries"]) {
      expect(calls).toEqual(expect.arrayContaining([
        { table, method: "eq", args: ["user_id", "user-a"] },
      ]));
    }
    expect(calls).toEqual(expect.arrayContaining([
      { table: "workout_sessions", method: "eq", args: ["session_date", "2026-07-12"] },
      { table: "activity_entries", method: "eq", args: ["activity_date", "2026-07-12"] },
    ]));
  });

  it("uses stable idempotency keys and writes normalized exercises and completed sets", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "workout_sessions.select": [
        { data: null, error: null },
        { data: [sessionRow], error: null },
      ],
      "workout_sessions.upsert": [{ data: { id: "session-1" }, error: null }],
      "workout_exercises.upsert": [{ data: null, error: null }],
      "workout_exercises.select": [{
        data: [{
          id: "exercise-1",
          idempotency_key: "workout-entry:2026-07-12:client-workout-1:exercise:0",
          position: 0,
        }],
        error: null,
      }],
      "workout_sets.upsert": [{ data: null, error: null }],
      "workout_sets.delete": [{ data: null, error: null }],
      "activity_entries.select": [{ data: [], error: null }],
    }, calls);

    await expect(
      saveWorkoutEntry(supabase, "user-a", "2026-07-12", workout),
    ).resolves.toEqual([expect.objectContaining({ id: workout.id })]);

    const sessionUpsert = calls.find(
      (call) => call.table === "workout_sessions" && call.method === "upsert",
    );
    expect(sessionUpsert?.args).toEqual([
      expect.objectContaining({
        user_id: "user-a",
        idempotency_key: "workout-entry:2026-07-12:client-workout-1",
        session_date: "2026-07-12",
      }),
      { onConflict: "user_id,idempotency_key" },
    ]);
    const setUpsert = calls.find(
      (call) => call.table === "workout_sets" && call.method === "upsert",
    );
    expect(setUpsert?.args[0]).toEqual([
      expect.objectContaining({ set_number: 1, completed: true, reps: 8, weight_kg: 60 }),
      expect.objectContaining({ set_number: 2, completed: true, reps: 8, weight_kg: 60 }),
      expect.objectContaining({ set_number: 3, completed: true, reps: 8, weight_kg: 60 }),
    ]);
  });

  it("compensates a new session when a child write fails", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "workout_sessions.select": [{ data: null, error: null }],
      "workout_sessions.upsert": [{ data: { id: "session-1" }, error: null }],
      "workout_exercises.upsert": [{ data: null, error: { message: "exercise write failed" } }],
      "workout_sessions.delete": [{ data: null, error: null }],
    }, calls);

    await expect(
      saveWorkoutEntry(supabase, "user-a", "2026-07-12", workout),
    ).rejects.toThrow("exercise write failed");
    expect(calls).toEqual(expect.arrayContaining([
      { table: "workout_sessions", method: "delete", args: [] },
      { table: "workout_sessions", method: "eq", args: ["user_id", "user-a"] },
      { table: "workout_sessions", method: "eq", args: ["id", "session-1"] },
    ]));
  });

  it("stores manual activity entries separately with a retry-safe key", async () => {
    const calls: Call[] = [];
    const activity: WorkoutEntry = {
      id: "walk-1",
      name: "Lunch walk",
      category: "Walking",
      durationMin: 20,
      loggedAt: "2026-07-12T16:00:00.000Z",
      calories: 90,
      distanceMiles: 1,
      met: 3.5,
      source: "manual_activity",
    };
    const supabase = makeSupabase({
      "activity_entries.upsert": [{ data: null, error: null }],
      "workout_sessions.select": [{ data: [], error: null }],
      "activity_entries.select": [{ data: [], error: null }],
    }, calls);

    await saveWorkoutEntry(supabase, "user-a", "2026-07-12", activity);
    const upsert = calls.find(
      (call) => call.table === "activity_entries" && call.method === "upsert",
    );
    expect(upsert?.args).toEqual([
      expect.objectContaining({
        user_id: "user-a",
        idempotency_key: "activity-entry:2026-07-12:walk-1",
        activity_date: "2026-07-12",
        distance_meters: 1609.344,
        metadata: { name: "Lunch walk", met: 3.5 },
      }),
      { onConflict: "user_id,idempotency_key" },
    ]);
  });
});
