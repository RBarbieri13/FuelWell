import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/forgot-password",
  "/app/dashboard",
  "/app/dashboard/score",
  "/app/daily-review",
  "/app/nutrition",
  "/app/meal-plan",
  "/app/progress",
  "/app/profile",
  "/app/launch-preflight",
  "/app/coach/attachments",
  "/app/coach/menu-review",
] as const;

const nestedInteractiveSelector = [
  "a[href] button",
  "a[href] a[href]",
  "a[href] input",
  "a[href] select",
  "a[href] textarea",
  'a[href] [tabindex]:not([tabindex="-1"])',
  "button a[href]",
].join(",");

test.describe("semantic navigation controls", () => {
  for (const route of routes) {
    test(`${route} has one interactive element per navigation action`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page.locator(nestedInteractiveSelector)).toHaveCount(0);
    });
  }
});
