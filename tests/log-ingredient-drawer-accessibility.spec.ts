import { expect, test, type Locator, type Page } from "@playwright/test";
import { authenticateCandidate } from "./helpers/authenticate";

async function openLogPage(page: Page) {
  if (process.env.FUELWELL_UI_TEST_EMAIL && process.env.FUELWELL_UI_TEST_PASSWORD) {
    await authenticateCandidate(page, "/app/log");
  } else {
    await page.goto("/app/log", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main").first()).toBeVisible();
  }
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
}

async function addSessionMeal(page: Page, mealName: string) {
  const openFormButton = page.getByRole("button", { name: "Add your own meal" });
  await expect(openFormButton).toBeVisible();
  await openFormButton.click();
  const mealNameField = page.getByLabel("Meal name");
  if (!(await mealNameField.isVisible().catch(() => false))) {
    await openFormButton.click();
  }
  await mealNameField.fill(mealName);

  const form = page
    .getByRole("button", { name: /Add to (Breakfast|Lunch|Dinner|Snack)/ })
    .locator("xpath=ancestor::div[1]");
  const macros = form.getByRole("spinbutton");
  await macros.nth(0).fill("420");
  await macros.nth(1).fill("32");
  await macros.nth(2).fill("28");
  await macros.nth(3).fill("14");
  await form
    .getByRole("button", { name: /Add to (Breakfast|Lunch|Dinner|Snack)/ })
    .click();
  await expect(page.getByRole("button", { name: /Current meal \(1\)/ })).toBeVisible();
}

async function openIngredientDrawer(page: Page): Promise<{
  dialog: Locator;
  trigger: Locator;
  closeButton: Locator;
}> {
  const trigger = page.getByRole("button", { name: /Current meal \(1\)/ });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Ingredient drawer" });
  const closeButton = dialog.getByRole("button", { name: "Close ingredient drawer" });

  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(closeButton).toBeFocused();

  return { dialog, trigger, closeButton };
}

test.describe("meal log ingredient drawer accessibility", () => {
  test.describe.configure({ mode: "serial" });

  test("acts as a keyboard-correct modal sheet on mobile", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await openLogPage(page);
    await addSessionMeal(page, "Drawer focus meal");

    const { dialog, trigger, closeButton } = await openIngredientDrawer(page);
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("keeps desktop background controls out of the tab order while open", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await openLogPage(page);
    await addSessionMeal(page, "Drawer desktop meal");

    const { closeButton } = await openIngredientDrawer(page);

    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(closeButton).toBeFocused();

    await closeButton.click();
    await expect(page.getByRole("dialog", { name: "Ingredient drawer" })).toHaveCount(0);
  });
});
