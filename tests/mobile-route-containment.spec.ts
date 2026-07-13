import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [320, 375, 390, 430] as const;
const ROUTES = [
  "/app/dashboard",
  "/app/daily-review",
  "/app/log",
  "/app/coach",
  "/app/workouts",
  "/app/fitness",
  "/app/recipes",
  "/app/grocery-list",
  "/app/recovery",
  "/app/progress",
  "/app/profile",
  "/app/settings",
  "/app/onboarding",
  "/app/activity",
  "/app/nutrition",
  "/app/meal-plan",
  "/app/dashboard/score",
  "/app/coach/attachments",
  "/app/coach/menu-review",
  "/app/workouts/low-impact-strength",
  "/app/workouts/low-impact-strength/live",
] as const;

async function overflowReport(page: Page) {
  return page.evaluate(() => {
    const primary = Array.from(
      document.querySelectorAll<HTMLElement>("main, .fw-app-surface, .fw-page-inner")
    );
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      primaryOverflow: primary
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => ({
          tag: element.tagName,
          className: element.className,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        })),
    };
  });
}

test.describe("FuelWell phone route containment", () => {
  for (const width of WIDTHS) {
    test(`${width}px contains every primary route`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);
      for (const route of ROUTES) {
        const routePage = await page.context().newPage();
        await routePage.setViewportSize({ width, height: 844 });
        await routePage.goto(route, { waitUntil: "domcontentloaded" });
        if (new URL(routePage.url()).pathname === "/login") {
          const email = process.env.FUELWELL_UI_TEST_EMAIL;
          const password = process.env.FUELWELL_UI_TEST_PASSWORD;
          expect(email, "FUELWELL_UI_TEST_EMAIL is required for an authenticated candidate.").toBeTruthy();
          expect(password, "FUELWELL_UI_TEST_PASSWORD is required for an authenticated candidate.").toBeTruthy();
          await routePage.getByLabel("Email").fill(email!);
          await routePage.getByLabel("Password").fill(password!);
          await routePage.getByRole("button", { name: "Sign in" }).click();
          await routePage.goto(route, { waitUntil: "domcontentloaded" });
        }
        expect(new URL(routePage.url()).pathname).toBe(route);
        await expect(routePage.locator("main").first()).toBeVisible();

        const report = await overflowReport(routePage);
        expect(report.documentWidth, JSON.stringify(report)).toBeLessThanOrEqual(width);
        expect(report.bodyWidth, JSON.stringify(report)).toBeLessThanOrEqual(width);
        expect(report.primaryOverflow, JSON.stringify(report)).toEqual([]);

        await routePage.screenshot({
          path: testInfo.outputPath(`${width}-${route.replaceAll("/", "-").slice(1)}.png`),
          fullPage: false,
        });
        await routePage.close();
      }
    });
  }
});
