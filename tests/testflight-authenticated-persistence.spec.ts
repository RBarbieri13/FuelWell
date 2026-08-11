import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { authenticateCandidate } from "./helpers/authenticate";

const PERSISTENCE_TIMEOUT = 120_000;

type MealRecord = {
  id: string;
  name: string;
  mealType: string;
};

type WorkoutRecord = {
  id: string;
  name: string;
  durationMin: number;
};

type GroceryRecord = {
  id: string;
  name: string;
  amount: string;
};

type DayLogResponse = {
  signedIn: boolean;
  date: string;
  meals: MealRecord[];
};

type WorkoutLogResponse = {
  signedIn: boolean;
  date: string;
  workouts: WorkoutRecord[];
};

type GroceryResponse = {
  signedIn: boolean;
  date: string;
  items: GroceryRecord[];
};

function candidateBaseURL() {
  const value = process.env.FUELWELL_PLAYWRIGHT_BASE_URL;
  expect(value, "FUELWELL_PLAYWRIGHT_BASE_URL is required.").toBeTruthy();
  return value!;
}

function alphaToken(value = Date.now()) {
  let remaining = value;
  let token = "";
  while (remaining > 0) {
    token = String.fromCharCode(97 + (remaining % 26)) + token;
    remaining = Math.floor(remaining / 26);
  }
  return `${token.charAt(0).toUpperCase()}${token.slice(1)}`;
}

async function newPhoneSession(browser: Browser): Promise<{
  context: BrowserContext;
  page: Page;
}> {
  const context = await browser.newContext({
    baseURL: candidateBaseURL(),
    viewport: { width: 390, height: 844 },
  });
  return { context, page: await context.newPage() };
}

async function assertPhoneFit(page: Page, state: string) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, `${state}: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(
    dimensions.viewport,
  );
  expect(dimensions.body, `${state}: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(
    dimensions.viewport,
  );
}

async function addMealThroughUI(page: Page, mealType: string, name: string, offset: number) {
  await page.getByRole("button", { name: mealType, exact: true }).first().click();
  await page.getByRole("button", { name: "Add your own meal" }).click();
  await page.getByLabel("Meal name").fill(name);
  const addButton = page.getByRole("button", { name: `Add to ${mealType}` });
  const form = addButton.locator("xpath=ancestor::div[1]");
  const macros = form.getByRole("spinbutton");
  await macros.nth(0).fill(`${410 + offset}`);
  await macros.nth(1).fill(`${31 + offset}`);
  await macros.nth(2).fill(`${44 + offset}`);
  await macros.nth(3).fill(`${12 + offset}`);

  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/day-log") && response.request().method() === "POST",
    { timeout: PERSISTENCE_TIMEOUT },
  );
  await addButton.click();
  const response = await responsePromise;
  expect(response.status(), `Adding ${name} returned HTTP ${response.status()}`).toBe(200);
  const body = (await response.json()) as DayLogResponse;
  const savedName = `${name} (1 serving)`;
  const saved = body.meals.find((meal) => meal.name === savedName);
  expect(saved, `The persisted meal response omitted ${name}.`).toBeTruthy();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  const drawerTrigger = page.getByRole("button", { name: /Current meal \(\d+\)/ });
  await expect(drawerTrigger).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  await drawerTrigger.click();
  const drawer = page.getByRole("dialog", { name: "Ingredient drawer" });
  await expect(drawer).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  await drawer.getByRole("button", { name: "Close ingredient drawer" }).click();
  await expect(drawer).toHaveCount(0);
  return { date: body.date, meal: saved! };
}

async function addWorkoutThroughUI(page: Page, minutes: number) {
  await page.getByRole("button", { name: "Log activity" }).click();
  const planner = page.locator("#custom-activity-planner");
  await planner.getByLabel("Activity type").selectOption({ label: "Walking" });
  await planner.getByLabel("Minutes").fill(`${minutes}`);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/workout-log") && response.request().method() === "POST",
    { timeout: PERSISTENCE_TIMEOUT },
  );
  await planner.getByRole("button", { name: "Add activity" }).click();
  const response = await responsePromise;
  expect(response.status(), `Adding the workout returned HTTP ${response.status()}`).toBe(200);
  const body = (await response.json()) as WorkoutLogResponse;
  const saved = [...body.workouts]
    .reverse()
    .find((workout) => workout.name === "Walking" && workout.durationMin === minutes);
  expect(saved, "The persisted workout response omitted the new Walking activity.").toBeTruthy();
  await expect(
    page.getByTestId("logged-workouts").getByText("Walking").first(),
  ).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  return { date: body.date, workout: saved! };
}

