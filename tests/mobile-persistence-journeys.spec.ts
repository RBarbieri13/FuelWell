import { expect, test, type Page, type TestInfo } from "@playwright/test";

type Journey = {
  round: number;
  kind: "new" | "existing";
  name: string;
  activity: string;
};

const QUESTIONS = [
  "What weekly aerobic and strength activity should a healthy adult target?",
  "How much daily protein is commonly recommended for an athlete?",
  "What does creatine monohydrate improve?",
  "What rate of weight loss is considered gradual and sustainable?",
  "What percentage of daily calories should come from added sugars?",
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
  await page.locator('input[type="date"]').fill("1990-05-15");
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
  await page.getByRole("button", { name: /^Gym \+ home/ }).click();
  await page.getByRole("button", { name: /^Only when useful/ }).click();
  await page.getByRole("button", { name: /^Data first/ }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Complete preview setup" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 30_000 });
  await expect(page.getByText(journey.name).first()).toBeVisible();
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
  test.setTimeout(180_000);
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
  await planner.getByLabel("Minutes").fill(`${24 + journey.round}`);
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
  await page.route("**/api/coach/turn", async (route) => {
    const body = route.request().postDataJSON() as { snapshot: Record<string, unknown> };
    snapshots.push(body.snapshot);
    const bodyText = coachResponse(responseIndex++);
    await route.fulfill({ status: 200, contentType: "text/event-stream", body: bodyText });
  });
  await page.goto("/app/coach");
  for (let index = 0; index < QUESTIONS.length; index += 1) {
    await page.getByLabel("Message Coach").fill(QUESTIONS[index]);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(`Verified journey response ${index + 1}.`)).toBeVisible();
  }
  expect(snapshots).toHaveLength(5);
  const snapshotText = JSON.stringify(snapshots.at(-1));
  for (const meal of mealNames) expect(snapshotText).toContain(meal);
  expect(snapshotText).toContain(journey.activity);
  expect(snapshotText).toContain("Soy Ginger Glaze");
  await assertPhoneFit(page, `${prefix} coach`);

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
