import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { authenticateCandidate } from "./helpers/authenticate";

const VIEWPORTS = [320, 375, 390, 430] as const;
const GROCERY_FIXTURE = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Salmon fillet",
    amount: "2 portions",
    category: "Protein",
    source: "Salmon rice plate",
    checked: false,
    servingSize: "4-6 oz cooked",
    classification: "protein anchor",
    vitaminBenefit: "omega-3, B vitamins",
    quantity: "2 portions",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Baby spinach",
    amount: "1 large box",
    category: "Produce",
    source: "Salmon rice plate",
    checked: false,
    servingSize: "1 cup",
    classification: "produce + micronutrients",
    vitaminBenefit: "vitamin K, folate",
    quantity: "1 large box",
  },
] as const;

async function installGroceryFixture(page: Page) {
  await page.route("**/api/grocery-list?*", async (route) => {
    if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON() as { date: string; items: unknown[] };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ signedIn: true, date: payload.date, items: payload.items }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        signedIn: true,
        date: new Date().toISOString().slice(0, 10),
        items: GROCERY_FIXTURE,
      }),
    });
  });
}

async function assertContained(page: Page, label: string) {
  const metrics = await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>("main");
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="mobile-grocery-item"]'));
    const names = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="mobile-grocery-name"]'));
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      main: main ? { clientWidth: main.clientWidth, scrollWidth: main.scrollWidth } : null,
      itemBounds: items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }),
      nameWidths: names.map((name) => name.getBoundingClientRect().width),
    };
  });

  expect(metrics.documentWidth, `${label}: document overflow`).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.bodyWidth, `${label}: body overflow`).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.main?.scrollWidth, `${label}: hidden inner-pane overflow`).toBeLessThanOrEqual(metrics.main?.clientWidth ?? 0);
  for (const bounds of metrics.itemBounds) {
    expect(bounds.left, `${label}: grocery row starts outside viewport`).toBeGreaterThanOrEqual(0);
    expect(bounds.right, `${label}: grocery row ends outside viewport`).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(bounds.width, `${label}: grocery row is too narrow to use`).toBeGreaterThanOrEqual(metrics.viewport - 52);
  }
  for (const width of metrics.nameWidths) {
    expect(width, `${label}: grocery item name is squeezed`).toBeGreaterThanOrEqual(140);
  }
  return metrics;
}

async function capture(page: Page, testInfo: TestInfo, width: number, state: string) {
  const metrics = await assertContained(page, `${width}px ${state}`);
  const screenshot = testInfo.outputPath(`${width}-${state}.png`);
  const report = testInfo.outputPath(`${width}-${state}.json`);
  await mkdir(dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(report, JSON.stringify(metrics, null, 2));
}

test.describe("grocery iPhone responsive gate", () => {
  for (const width of VIEWPORTS) {
    test(`${width}px keeps grocery editing and recipe filters inside the phone`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 844 });
      await installGroceryFixture(page);
      await authenticateCandidate(page, "/app/grocery-list");
      await expect(page.getByTestId("mobile-grocery-list")).toBeVisible();
      await expect(page.getByTestId("mobile-grocery-item").first()).toBeVisible();
      await expect(page.getByLabel("Add a recipe filter")).toBeVisible();
      await capture(page, testInfo, width, "grocery-page");

      const firstItem = page.getByTestId("mobile-grocery-item").first();
      await firstItem.getByRole("button", { name: /increase quantity/i }).click();
      await expect(firstItem.getByLabel(/edit quantity/i)).toHaveValue(/2/);
      await capture(page, testInfo, width, "quantity-edited");

      const recipeFilter = page.getByLabel("Add a recipe filter");
      const filterValue = await recipeFilter.locator("option").nth(1).getAttribute("value");
      expect(filterValue).toBeTruthy();
      await recipeFilter.selectOption(filterValue!);
      await expect(page.getByLabel("Active recipe filters")).toBeVisible();
      await capture(page, testInfo, width, "recipe-filtered");
    });

    test(`${width}px keeps Coach grocery artifact contained`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.route("**/api/coach/history", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ signedIn: false, conversationId: null, messages: [] }),
        })
      );
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript(() => {
        localStorage.setItem(
          "fuelwell-coach-chat-v1:preview",
          JSON.stringify({
            date: new Date().toISOString().split("T")[0],
            items: [
              {
                id: "grocery-mobile-fixture",
                role: "assistant",
                text: "Your grocery list is ready.",
                artifacts: [
                  {
                    id: "grocery-artifact-mobile",
                    type: "grocery_list",
                    added: ["bananas"],
                    items: [
                      { id: "one", name: "bananas", quantity: "5 bunches", checked: false },
                      { id: "two", name: "extra long whole grain tortillas for wraps", quantity: "2 family-size packs", checked: true },
                    ],
                  },
                ],
              },
            ],
          })
        );
      });
      await authenticateCandidate(page, "/app/coach");
      const artifact = page.locator("aside").filter({ hasText: "Grocery list updated" });
      await expect(artifact).toBeVisible();
      await page.waitForTimeout(500);
      await expect(artifact.getByText("Bananas", { exact: true })).toBeVisible();
      await expect(artifact.getByText("5 bunches", { exact: true }).first()).toBeVisible();
      await assertContained(page, `${width}px Coach grocery artifact`);
      const bounds = await artifact.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, viewport: window.innerWidth };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
      await capture(page, testInfo, width, "coach-grocery-artifact");
    });
  }
});
