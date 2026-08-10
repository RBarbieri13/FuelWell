import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

/**
 * Rich-inline artifact rendering gate. Deterministic (no provider call):
 * /api/coach/turn is stubbed with route.fulfill SSE frames carrying one
 * artifact from each family — trend charts (weight_trend, macro_history,
 * goal_progress), recipe card, workout card, and day-summary tile — and the
 * transcript must mount the real components at desktop (1280x800) and iOS
 * (390x844) viewports with zero console errors.
 */

const EVIDENCE_DIR = ".loop/coach-engine-graph/evidence";

const ARTIFACTS = [
  {
    id: "ri-weight",
    type: "weight_trend",
    series: [
      { date: "2026-07-15", weightKg: 82.0 },
      { date: "2026-07-17", weightKg: 81.6 },
      { date: "2026-07-19", weightKg: 81.2 },
      { date: "2026-07-21", weightKg: 80.9 },
    ],
    delta: -1.1,
    insufficient: false,
  },
  {
    id: "ri-macro",
    type: "macro_history",
    window: "7 days",
    series: [
      { date: "2026-07-19", calories: 2050, protein: 150, carbs: 210, fat: 68, source: "logged" },
      { date: "2026-07-20", calories: 1980, protein: 145, carbs: 200, fat: 65, source: "logged" },
      { date: "2026-07-21", calories: 2110, protein: 155, carbs: 215, fat: 70, source: "logged" },
    ],
  },
  {
    id: "ri-goal",
    type: "goal_progress",
    goalPlan: { primaryGoal: "lose fat", trainingPriority: "strength" },
    remaining: { calories: 820, protein: 62, carbs: 90, fat: 28 },
    guidance: {
      headline: "On pace for the week.",
      nextMeal: "Aim for 40g protein at dinner.",
      sourceNote: "Based on your logged meals today.",
    },
    dataSources: ["day_log"],
  },
  {
    id: "ri-recipe",
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
  },
  {
    id: "ri-workout",
    type: "workout_plan",
    planId: "p1",
    focus: "upper_body",
    durationMin: 45,
    exercises: [
      { name: "Bench press", sets: 4, reps: 8, restSec: 90 },
      { name: "Row", sets: 4, reps: 10, restSec: 90 },
    ],
  },
  {
    id: "ri-recap",
    type: "daily_recap",
    totals: { calories: 1650, protein: 128, carbs: 160, fat: 55 },
    targets: { calories: 2100, protein: 160, carbs: 220, fat: 70 },
    mealCount: 3,
    workoutCount: 1,
    highlights: ["Protein pacing ahead of target"],
    nextMove: "Plan a 450 kcal dinner",
  },
] as const;

function sseBody(): string {
  const events: unknown[] = [
    { type: "text_delta", text: "Here is your weight trend and today's picture." },
    ...ARTIFACTS.map((artifact) => ({ type: "artifact", toolName: "stub", artifact })),
    {
      type: "turn_done",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        costUsdCents: 0,
        model: "playwright-deterministic-fixture",
      },
    },
  ];
  return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function openStubbedCoach(page: Page) {
  await page.route("**/api/coach/history", (route) => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ signedIn: false, conversationId: null, messages: [] }),
    });
  });
  await page.route("**/api/coach/turn", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      headers: { "cache-control": "no-cache" },
      body: sseBody(),
    })
  );
  await page.addInitScript(() => localStorage.removeItem("fuelwell-coach-chat-v1:preview"));
  await page.goto("/app/coach");
  await expect(page.getByLabel("Message Coach")).toBeVisible();
}

async function runRichInlineTurn(page: Page, screenshotName: string) {
  const errors = collectConsoleErrors(page);

  const input = page.getByLabel("Message Coach");
  await input.fill("show my weight trend");
  await page.getByRole("button", { name: "Send" }).click();

  // Target e2e: the chart component mounts in-transcript.
  await expect(page.getByTestId("artifact-weight_trend").first()).toBeVisible();

  // The newest artifact is mirrored into the action drawer; close it so all
  // six inline cards are visible in the transcript.
  const closeDrawer = page.getByRole("button", { name: "Close coach action panel" });
  if (await closeDrawer.isVisible().catch(() => false)) await closeDrawer.click();

  for (const artifact of ARTIFACTS) {
    await expect(page.getByTestId(`artifact-${artifact.type}`).first()).toBeVisible();
  }

  // Charts are component-rendered SVG, not ASCII/markdown tables.
  await expect(page.getByTestId("artifact-weight_trend").locator("svg polyline")).toBeVisible();
  await expect(page.getByTestId("artifact-macro_history").locator("svg rect").first()).toBeVisible();
  await expect(page.getByTestId("artifact-recipe_detail").getByText("Chicken Grain Bowl")).toBeVisible();
  await expect(
    page.getByTestId("artifact-workout_plan").getByRole("button", { name: /start .*workout/i })
  ).toBeVisible();
  await expect(page.getByTestId("artifact-daily_recap").getByText("Daily recap")).toBeVisible();

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(
    overflow.document,
    `document width ${overflow.document}px exceeds viewport ${overflow.viewport}px`
  ).toBeLessThanOrEqual(overflow.viewport + 1);

  // Evidence: capture with the weight-trend chart (the target e2e artifact)
  // scrolled into view — the transcript auto-scrolls to the newest card.
  await page.getByTestId("artifact-weight_trend").first().scrollIntoViewIfNeeded();
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: `${EVIDENCE_DIR}/${screenshotName}`, fullPage: true });

  expect(errors, `console errors: ${JSON.stringify(errors)}`).toEqual([]);
}

test("rich inline artifacts render at desktop 1280x800 with zero console errors", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openStubbedCoach(page);
  await runRichInlineTurn(page, "rich-inline-desktop.png");
});

test("rich inline artifacts render at iOS 390x844 with zero console errors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStubbedCoach(page);
  await runRichInlineTurn(page, "rich-inline-mobile.png");
});
