import { describe, expect, it } from "vitest";
import {
  buildDailyGoalContext,
  buildMealGoalImpact,
  buildPreviewGarminSummary,
} from "@/lib/goal-context";
import { makeSnapshot } from "./helpers";

describe("goal context", () => {
  it("adapts today's calorie and carb targets from Garmin activity context", () => {
    const snapshot = makeSnapshot();
    const garmin = buildPreviewGarminSummary(snapshot.date);
    const context = buildDailyGoalContext({
      date: snapshot.date,
      meals: snapshot.meals,
      totals: snapshot.totals,
      targets: snapshot.targets,
      profile: snapshot.profile,
      integration: garmin,
    });

    expect(context.targets.calories).toBeGreaterThan(snapshot.targets.calories);
    expect(context.targets.carbs).toBeGreaterThan(snapshot.targets.carbs);
    expect(context.dataSources).toContain("garmin");
    expect(context.guidance.sourceNote).toContain("Garmin preview sample");
  });

  it("keeps profile targets when no integration is connected", () => {
    const snapshot = makeSnapshot();
    const context = buildDailyGoalContext({
      date: snapshot.date,
      meals: snapshot.meals,
      totals: snapshot.totals,
      targets: snapshot.targets,
      profile: snapshot.profile,
    });

    expect(context.targets).toEqual(snapshot.targets);
    expect(context.dataSources).not.toContain("garmin");
  });

  it("builds a source-aware meal goal impact payload", () => {
    const snapshot = makeSnapshot();
    const impact = buildMealGoalImpact({
      totalsAfter: {
        calories: snapshot.totals.calories + 300,
        protein: snapshot.totals.protein + 30,
        carbs: snapshot.totals.carbs + 20,
        fat: snapshot.totals.fat + 10,
      },
      targets: snapshot.targets,
      confidence: "database",
      source: "database",
    });

    expect(impact.headline).toContain("kcal");
    expect(impact.confidence).toBe("database");
    expect(impact.sourceNote).toContain("FuelWell food database");
  });
});
