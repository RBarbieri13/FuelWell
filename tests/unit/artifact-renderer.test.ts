import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArtifactRenderer } from "@/components/coach/artifacts";
import type { ArtifactSpec } from "@/lib/coach/types";

/**
 * Rich-inline artifact envelope rendering. Each of the four artifact
 * families (trend charts, recipe cards, workout cards, day-summary tiles)
 * must render a real component from its tool-emitted payload — never a
 * markdown/ASCII fallback. Rendered server-side (node env), which is the
 * same envelope the SSE transport delivers to the transcript.
 */

const noop = () => {};

function render(artifact: ArtifactSpec) {
  return renderToStaticMarkup(createElement(ArtifactRenderer, { artifact, onAction: noop }));
}

describe("ArtifactRenderer envelope", () => {
  it("renders weight_trend as an SVG chart with delta badge", () => {
    const html = render({
      id: "a1",
      type: "weight_trend",
      series: [
        { date: "2026-07-15", weightKg: 82.0 },
        { date: "2026-07-18", weightKg: 81.4 },
        { date: "2026-07-21", weightKg: 80.9 },
      ],
      delta: -1.1,
      insufficient: false,
    } as ArtifactSpec);
    expect(html).toContain("<svg");
    expect(html).toContain("polyline");
    expect(html).toContain("Weight");
    // Theme token, not a one-off hex color.
    expect(html).toContain("var(--color-primary-500)");
    expect(html).not.toMatch(/stroke="#/);
  });

  it("renders weight_trend insufficient state without a chart", () => {
    const html = render({
      id: "a1b",
      type: "weight_trend",
      series: [],
      delta: null,
      insufficient: true,
    } as ArtifactSpec);
    expect(html).toContain("Not enough weigh-ins");
    expect(html).not.toContain("polyline");
  });

  it("renders macro_history as stacked SVG bars using macro theme tokens", () => {
    const html = render({
      id: "a2",
      type: "macro_history",
      window: "7 days",
      series: [
        { date: "2026-07-20", calories: 2050, protein: 150, carbs: 210, fat: 68, source: "logged" },
        { date: "2026-07-21", calories: 1980, protein: 145, carbs: 200, fat: 65, source: "logged" },
      ],
    } as ArtifactSpec);
    expect(html).toContain("<svg");
    expect(html).toContain("Macro history");
    expect(html).toContain("var(--color-macro-protein)");
    expect(html).toContain("var(--color-macro-carbs)");
    expect(html).toContain("var(--color-macro-fat)");
  });

  it("renders goal_progress with remaining macros", () => {
    const html = render({
      id: "a3",
      type: "goal_progress",
      goalPlan: { primaryGoal: "lose fat", trainingPriority: "strength" },
      remaining: { calories: 820, protein: 62, carbs: 90, fat: 28 },
      guidance: {
        headline: "On pace for the week.",
        nextMeal: "Aim for 40g protein at dinner.",
        sourceNote: "Based on your logged meals today.",
      },
      dataSources: ["day_log"],
    } as ArtifactSpec);
    expect(html).toContain("Active goal");
    expect(html).toContain("820");
    expect(html).toContain("62g");
    expect(html).toContain("Aim for 40g protein at dinner.");
  });

  it("renders recipe_detail as a card with macros, ingredients, and actions", () => {
    const html = render({
      id: "a4",
      type: "recipe_detail",
      recipe: {
        id: "r1",
        title: "Chicken Grain Bowl",
        meal: "lunch",
        minutes: 25,
        servings: 2,
        perServing: { calories: 540, protein: 44, carbs: 52, fat: 16, fiber: 8 },
        ingredients: [
          { item: "Chicken thighs", amount: "300 g" },
          { item: "Farro", amount: "150 g" },
        ],
        steps: ["Cook farro.", "Sear chicken.", "Assemble bowl."],
        tags: ["high-protein"],
      },
    } as ArtifactSpec);
    expect(html).toContain("Chicken Grain Bowl");
    expect(html).toContain("540");
    expect(html).toContain("Ingredients (2)");
    expect(html).toContain("Log as meal");
    expect(html).toContain("Add to grocery list");
  });

  it("renders workout_plan as an ordered exercise card with a start action", () => {
    const html = render({
      id: "a5",
      type: "workout_plan",
      planId: "p1",
      focus: "upper_body",
      durationMin: 45,
      exercises: [
        { name: "Bench press", sets: 4, reps: 8, restSec: 90 },
        { name: "Row", sets: 4, reps: 10, restSec: 90 },
      ],
    } as ArtifactSpec);
    expect(html).toContain("upper body");
    expect(html).toContain("Bench press");
    expect(html).toContain("4x8");
    expect(html).toContain("Start workout");
  });

  it("renders daily_recap as a day-summary tile with macro progress bars", () => {
    const html = render({
      id: "a6",
      type: "daily_recap",
      totals: { calories: 1650, protein: 128, carbs: 160, fat: 55 },
      targets: { calories: 2100, protein: 160, carbs: 220, fat: 70 },
      mealCount: 3,
      workoutCount: 1,
      highlights: ["Protein pacing ahead of target"],
      nextMove: "Plan a 450 kcal dinner",
    } as ArtifactSpec);
    expect(html).toContain("Daily recap");
    expect(html).toContain("3 meals");
    expect(html).toContain("var(--color-macro-calories)");
    expect(html).toContain("Protein pacing ahead of target");
    expect(html).toContain("Plan a 450 kcal dinner");
  });

  it("falls back gracefully for unknown artifact types", () => {
    const html = render({ id: "a7", type: "not_a_real_type" } as ArtifactSpec);
    expect(html).toContain("Unsupported card");
    expect(html).toContain("not_a_real_type");
  });
});
