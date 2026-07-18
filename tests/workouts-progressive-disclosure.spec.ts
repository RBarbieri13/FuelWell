import { expect, test } from "@playwright/test";
import { authenticateCandidate } from "./helpers/authenticate";

test("Workouts: keeps the library secondary while preserving its controls", async ({ page }) => {
  await authenticateCandidate(page, "/app/workouts");

  await expect(page.getByRole("heading", { name: "Coach recommends" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pick my own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workout database" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Customize with Coach" })).toHaveAttribute(
    "href",
    /\/app\/coach\?prompt=/
  );

  const libraryControl = page.getByRole("button", { name: "Browse workout library" });
  await expect(libraryControl).toHaveAttribute("aria-expanded", "false");
  await libraryControl.click();

  const libraryHeading = page.getByRole("heading", { name: "Workout database" });
  await expect(libraryHeading).toBeVisible();
  await expect(libraryHeading).toBeFocused();
  await page.getByRole("button", { name: "Upper", exact: true }).click();
  await page.getByRole("button", { name: "Strength", exact: true }).click();
  await expect(page.getByText("Upper push base")).toBeVisible();
  await expect(page.getByRole("link", { name: /Preview Upper push base/i })).toBeVisible();
});

test("Workouts: opens the library for a direct filtered URL", async ({ page }) => {
  await authenticateCandidate(page, "/app/workouts?body=upper&type=Strength");

  await expect(page.getByRole("heading", { name: "Workout database" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide workout library" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(page.getByText("Upper push base")).toBeVisible();
});

for (const width of [320, 375, 390, 430]) {
  test(`Workouts: mobile library stays compact and contained at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await authenticateCandidate(page, "/app/workouts");

    const pickCard = page.getByRole("heading", { name: "Pick my own" });
    const activityCard = page.getByRole("heading", { name: "Activity", exact: true });
    await expect(pickCard).toBeVisible();
    await expect(activityCard).toBeVisible();
    const pickBox = await pickCard.boundingBox();
    const activityBox = await activityCard.boundingBox();
    expect(pickBox).not.toBeNull();
    expect(activityBox).not.toBeNull();
    expect(Math.abs((pickBox?.y ?? 0) - (activityBox?.y ?? 0))).toBeLessThan(8);

    await page.getByRole("button", { name: "Log activity" }).click();
    await expect(page.getByRole("heading", { name: "Custom activity details" })).toBeVisible();
    await page.getByRole("button", { name: "Hide activity" }).click();
    await expect(page.getByRole("heading", { name: "Custom activity details" })).toHaveCount(0);

    await page.getByRole("button", { name: "Browse workout library" }).click();
    const libraryHeading = page.getByRole("heading", { name: "Workout database" });
    await expect(libraryHeading).toBeFocused();
    await expect
      .poll(async () => (await libraryHeading.boundingBox())?.y ?? Number.POSITIVE_INFINITY)
      .toBeLessThan(220);

    await expect(page.getByRole("combobox", { name: "Body part" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Workout length" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Intensity" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Workout type" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Smart filter" })).toBeVisible();

    const resultRows = page.locator("#workout-results-table tbody tr");
    await expect(resultRows).toHaveCount(20);
    await expect(page.getByText(/Page 1 of \d+ · Showing 1-20 of/)).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Body part" })).toBeHidden();

    const defaultTableGeometry = await page.getByTestId("workout-results-scroll").evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(defaultTableGeometry.scrollWidth).toBeLessThanOrEqual(defaultTableGeometry.clientWidth);

    await page.getByRole("button", { name: "Show all columns" }).click();
    await expect(page.getByRole("columnheader", { name: "Body part" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Essential only" })).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();

    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      tableClientWidth: document.querySelector<HTMLElement>("[data-testid='workout-results-scroll']")?.clientWidth ?? 0,
      tableScrollWidth: document.querySelector<HTMLElement>("[data-testid='workout-results-scroll']")?.scrollWidth ?? 0,
    }));
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.tableScrollWidth).toBeGreaterThan(geometry.tableClientWidth);

    await page.screenshot({
      path: testInfo.outputPath(`workouts-library-${width}.png`),
      fullPage: true,
    });
  });
}
