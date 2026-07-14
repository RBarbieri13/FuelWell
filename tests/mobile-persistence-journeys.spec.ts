import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";

type Journey = {
  round: number;
  kind: "new" | "existing";
  name: string;
  activity: string;
};

const LIVE_COACH = process.env.FUELWELL_RUN_LIVE_COACH_BENCHMARK === "1";

type GeneralQuestion = {
  id: string;
  prompt: string;
  verify: (answer: string) => void;
};

const GENERAL_QUESTIONS: GeneralQuestion[] = [
  {
    id: "activity-guideline",
    prompt:
      "Search online and use the current HHS Physical Activity Guidelines to give the full weekly moderate-intensity aerobic range and the weekly muscle-strengthening target for a healthy adult. Include both numeric targets and name HHS in the final answer.",
    verify(answer) {
      expect(answer).toMatch(/150[\s\S]{0,100}300/i);
      expect(answer).toMatch(/2(?:\s+or\s+more)?\s*(?:days?|times?)/i);
      expect(answer).toMatch(/HHS|Health and Human Services|Physical Activity Guidelines/i);
    },
  },
  {
    id: "sodium-limit",
    prompt:
      "Search online and use the 2020–2025 Dietary Guidelines for Americans to state the daily sodium limit for adults and teens age 14 and older. Include the amount, unit, age threshold, and source organization.",
    verify(answer) {
      expect(answer).toMatch(/2[,]?300\s*(?:mg|milligrams?)/i);
      expect(answer).toMatch(/14/i);
      expect(answer).toMatch(/Dietary Guidelines|USDA|HHS|Health and Human Services/i);
    },
  },
  {
    id: "myplate",
    prompt:
      "Search online and use USDA MyPlate guidance to state how much of a plate should be fruits and vegetables. Name both food groups and the source organization.",
    verify(answer) {
      expect(answer).toMatch(/half|one[-\s]?half|50\s*%/i);
      expect(answer).toMatch(/fruit/i);
      expect(answer).toMatch(/vegetable/i);
      expect(answer).toMatch(/MyPlate|USDA|Department of Agriculture/i);
    },
  },
  {
    id: "weight-loss-rate",
    prompt:
      "Search online and use the CDC healthy-weight guidance to state the weekly rate of weight loss described as gradual and sustainable. Name CDC in the final answer and avoid individualized medical advice.",
    verify(answer) {
      expect(answer).toMatch(/1[\s\S]{0,20}2\s*(?:lb|pounds?)/i);
      expect(answer).toMatch(/week/i);
      expect(answer).toMatch(/CDC|Centers for Disease Control/i);
    },
  },
  {
    id: "added-sugars",
    prompt:
      "Search online and use the 2020–2025 Dietary Guidelines for Americans added-sugars guidance to state what percentage of daily calories should come from added sugars. For a 2,000-calorie pattern, explicitly calculate and state both the calorie equivalent and gram equivalent, then name the source organization.",
    verify(answer) {
      expect(answer).toMatch(/(?:less than|under|below|<)\s*10\s*(?:%|percent)/i);
      expect(answer).toMatch(/200\s*(?:kcal|calories)/i);
      expect(answer).toMatch(/50\s*(?:g|grams?)/i);
      expect(answer).toMatch(/Dietary Guidelines|USDA|HHS/i);
    },
  },
];

const JOURNEYS: Journey[] = [
  { round: 1, kind: "new", name: "Riley One", activity: "Walking" },
  { round: 1, kind: "existing", name: "Alex One", activity: "Running" },
  { round: 2, kind: "new", name: "Riley Two", activity: "Hiking" },
  { round: 2, kind: "existing", name: "Alex Two", activity: "Biking" },
  { round: 3, kind: "new", name: "Riley Three", activity: "Swimming" },
  { round: 3, kind: "existing", name: "Alex Three", activity: "Rowing" },
];

function coachResponse(index: number) {
  return [
    { type: "text_delta", text: `Verified journey response ${index + 1}.` },
    {
      type: "turn_done",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        costUsdCents: 0,
        model: "playwright-journey-fixture",
      },
    },
  ]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");
}

async function assertPhoneFit(page: Page, state: string) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, `${state}: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.body, `${state}: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(dimensions.viewport);
}

