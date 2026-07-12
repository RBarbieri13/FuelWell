import { describe, expect, it } from "vitest";
import { applySnapshotMutation } from "@/lib/coach/apply-mutation";
import type { CoachDaySnapshot, WorkoutEntry } from "@/lib/coach/types";

function snapshot(): CoachDaySnapshot {
  return {
    date: "2026-07-12",
    meals: [],
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    targets: { calories: 2200, protein: 160, carbs: 240, fat: 70 },
    workouts: [],
    grocery: [],
    bodyLog: [],
    preferences: { diets: [], allergies: [], likes: [], dislikes: [] },
    profile: {},
  };
}

describe("Coach snapshot mutations", () => {
  it("does not duplicate a retried workout mutation", () => {
    const current = snapshot();
    const workout: WorkoutEntry = {
      id: crypto.randomUUID(),
      name: "Walk",
      category: "cardio",
      durationMin: 20,
      loggedAt: "2026-07-12T12:00:00.000Z",
    };

    applySnapshotMutation(current, { kind: "add_workout", workout });
    applySnapshotMutation(current, { kind: "add_workout", workout });

    expect(current.workouts).toEqual([workout]);
  });

  it("keeps one body entry per day when an event is retried", () => {
    const current = snapshot();
    applySnapshotMutation(current, {
      kind: "add_body_log",
      entry: { date: "2026-07-12", weightKg: 80 },
    });
    applySnapshotMutation(current, {
      kind: "add_body_log",
      entry: { date: "2026-07-12", weightKg: 79.8 },
    });

    expect(current.bodyLog).toEqual([{ date: "2026-07-12", weightKg: 79.8 }]);
  });
});
