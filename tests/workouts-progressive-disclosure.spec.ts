import { expect, test } from "@playwright/test";

test("Workouts: keeps the library secondary while preserving its controls", async ({ page }) => {
  await page.goto("/app/workouts");

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

  await expect(page.getByRole("heading", { name: "Workout database" })).toBeVisible();
  await page.getByRole("button", { name: "Upper", exact: true }).click();
  await page.getByRole("button", { name: "Strength", exact: true }).click();
  await expect(page.getByText("Upper push base")).toBeVisible();
  await expect(page.getByRole("link", { name: /Preview Upper push base/i })).toBeVisible();
});

test("Workouts: opens the library for a direct filtered URL", async ({ page }) => {
  await page.goto("/app/workouts?body=upper&type=Strength");

  await expect(page.getByRole("heading", { name: "Workout database" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide workout library" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(page.getByText("Upper push base")).toBeVisible();
});