async function addGroceryThroughUI(page: Page, name: string, amount: string) {
  const originalResponse = await page.request.get(`/api/grocery-list?date=${new Date().toISOString().slice(0, 10)}`);
  expect(originalResponse.status()).toBe(200);
  const original = (await originalResponse.json()) as GroceryResponse;
  expect(original.signedIn).toBe(true);

  await page.locator("#item-name").fill(name);
  await page.locator("#item-amount").fill(amount);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/grocery-list") && response.request().method() === "PUT",
    { timeout: PERSISTENCE_TIMEOUT },
  );
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  const response = await responsePromise;
  expect(response.status(), `Adding the grocery returned HTTP ${response.status()}`).toBe(200);
  const body = (await response.json()) as GroceryResponse;
  const saved = body.items.find((item) => item.name === name && item.amount === amount);
  expect(saved, `The persisted grocery response omitted ${name}.`).toBeTruthy();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  return { original, grocery: saved! };
}

async function waitForCompleteCoachAnswer(page: Page, previousAssistantCount: number) {
  const composer = page.getByLabel("Message Coach");
  const assistants = page.getByTestId("coach-assistant-message");
  await expect(assistants).toHaveCount(previousAssistantCount + 1, {
    timeout: PERSISTENCE_TIMEOUT,
  });
  const assistant = assistants.nth(previousAssistantCount);
  await expect(assistant).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
  await expect(composer).toBeEnabled({ timeout: PERSISTENCE_TIMEOUT });
  await expect
    .poll(() => assistant.innerText(), { timeout: PERSISTENCE_TIMEOUT })
    .toMatch(/[.!?]["')\]]?$/);
  return (await assistant.innerText()).trim();
}

test.describe("TestFlight authenticated persistence release gate", () => {
  test("profile, meals, workout, groceries, and Coach survive a fresh sign-in", async ({ browser }, testInfo: TestInfo) => {
    test.setTimeout(420_000);
    // Letter-only token survives both grocery title-casing and Coach privacy redaction.
    const token = alphaToken();
    const displayName = `Release Tester ${token}`;
    const mealNames = [
      `Persistence breakfast ${token}`,
      `Persistence lunch ${token}`,
      `Persistence dinner ${token}`,
    ];
    const groceryName = `Persistence Pears ${token.toUpperCase()}`;
    const groceryAmount = "3 pears";
    const workoutMinutes = 37;
    const question = [
      `Persistence audit ${token}. Using only my current FuelWell data,`,
      `name all three meals (${mealNames.join(", ")}),`,
      `confirm my ${workoutMinutes}-minute Walking activity, and confirm ${groceryName}.`,
      "Do not omit any requested value.",
    ].join(" ");

    let firstContext: BrowserContext | null = null;
    let secondContext: BrowserContext | null = null;
    let originalDisplayName = "";
    let dayDate = "";
    let workoutDate = "";
    let mealIds: string[] = [];
    let workoutId = "";
    let groceryId = "";
    let originalGroceries: GroceryResponse | null = null;

    try {
      const firstSession = await newPhoneSession(browser);
      firstContext = firstSession.context;
      const firstPage = firstSession.page;
      await authenticateCandidate(firstPage, "/app/profile");
      originalDisplayName = (await firstPage.locator("h2").first().innerText()).trim();

      await firstPage.getByRole("button", { name: "Edit name" }).click();
      await firstPage.getByPlaceholder("Your name").fill(displayName);
      await firstPage.getByRole("button", { name: "Save name" }).click();
      await expect(firstPage.getByRole("heading", { name: displayName }).first()).toBeVisible({
        timeout: PERSISTENCE_TIMEOUT,
      });
      await assertPhoneFit(firstPage, "profile after save");

      await firstPage.goto("/app/log");
      const breakfast = await addMealThroughUI(firstPage, "Breakfast", mealNames[0], 0);
      const lunch = await addMealThroughUI(firstPage, "Lunch", mealNames[1], 1);
      const dinner = await addMealThroughUI(firstPage, "Dinner", mealNames[2], 2);
      dayDate = breakfast.date;
      expect(lunch.date).toBe(dayDate);
      expect(dinner.date).toBe(dayDate);
      mealIds = [breakfast.meal.id, lunch.meal.id, dinner.meal.id];
      await assertPhoneFit(firstPage, "meal log after writes");

      await firstPage.goto("/app/workouts");
      const workoutResult = await addWorkoutThroughUI(firstPage, workoutMinutes);
      workoutDate = workoutResult.date;
      workoutId = workoutResult.workout.id;
      await assertPhoneFit(firstPage, "workout log after write");

      await firstPage.goto("/app/grocery-list");
      const groceryResult = await addGroceryThroughUI(firstPage, groceryName, groceryAmount);
      originalGroceries = groceryResult.original;
      groceryId = groceryResult.grocery.id;
      await assertPhoneFit(firstPage, "grocery list after write");

      await firstPage.goto("/app/coach");
      const initialHistoryResponse = await firstPage.request.get("/api/coach/history");
      expect(initialHistoryResponse.status(), "Coach history endpoint should remain authenticated").toBe(200);
      const initialHistory = (await initialHistoryResponse.json()) as {
        messages: Array<{ role: "user" | "assistant" }>;
      };
      const composer = firstPage.getByLabel("Message Coach");
      await expect(composer).toBeEnabled({ timeout: PERSISTENCE_TIMEOUT });
      const previousAssistantCount = initialHistory.messages.filter(
        (message) => message.role === "assistant",
      ).length;
      await expect(firstPage.getByTestId("coach-assistant-message")).toHaveCount(previousAssistantCount, {
        timeout: PERSISTENCE_TIMEOUT,
      });
      await composer.fill(question);
      const responsePromise = firstPage.waitForResponse(
        (response) => response.url().includes("/api/coach/turn") && response.request().method() === "POST",
        { timeout: PERSISTENCE_TIMEOUT },
      );
      await firstPage.getByRole("button", { name: "Send" }).click();
      const coachResponse = await responsePromise;
      expect(coachResponse.status(), `Coach returned HTTP ${coachResponse.status()}`).toBe(200);
      await coachResponse.finished();
      const coachAnswer = await waitForCompleteCoachAnswer(firstPage, previousAssistantCount);
      expect(coachAnswer).not.toMatch(/temporarily unavailable|provider fallback|credit balance|Something broke/i);
      for (const mealName of mealNames) expect(coachAnswer.toLowerCase()).toContain(mealName.toLowerCase());
      expect(coachAnswer).toMatch(new RegExp(`\\b${workoutMinutes}\\s*(?:minutes?|min)\\b`, "i"));
      expect(coachAnswer.toLowerCase()).toContain("walking");
      expect(coachAnswer.toLowerCase()).toContain(groceryName.toLowerCase());
      await firstPage.screenshot({
        path: testInfo.outputPath("authenticated-writes-and-coach.png"),
        fullPage: true,
      });
      await firstContext.close();
      firstContext = null;

      const secondSession = await newPhoneSession(browser);
      secondContext = secondSession.context;
      const secondPage = secondSession.page;
      await authenticateCandidate(secondPage, "/app/dashboard");
      await expect(secondPage.getByText(displayName).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });

      const dayLogResponse = await secondPage.request.get(`/api/day-log?date=${dayDate}`);
      expect(dayLogResponse.status()).toBe(200);
      const dayLog = (await dayLogResponse.json()) as DayLogResponse;
      expect(dayLog.signedIn).toBe(true);
      for (const mealId of mealIds) expect(dayLog.meals.some((meal) => meal.id === mealId)).toBe(true);

      await secondPage.goto("/app/log");
      for (const mealName of mealNames) {
        await expect(secondPage.getByText(mealName).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
      }

      const workoutResponse = await secondPage.request.get(`/api/workout-log?date=${workoutDate}`);
      expect(workoutResponse.status()).toBe(200);
      const workoutLog = (await workoutResponse.json()) as WorkoutLogResponse;
      expect(workoutLog.signedIn).toBe(true);
      expect(workoutLog.workouts.some((workout) => workout.id === workoutId)).toBe(true);

      await secondPage.goto("/app/workouts");
      await expect(secondPage.getByTestId("logged-workouts").getByText("Walking").first()).toBeVisible({
        timeout: PERSISTENCE_TIMEOUT,
      });

      const groceryResponse = await secondPage.request.get(`/api/grocery-list?date=${originalGroceries!.date}`);
      expect(groceryResponse.status()).toBe(200);
      const groceries = (await groceryResponse.json()) as GroceryResponse;
      expect(groceries.signedIn).toBe(true);
      const persistedGrocery = groceries.items.find(
        (item) => item.id === groceryId && item.name === groceryName && item.amount === groceryAmount,
      );
      expect(persistedGrocery).toBeTruthy();

      await secondPage.goto("/app/grocery-list");
      await expect(secondPage.getByText(groceryName).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });

      const historyResponse = await secondPage.request.get("/api/coach/history");
      expect(historyResponse.status()).toBe(200);
      const history = (await historyResponse.json()) as {
        signedIn: boolean;
        messages: Array<{ content?: string; text?: string }>;
      };
      expect(history.signedIn).toBe(true);
      expect(JSON.stringify(history.messages)).toContain(token);

      await secondPage.goto("/app/coach");
      await expect(secondPage.getByText(new RegExp(`Persistence audit ${token}`, "i")).first()).toBeVisible({
        timeout: PERSISTENCE_TIMEOUT,
      });
      await assertPhoneFit(secondPage, "Coach history after fresh sign-in");

      await secondPage.goto("/app/daily-review");
      for (const mealName of mealNames) {
        await expect(secondPage.getByText(mealName).first()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
      }
      await expect(secondPage.getByText("Walking").last()).toBeVisible({ timeout: PERSISTENCE_TIMEOUT });
      await assertPhoneFit(secondPage, "Daily Review after fresh sign-in");
      await secondPage.screenshot({
        path: testInfo.outputPath("fresh-session-persistence.png"),
        fullPage: true,
      });

      await writeFile(
        testInfo.outputPath("authenticated-persistence-evidence.json"),
        JSON.stringify(
          {
            token,
            displayName,
            mealNames,
            mealIds,
            workout: { id: workoutId, name: "Walking", durationMin: workoutMinutes },
            grocery: { id: groceryId, ...persistedGrocery },
            coachHistoryRestored: true,
            freshContext: true,
          },
          null,
          2,
        ),
      );
    } finally {
      const cleanupPage = secondContext
        ? secondContext.pages()[0]
        : firstContext
          ? firstContext.pages()[0]
          : null;
      if (cleanupPage) {
        for (const mealId of mealIds) {
          await cleanupPage.request.delete("/api/day-log", {
            data: { date: dayDate, mealId },
          }).catch(() => null);
        }
        if (workoutId) {
          await cleanupPage.request.delete("/api/workout-log", {
            data: { date: workoutDate, workoutId },
          }).catch(() => null);
        }
        if (originalGroceries) {
          await cleanupPage.request.put("/api/grocery-list", {
            data: { date: originalGroceries.date, items: originalGroceries.items },
          }).catch(() => null);
        }
        if (originalDisplayName) {
          await cleanupPage.goto("/app/profile").catch(() => null);
          await cleanupPage.getByRole("button", { name: "Edit name" }).click().catch(() => null);
          await cleanupPage.getByPlaceholder("Your name").fill(originalDisplayName).catch(() => null);
          await cleanupPage.getByRole("button", { name: "Save name" }).click().catch(() => null);
        }
      }
      await firstContext?.close().catch(() => null);
      await secondContext?.close().catch(() => null);
    }
  });
});
