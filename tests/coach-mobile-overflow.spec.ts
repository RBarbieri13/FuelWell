import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { authenticateCandidate } from "./helpers/authenticate";

const VIEWPORTS = [320, 375, 390, 430] as const;

async function openCoach(page: Page) {
  await page.route("**/api/coach/history", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        signedIn: false,
        conversationId: null,
        messages: [],
      }),
    })
  );

  await authenticateCandidate(page, "/app/coach");
  const composer = page.getByLabel("Message Coach");
  await expect(composer).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Rich response support", { exact: true })).toBeVisible();
}

async function assertNoViewportOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    overflowingContainers: Array.from(
      document.querySelectorAll<HTMLElement>("main, main > div, main > div > div")
    )
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
  }));
  expect(
    dimensions.documentScrollWidth,
    `document width ${dimensions.documentScrollWidth}px exceeds viewport ${dimensions.viewportWidth}px`
  ).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.overflowingContainers, "the inner Coach conversation must not scroll horizontally").toEqual([]);
  return dimensions;
}

async function expectContained(page: Page, locator: Locator, label: string) {
  const result = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const parent = element.parentElement?.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewport: window.innerWidth,
      parentLeft: parent?.left ?? 0,
      parentRight: parent?.right ?? window.innerWidth,
    };
  });
  expect(result.left, `${label} starts outside its parent: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(result.parentLeft - 1);
  expect(result.right, `${label} extends outside its parent: ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.parentRight + 1);
  expect(result.right, `${label} extends outside the viewport: ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.viewport + 1);
}

async function captureState(
  page: Page,
  testInfo: TestInfo,
  width: number,
  name: string,
  locator: Locator
) {
  await expect(locator).toBeVisible();
  const dimensions = await assertNoViewportOverflow(page);
  const bounds = await locator.boundingBox();
  const screenshotPath = testInfo.outputPath(`${width}-${name}.png`);
  const statePath = testInfo.outputPath(`${width}-${name}.json`);
  await locator.screenshot({ path: screenshotPath });
  await writeFile(statePath, JSON.stringify({ name, width, dimensions, bounds }, null, 2));
}

function deterministicActionResponse() {
  const events = [
    { type: "text_delta", text: "Your nutrition detail is ready." },
    {
      type: "artifact",
      toolName: "open_page",
      artifact: {
        id: "mobile-overflow-action",
        type: "open_page",
        route: "/app/nutrition",
        reason: "Review the detailed nutrition breakdown and next recommended action.",
      },
    },
    {
      type: "turn_done",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        costUsdCents: 0,
        model: "playwright-deterministic-fixture",
      },
    },
  ];
  return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
}

test.describe("Coach mobile overflow release gate", () => {
  test.describe.configure({ mode: "serial" });

  for (const width of VIEWPORTS) {
    test(`${width}px keeps rich content, artifacts, attachments, and composer in bounds`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 844 });
      await openCoach(page);

      const richText = page
        .getByText("Rich response support", { exact: true })
        .locator("xpath=ancestor::section");
      await captureState(page, testInfo, width, "rich-text", richText);
      await expectContained(page, richText.locator("h2").last(), "rich heading");

      const table = richText.locator("table");
      await expect(table.getByText("Salmon bowl")).toBeVisible();
      const tableScroller = table.locator("xpath=parent::div");
      await expectContained(page, tableScroller, "table scroller");
      await captureState(page, testInfo, width, "table", tableScroller);

      const nestedList = richText.locator("ol").first();
      await expect(nestedList.locator("ul")).toBeVisible();
      await expectContained(page, nestedList, "nested list");
      await captureState(page, testInfo, width, "nested-list", nestedList);

      const formula = richText.locator(".katex").first();
      await captureState(page, testInfo, width, "formula", formula);

      const media = richText.getByRole("img", { name: "FuelWell rich chat preview" });
      await expectContained(page, media, "rich media");
      await captureState(page, testInfo, width, "media", media);

      const composer = page.getByLabel("Message Coach");
      await composer.fill("Open my nutrition detail");
      const composerForm = composer.locator("xpath=ancestor::form");
      await captureState(page, testInfo, width, "composer", composerForm);

      const fileInput = page.getByLabel("Attach screenshot, menu, photo, or file");
      await fileInput.setInputFiles({
        name: "mobile-overflow-fixture.md",
        mimeType: "text/markdown",
        buffer: Buffer.from("# Deterministic attachment\n\nNo provider call is required."),
      });
      const attachment = page.getByText("mobile-overflow-fixture.md", { exact: true });
      await captureState(page, testInfo, width, "attachment", attachment.locator("xpath=ancestor::div[2]"));

      await page.route("**/api/coach/turn", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          headers: { "cache-control": "no-cache" },
          body: deterministicActionResponse(),
        })
      );
      await page.getByRole("button", { name: "Send" }).click();

      const actionDrawer = page.locator("aside").filter({ hasText: "Coach action" });
      await expect(actionDrawer.getByRole("button", { name: "Open /app/nutrition" })).toBeVisible();
      await captureState(page, testInfo, width, "media-action-artifact", actionDrawer);
    });
  }
});
