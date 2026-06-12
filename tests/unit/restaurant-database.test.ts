import { describe, expect, it } from "vitest";
import { RESTAURANT_DATABASE } from "@/lib/restaurant-database";

/**
 * Integrity guard for the generated restaurant DB. The build script
 * (tools/build-restaurant-db.mjs) enforces the same rules at generation
 * time; this catches hand-edits or a stale regeneration.
 */
describe("RESTAURANT_DATABASE", () => {
  it("covers at least 50 restaurants with at least 5 items each", () => {
    expect(RESTAURANT_DATABASE.length).toBeGreaterThanOrEqual(50);
    for (const r of RESTAURANT_DATABASE) {
      expect(r.items.length, r.name).toBeGreaterThanOrEqual(5);
    }
  });

  it("has unique restaurant and item ids", () => {
    const rIds = RESTAURANT_DATABASE.map((r) => r.id);
    expect(new Set(rIds).size).toBe(rIds.length);
    const itemIds = RESTAURANT_DATABASE.flatMap((r) => r.items.map((i) => i.id));
    expect(new Set(itemIds).size).toBe(itemIds.length);
  });

  it("every item has sane published macros and a source URL", () => {
    for (const r of RESTAURANT_DATABASE) {
      for (const item of r.items) {
        expect(item.sourceUrl, `${r.id}/${item.name}`).toMatch(/^https?:\/\//);
        expect(item.serving.length).toBeGreaterThan(0);
        for (const n of [item.calories, item.protein, item.carbs, item.fat]) {
          expect(Number.isFinite(n)).toBe(true);
          expect(n).toBeGreaterThanOrEqual(0);
        }
        expect(item.calories).toBeLessThanOrEqual(5000);
        if (item.calories > 50) {
          const computed = 4 * item.protein + 4 * item.carbs + 9 * item.fat;
          expect(
            Math.abs(computed - item.calories) / item.calories,
            `${r.id}/${item.name} macro math`
          ).toBeLessThanOrEqual(0.25);
        }
      }
    }
  });
});
