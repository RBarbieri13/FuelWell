import { expect, test } from "@playwright/test";
import { authenticateCandidate } from "./helpers/authenticate";

test.describe.configure({ mode: "serial" });

for (const width of [320, 375]) {
  test(`recipe actions persist into meals and groceries at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 844 });
    await authenticateCandidate(page, "/app/recipes");
    const baseline = await page.evaluate(async () => {
      const date = new Date().toISOString().slice(0, 10);
      const [dayLog, groceries] = await Promise.all([
        fetch(`/api/day-log?date=${date}`).then((response) => response.json()),
        fetch(`/api/grocery-list?date=${date}`).then((response) => response.json()),
      ]);
      return { date, meals: dayLog.meals ?? [], groceries: groceries.items ?? [] };
    });

    try {
      await page.getByLabel("Search recipes").fill("salmon rice plate");
      await page.getByRole("button", { name: "Open recipe" }).first().click();

      const dialog = page.getByRole("dialog", { name: "Salmon rice plate" });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Plan this meal" }).click();
      await expect(dialog.getByRole("status")).toContainText("added to today's dinner");
      await dialog.getByRole("button", { name: "Add ingredients" }).click();
      await expect(dialog.getByRole("status")).toContainText("ingredients added to Groceries");

      const fit = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      expect(fit).toBe(true);

      await authenticateCandidate(page, "/app/log");
      await expect(page.getByText("Salmon rice plate").first()).toBeVisible();

      await authenticateCandidate(page, "/app/grocery-list");
      await expect(page.getByText("Salmon fillet").first()).toBeVisible();
      await expect(page.getByLabel("Edit item name for Soy Ginger Glaze").first()).toBeVisible();
      await expect(page.getByText("Recipe: Salmon rice plate").first()).toBeVisible();
    } finally {
      await page.evaluate(async ({ date, meals, groceries }) => {
        const current = await fetch(`/api/day-log?date=${date}`).then((response) => response.json());
        const originalIds = new Set(meals.map((meal: { id: string }) => meal.id));
        await Promise.all(
          (current.meals ?? [])
            .filter((meal: { id: string }) => !originalIds.has(meal.id))
            .map((meal: { id: string }) =>
              fetch("/api/day-log", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, mealId: meal.id }),
              })
            )
        );
        await fetch("/api/grocery-list", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, items: groceries }),
        });
      }, baseline);
    }
  });
}
