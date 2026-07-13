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
    for (const route of ROUTES) {
      test(`${width}px ${route} contains its primary app panes`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await page.locator("main").count()).toBeGreaterThan(0);

        const report = await overflowReport(page);
        expect(report.documentWidth, JSON.stringify(report)).toBeLessThanOrEqual(width);
        expect(report.bodyWidth, JSON.stringify(report)).toBeLessThanOrEqual(width);
        expect(report.primaryOverflow, JSON.stringify(report)).toEqual([]);

        await page.screenshot({
          path: testInfo.outputPath(`${width}-${route.replaceAll("/", "-").slice(1)}.png`),
          fullPage: false,
        });
      });
    }
  }
});
