import { expect, test } from "@playwright/test";

const PHONE_WIDTHS = [320, 375, 390, 430] as const;

test.describe("Daily Review energy ledger", () => {
  test("phone defaults keep the overview open and lower-priority sections collapsed", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/app/daily-review");

    await expect(
      page.getByTestId("daily-review-overview-section").locator('button[aria-expanded="true"]')
    ).toHaveCount(1);
    await expect(
      page.getByTestId("daily-review-summary-section").locator('button[aria-expanded="false"]')
    ).toHaveCount(1);
    await expect(
      page.getByTestId("daily-review-details-section").locator('button[aria-expanded="false"]')
    ).toHaveCount(1);
  });

  test("desktop keeps the full review expanded", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/daily-review");

    for (const testId of [
      "daily-review-overview-section",
      "daily-review-summary-section",
      "daily-review-details-section",
    ]) {
      await expect(
        page.getByTestId(testId).locator('button[aria-controls][aria-expanded="true"]').first()
      ).toBeVisible();
    }
  });

  for (const width of PHONE_WIDTHS) {
    test(`${width}px contains the ledger and fully hides collapsed content`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/app/daily-review");

      const intakeToggle = page.getByRole("button", { name: /Collapse intake/i });
      const outputToggle = page.getByRole("button", { name: /Collapse output/i });

      await expect(intakeToggle).toBeVisible();
      await expect(outputToggle).toBeVisible();
      await expect(page.getByText("Latest 7", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Expand$/i })).toHaveCount(0);

      const toggleWidths = await Promise.all([
        intakeToggle.evaluate((element) => element.getBoundingClientRect().width),
        outputToggle.evaluate((element) => element.getBoundingClientRect().width),
      ]);
      expect(toggleWidths[0]).toBeGreaterThan(width - 96);
      expect(toggleWidths[1]).toBeGreaterThan(width - 96);

      await intakeToggle.click();
      await expect(page.getByRole("button", { name: /Expand intake/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Open intake detail/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Open output detail/i }).first()).toBeVisible();

      await outputToggle.click();
      await expect(page.getByRole("button", { name: /Expand output/i })).toBeVisible();
      await expect(page.getByText("Latest 7", { exact: true })).toHaveCount(0);
      await expect(page.getByText(/Hover any bar for an instant breakdown/i)).toHaveCount(0);
      await expect(page.getByTestId("energy-ledger-content")).toHaveCount(0);

      const geometry = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
      }));
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
      expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewportWidth);
    });
  }

  test("intake and output can be reviewed independently", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/daily-review");

    await page.getByRole("button", { name: /Collapse output/i }).click();
    await expect(page.getByText("Latest 7", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Open intake detail/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Open output detail/i })).toHaveCount(0);
    await expect(page.getByText("Avg intake", { exact: true })).toBeVisible();
    await expect(page.getByText("Avg output", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: /Expand output/i }).click();
    await page.getByRole("button", { name: /Collapse intake/i }).click();
    await expect(page.getByRole("button", { name: /Open output detail/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Open intake detail/i })).toHaveCount(0);
    await expect(page.getByText("Avg output", { exact: true })).toBeVisible();
    await expect(page.getByText("Avg intake", { exact: true })).toHaveCount(0);
  });
});