async function completeOnboarding(page: Page, journey: Journey) {
  await page.goto("/signup?preview=new-user");
  const email = page.getByLabel("Email");
  const password = page.getByLabel("Password");
  await expect(email).toHaveValue("newuser@fuelwell.preview");
  await expect(password).toHaveValue("PreviewPass123!");
  await email.fill(`fuelwell-${journey.round}-${journey.kind}@example.test`);
  await password.fill("PreviewPass123!");
  await page.getByRole("button", { name: "Create preview account" }).click();
  await expect(page).toHaveURL(/\/app\/onboarding/, { timeout: 15_000 });

  await page.getByRole("button", { name: "Start setup" }).click();
  await page.getByPlaceholder("Maya").fill(journey.name);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Month").selectOption({ label: "May" });
  await page.getByLabel("Day").selectOption("15");
  await page.getByLabel("Year").selectOption("1990");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Male/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Height (ft)").fill("5");
  await page.getByLabel("Height (in)").fill("10");
  await page.getByLabel("Weight (lb)").fill("175");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Moderate/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Maintain/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Steady/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Maintain/ }).click();
  await page.getByRole("button", { name: /^Balanced/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^No preference/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Mediterranean/ }).click();
  await page.getByRole("button", { name: /^High-protein bowls/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Foods you love").fill("salmon, berries, oats");
  await page.getByLabel("Foods you avoid or dislike").fill("mushrooms");
  await page.getByRole("button", { name: /^Moderate/ }).click();
  await page.getByRole("button", { name: /^Mix of both/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^None/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Strength/ }).click();
  await page.getByRole("button", { name: /^Cardio/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Weightlifting/ }).click();
  await page.getByRole("button", { name: /^Hiking/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /^Gym \+ home/ }).click();
  await page.getByRole("button", { name: /^Only when useful/ }).click();
  await page.getByRole("button", { name: /^Data first/ }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Complete preview setup" }).click();
  await expect(page.getByText(/You're (set|all set)/).first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Open your dashboard" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 30_000 });
  await expect(
    page.getByText("Setup complete — your plan and targets are live.")
  ).toBeVisible();
  await expect(page.getByText(journey.name).first()).toBeVisible();

  // The quiz identity must propagate beyond the dashboard (regression: name
  // previously stayed "Alex Preview" on profile).
  await page.goto("/app/profile");
  await expect(page.getByRole("heading", { name: journey.name }).first()).toBeVisible();
  await page.goto("/app/dashboard");
}

async function logMeal(page: Page, mealType: string, name: string, offset: number) {
  await page.getByRole("button", { name: mealType, exact: true }).click();
  await page.getByRole("button", { name: "Add your own meal" }).click();
  await page.getByLabel("Meal name").fill(name);
  const form = page.getByRole("button", { name: `Add to ${mealType}` }).locator("xpath=ancestor::div[1]");
  const macros = form.getByRole("spinbutton");
  await macros.nth(0).fill(`${350 + offset}`);
  await macros.nth(1).fill(`${25 + offset}`);
  await macros.nth(2).fill(`${40 + offset}`);
  await macros.nth(3).fill(`${10 + offset}`);
  await page.getByRole("button", { name: `Add to ${mealType}` }).click();
  await expect(page.getByText(name).first()).toBeVisible();
  await page.getByRole("button", { name: "Close ingredient drawer" }).click();
}

async function runJourney(page: Page, journey: Journey, testInfo: TestInfo) {
  test.setTimeout(LIVE_COACH ? 720_000 : 180_000);
  await page.setViewportSize({ width: 375, height: 844 });
  const prefix = `${journey.kind}-${journey.round}`;
  const mealNames = [`${prefix} breakfast`, `${prefix} lunch`, `${prefix} dinner`];

  if (journey.kind === "new") {
    await completeOnboarding(page, journey);
  } else {
    await page.goto("/app/dashboard");
    await expect(page.getByText("Today's decision")).toBeVisible();
  }
  await assertPhoneFit(page, `${prefix} dashboard`);

  await page.goto("/app/log");
  await logMeal(page, "Breakfast", mealNames[0], journey.round);
  await logMeal(page, "Lunch", mealNames[1], journey.round + 1);
  await logMeal(page, "Dinner", mealNames[2], journey.round + 2);
  await page.reload();
  for (const meal of mealNames) await expect(page.getByText(meal).first()).toBeVisible();
  await assertPhoneFit(page, `${prefix} meals`);

  await page.goto("/app/workouts");
  await page.getByRole("button", { name: "Log activity" }).click();
  const planner = page.locator("#custom-activity-planner");
  await planner.getByLabel("Activity type").selectOption({ label: journey.activity });
  const activityMinutes = 24 + journey.round;
  await planner.getByLabel("Minutes").fill(`${activityMinutes}`);
  await planner.getByRole("button", { name: "Add activity" }).click();
  await expect(page.getByTestId("logged-workouts").getByText(journey.activity).first()).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("logged-workouts").getByText(journey.activity).first()).toBeVisible();
  await assertPhoneFit(page, `${prefix} workout`);

  await page.goto("/app/recipes");
  await page.getByLabel("Search title, ingredients, or tags").fill("salmon rice plate");
  await page.getByRole("button", { name: "Open recipe" }).first().click();
  const recipe = page.getByRole("dialog", { name: "Salmon rice plate" });
  await recipe.getByRole("button", { name: "Plan this meal" }).click();
  await recipe.getByRole("button", { name: "Add ingredients" }).click();
  await expect(recipe.getByRole("status")).toContainText(/Groceries|already/);
  await assertPhoneFit(page, `${prefix} recipe`);

  await page.goto("/app/grocery-list");
  await expect(page.getByLabel("Edit item name for Soy Ginger Glaze").first()).toBeVisible();
  await expect(page.getByText("Recipe: Salmon rice plate").first()).toBeVisible();
  await assertPhoneFit(page, `${prefix} groceries`);

  const snapshots: Array<Record<string, unknown>> = [];
  let responseIndex = 0;
  await page.route("**/api/coach/history", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ signedIn: false, conversationId: null, messages: [] }),
    })
  );
  if (LIVE_COACH) {
    page.on("request", (request) => {
      if (!request.url().includes("/api/coach/turn") || request.method() !== "POST") return;
      try {
        const body = request.postDataJSON() as { snapshot?: Record<string, unknown> };
        if (body.snapshot) snapshots.push(body.snapshot);
      } catch {
        // The assertion below fails closed when no request snapshot is captured.
      }
    });
  } else {
    await page.route("**/api/coach/turn", async (route) => {
      const body = route.request().postDataJSON() as { snapshot: Record<string, unknown> };
      snapshots.push(body.snapshot);
      const bodyText = coachResponse(responseIndex++);
      await route.fulfill({ status: 200, contentType: "text/event-stream", body: bodyText });
    });
  }
  await page.goto("/app/coach");
  const generalOffset = (journey.round * 2 + (journey.kind === "existing" ? 1 : 0)) % GENERAL_QUESTIONS.length;
  const selectedGeneral = Array.from({ length: 3 }, (_, index) =>
    GENERAL_QUESTIONS[(generalOffset + index) % GENERAL_QUESTIONS.length]
  );
  const questions = [
    {
      id: "app-nutrition",
      prompt:
        "Using only my current FuelWell app data, state my exact calories and protein logged today and name every meal currently logged today. Do not estimate or omit any meal.",
    },
    {
      id: "app-workout",
      prompt:
        "Using only my current FuelWell app data, state the exact activity I logged today and its exact duration in minutes. Do not estimate.",
    },
    ...selectedGeneral,
  ];
  const liveAnswers: Array<{ id: string; prompt: string; answer: string }> = [];

  for (let index = 0; index < questions.length; index += 1) {
    const beforeCount = await page.getByTestId("coach-assistant-message").count();
    const turnResponsePromise = LIVE_COACH
      ? page.waitForResponse(
          (response) =>
            response.url().includes("/api/coach/turn") &&
            response.request().method() === "POST",
          { timeout: 120_000 },
        )
      : null;
    await page.getByLabel("Message Coach").fill(questions[index].prompt);
    await page.getByRole("button", { name: "Send" }).click();
    if (!LIVE_COACH) {
      await expect(page.getByText(`Verified journey response ${index + 1}.`)).toBeVisible();
      continue;
    }

    const turnResponse = await turnResponsePromise!;
    expect(turnResponse.ok(), `${prefix}: Coach returned HTTP ${turnResponse.status()}`).toBe(true);
    const turnEvents = await turnResponse.text();
    expect(turnEvents).toContain('"type":"turn_done"');
    expect(turnEvents).not.toMatch(/deterministic-provider-fallback|Something broke|credit balance/i);

    await expect(page.getByTestId("coach-assistant-message")).toHaveCount(beforeCount + 1, {
      timeout: 120_000,
    });
    const answerNode = page.getByTestId("coach-assistant-message").last();
    await expect
      .poll(async () => (await answerNode.innerText()).trim().length, { timeout: 120_000 })
      .toBeGreaterThan(20);
    const answer = (await answerNode.innerText()).trim();
    expect(answer).not.toMatch(/temporarily unavailable|provider fallback|Something broke|credit balance/i);
    liveAnswers.push({ id: questions[index].id, prompt: questions[index].prompt, answer });

    const snapshot = snapshots.at(-1) as {
      totals?: { calories?: number; protein?: number };
      workouts?: Array<{ name?: string; durationMin?: number }>;
    } | undefined;
    expect(snapshot, `${prefix}: Coach request snapshot was not captured`).toBeTruthy();
    if (questions[index].id === "app-nutrition") {
      const calories = snapshot?.totals?.calories;
      const protein = snapshot?.totals?.protein;
      expect(calories).toBeGreaterThan(0);
      expect(protein).toBeGreaterThan(0);
      expect(answer.replaceAll(",", "")).toContain(String(calories));
      expect(answer).toMatch(new RegExp(`${protein}\\s*g`, "i"));
      for (const meal of mealNames) expect(answer.toLowerCase()).toContain(meal.toLowerCase());
      expect(answer.toLowerCase()).toContain("salmon rice plate");
    } else if (questions[index].id === "app-workout") {
      expect(answer.toLowerCase()).toContain(journey.activity.toLowerCase());
      expect(answer).toMatch(new RegExp(`\\b${activityMinutes}\\s*(?:minutes?|min)\\b`, "i"));
      const workout = snapshot?.workouts?.find((item) => item.name === journey.activity);
      expect(workout?.durationMin).toBe(activityMinutes);
    } else {
      selectedGeneral.find((question) => question.id === questions[index].id)?.verify(answer);
    }
  }
  expect(snapshots).toHaveLength(5);
  const snapshotText = JSON.stringify(snapshots.at(-1));
  for (const meal of mealNames) expect(snapshotText).toContain(meal);
  expect(snapshotText).toContain(journey.activity);
  expect(snapshotText).toContain("Soy Ginger Glaze");
  await assertPhoneFit(page, `${prefix} coach`);
  if (LIVE_COACH) {
    await writeFile(
      testInfo.outputPath(`${prefix}-live-coach-answers.json`),
      JSON.stringify(liveAnswers, null, 2),
    );
    await testInfo.attach(`${prefix}-live-coach-answers`, {
      body: JSON.stringify(liveAnswers, null, 2),
      contentType: "application/json",
    });
    await page.screenshot({
      path: testInfo.outputPath(`${prefix}-coach-live.png`),
      fullPage: true,
    });
  }

  await page.goto("/app/daily-review");
  for (const meal of mealNames) await expect(page.getByText(meal).first()).toBeVisible();
  await expect(page.getByText(journey.activity).last()).toBeVisible();
  await page.reload();
  for (const meal of mealNames) await expect(page.getByText(meal).first()).toBeVisible();
  await expect(page.getByText(journey.activity).last()).toBeVisible();
  await assertPhoneFit(page, `${prefix} review`);
  await page.screenshot({
    path: testInfo.outputPath(`${prefix}-review.png`),
    fullPage: true,
  });
}

test.describe("three consecutive FuelWell phone journeys", () => {
  test.describe.configure({ mode: "serial" });
  for (const journey of JOURNEYS) {
    test(`round ${journey.round} ${journey.kind} user persists through Review`, async ({ page }, testInfo) => {
      await runJourney(page, journey, testInfo);
    });
  }
});
