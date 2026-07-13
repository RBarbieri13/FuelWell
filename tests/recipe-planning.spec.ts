import { expect, test } from "@playwright/test";

for (const width of [320, 375]) {
  test(`recipe actions persist into meals and groceries at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/recipes");
    await page.getByLabel("Search title, ingredients, or tags").fill("salmon rice plate");
    await page.getByRole("button", { name: "Open recipe" }).first().click();

    const dialog = page.getByRole("dialog", { name: "Salmon rice plate" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Plan this meal" }).click();
    await expect(dialog.getByRole("status")).toContainText("added to today's dinner");
    await dialog.getByRole("button", { name: "Add ingredients" }).click();
    await expect(dialog.getByRole("status")).toContainText("ingredients added to Groceries");

    const fit = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(fit).toBe(true);

    await page.goto("/app/log");
    await expect(page.getByText("Salmon rice plate").first()).toBeVisible();

    await page.goto("/app/grocery-list");
    await expect(page.getByText("Salmon fillet").first()).toBeVisible();
    await expect(page.getByLabel("Edit item name for Soy Ginger Glaze").first()).toBeVisible();
    await expect(page.getByText("Recipe: Salmon rice plate").first()).toBeVisible();
  });
}
