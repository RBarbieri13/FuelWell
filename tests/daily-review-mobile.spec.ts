import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { authenticateCandidate } from "./helpers/authenticate";

const VIEWPORTS = [320, 375, 390, 430] as const;

async function assertNoPageOverflow(page: Page, state: string) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(
    dimensions.documentScrollWidth,
    `${state}: document width exceeds the phone viewport`
  ).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(
    dimensions.bodyScrollWidth,
    `${state}: body width exceeds the phone viewport`
  ).toBeLessThanOrEqual(dimensions.viewportWidth);

  return dimensions;
}

async function captureLedger(
  page: Page,
  testInfo: TestInfo,
  width: number,
  state: string
) {
  const ledger = page
    .getByRole("heading", { name: "Intake and output by day" })
    .locator("xpath=ancestor::section[1]");
  const dimensions = await assertNoPageOverflow(page, state);
  const screenshotPath = testInfo.outputPath(`${width}-${state}.png`);
  const statePath = testInfo.outputPath(`${width}-${state}.json`);

  await ledger.screenshot({ path: screenshotPath });
  await writeFile(statePath, JSON.stringify({ width, state, dimensions }, null, 2));
}

test.describe("Daily Review mobile energy ledger", () => {
  for (const width of VIEWPORTS) {
    test(`${width}px keeps independent intake and output controls contained`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await authenticateCandidate(page, "/app/daily-review");

      await expect(
        page.getByRole("heading", { name: "Intake and output by day" })
      ).toBeVisible();

      const controls = page.getByTestId("energy-ledger-controls");
      const intake = page.getByTestId("energy-ledger-intake-toggle");
      const output = page.getByTestId("energy-ledger-output-toggle");
      const content = page.getByTestId("energy-ledger-content");

      await expect(controls.getByRole("button")).toHaveCount(2);
      await expect(intake).toHaveAttribute("aria-expanded", "true");
      await expect(output).toHaveAttribute("aria-expanded", "true");
      await expect(content).toBeVisible();
      await expect(page.getByText("Latest 7", { exact: true })).toBeVisible();
      await captureLedger(page, testInfo, width, "both-expanded");

      await intake.click();
      await expect(intake).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByText("Avg intake", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Avg output", { exact: true })).toBeVisible();
      await captureLedger(page, testInfo, width, "output-only");

      await output.click();
      await expect(output).toHaveAttribute("aria-expanded", "false");
      await expect(content).toHaveCount(0);
      await expect(page.getByText("Latest 7", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Base burn" })).toHaveCount(0);
      await captureLedger(page, testInfo, width, "collapsed");

      await intake.click();
      await expect(content).toBeVisible();
      await expect(page.getByText("Latest 7", { exact: true })).toBeVisible();
      await expect(page.getByText("Avg intake", { exact: true })).toBeVisible();
      await expect(page.getByText("Avg output", { exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Base burn" })).toHaveCount(0);
      await captureLedger(page, testInfo, width, "intake-only");
    });
  }
});
