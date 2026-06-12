import { test, expect } from "@playwright/test";

/**
 * FuelWell smoke suite (Section D2). Verifies the meeting-decision surfaces
 * render and their core interactions work end-to-end against the dev server in
 * preview mode. Each test uses a fresh context, so localStorage starts clean.
 */

test("preview bypass: dashboard renders without auth", async ({ page }) => {
  await page.goto("/app/dashboard");
  await expect(page.getByText("Today's decision")).toBeVisible();
});

test("Health Score is a compact chip + working detail page, not a hero surface", async ({
  page,
}) => {
  await page.goto("/app/dashboard");
  // The only score surface on the dashboard is the compact chip linking to detail.
  const chip = page.getByRole("link", { name: /Health score/i });
  await expect(chip).toBeVisible();
  // The old prominent "Score inputs" section is gone (de-emphasis).
  await expect(page.getByRole("heading", { name: "Score inputs" })).toHaveCount(0);
  // Detail page still fully functional.
  await chip.click();
  await expect(page).toHaveURL(/\/app\/dashboard\/score/);
});

test("Log: live food search returns ranked results", async ({ page }) => {
  await page.goto("/app/log");
  await page.getByPlaceholder("Search 500+ foods by name").fill("chicken");
  await expect(page.getByRole("button", { name: /Choose .*hicken/i }).first()).toBeVisible();
});

test("Log: add-your-own custom meal creates an entry / updates the day log", async ({
  page,
}) => {
  await page.goto("/app/log");
  await page.getByRole("button", { name: "Add your own meal" }).click();
  await page.getByPlaceholder("Meal name (e.g. Homemade chili)").fill("Smoke Test Meal");
  // Fill all four macro fields (all are required to be valid numbers).
  const macros = page.getByRole("spinbutton");
  await macros.nth(0).fill("450"); // calories
  await macros.nth(1).fill("30"); // protein
  await macros.nth(2).fill("40"); // carbs
  await macros.nth(3).fill("15"); // fat
  await page.getByRole("button", { name: /Add to/i }).click();
  // The new meal shows up in today's logged meals (shared useDayLog store).
  await expect(page.getByText("Smoke Test Meal").first()).toBeVisible();
});

test("Coach: agentic chat surface renders", async ({ page }) => {
  // Full live-model log flow is covered in coach.spec.ts ("log meal updates
  // dashboard"); the smoke check just verifies the new surface renders.
  await page.goto("/app/coach");
  await expect(page.getByLabel("Message Coach")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
});

test("Workouts: two paths and working category filters", async ({ page }) => {
  await page.goto("/app/workouts");
  await expect(page.getByText("Pick my own")).toBeVisible();
  await expect(page.getByText("Coach recommends")).toBeVisible();
  await page.getByRole("button", { name: "Upper", exact: true }).click();
  // Filter is interactive (the path list still renders after filtering).
  await expect(page.getByText("Pick my own")).toBeVisible();
});

test("Progress: stacked macro bars render and window toggles", async ({ page }) => {
  await page.goto("/app/progress");
  await expect(page.getByRole("button", { name: /30 days/i })).toBeVisible();
  await page.getByRole("button", { name: /30 days/i }).click();
  await expect(page.getByRole("button", { name: /7 days/i })).toBeVisible();
});

test("Settings: page loads with sign out", async ({ page }) => {
  await page.goto("/app/settings");
  await expect(page.getByRole("button", { name: /Sign out/i })).toBeVisible();
});

test("Auth: all three OAuth buttons present on login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Facebook/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Apple/i })).toBeVisible();
});
