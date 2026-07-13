import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { persistCoachMutations } from "@/lib/coach/persistence";

const repositories = vi.hoisted(() => ({
  saveMeal: vi.fn(),
  deleteDayMeal: vi.fn(),
  saveWorkoutEntry: vi.fn(),
  deleteWorkoutEntry: vi.fn(),
  replaceGroceryList: vi.fn(),
  saveBodyLogEntry: vi.fn(),
}));

vi.mock("@/lib/day-log-repository", () => ({
  saveMeal: repositories.saveMeal,
  deleteDayMeal: repositories.deleteDayMeal,
}));
vi.mock("@/lib/workout-log-repository", () => ({
  saveWorkoutEntry: repositories.saveWorkoutEntry,
  deleteWorkoutEntry: repositories.deleteWorkoutEntry,
}));
vi.mock("@/lib/grocery-repository", () => ({
  replaceGroceryList: repositories.replaceGroceryList,
}));
vi.mock("@/lib/body-log-repository", () => ({
  saveBodyLogEntry: repositories.saveBodyLogEntry,
}));

describe("Coach mutation persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T18:00:00.000Z"));
    Object.values(repositories).forEach((mock) => mock.mockReset().mockResolvedValue([]));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes meals, workouts, and normalized groceries to user-owned repositories", async () => {
    const supabase = {} as never;
    const meal = {
      id: crypto.randomUUID(),
      mealType: "lunch" as const,
      name: "Lunch",
      loggedAt: "2026-07-12T12:00:00.000Z",
      items: [],
    };
    const workout = {
      id: crypto.randomUUID(),
      name: "Walk",
      category: "cardio",
      durationMin: 20,
      loggedAt: "2026-07-12T13:00:00.000Z",
    };

    await persistCoachMutations(supabase, "user-1", [
      { kind: "add_meal", meal },
      { kind: "add_workout", workout },
      {
        kind: "set_grocery",
        items: [{ id: crypto.randomUUID(), name: "five bananas", checked: false }],
      },
      {
        kind: "add_body_log",
        entry: { date: "2026-07-12", weightKg: 80 },
      },
    ]);

    expect(repositories.saveMeal).toHaveBeenCalledWith(supabase, "user-1", "2026-07-12", meal);
    expect(repositories.saveWorkoutEntry).toHaveBeenCalledWith(
      supabase,
      "user-1",
      "2026-07-12",
      workout,
    );
    expect(repositories.replaceGroceryList).toHaveBeenCalledWith(
      supabase,
      "user-1",
      "2026-07-12",
      [expect.objectContaining({ name: "Bananas", amount: "5", source: "Coach" })],
    );
    expect(repositories.saveBodyLogEntry).toHaveBeenCalledWith(
      supabase,
      "user-1",
      expect.stringMatching(/^[0-9a-f-]{36}$/i),
      { date: "2026-07-12", weightKg: 80 },
    );
  });

  it("propagates repository failures instead of claiming a write succeeded", async () => {
    repositories.saveWorkoutEntry.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(persistCoachMutations({} as never, "user-1", [{
      kind: "add_workout",
      workout: {
        id: crypto.randomUUID(),
        name: "Run",
        category: "cardio",
        durationMin: 30,
        loggedAt: "2026-07-12T13:00:00.000Z",
      },
    }])).rejects.toThrow("database unavailable");
  });
});
