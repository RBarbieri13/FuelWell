import { describe, expect, it } from "vitest";
import {
  ALL_RESTAURANTS,
  buildRestaurantMacroInsight,
  matchRestaurantByName,
  menuItemTotals,
  restaurantBrand,
  restaurantStats,
  searchRestaurantMenus,
} from "@/lib/restaurant-menu";

describe("restaurant-menu helpers", () => {
  it("extends the generated restaurant database with supplemental chains", () => {
    const stats = restaurantStats();
    expect(stats.restaurantCount).toBeGreaterThanOrEqual(70);
    expect(stats.itemCount).toBeGreaterThanOrEqual(730);
    expect(ALL_RESTAURANTS.some((restaurant) => restaurant.id === "cava")).toBe(true);
    expect(ALL_RESTAURANTS.some((restaurant) => restaurant.id === "sweetgreen")).toBe(true);
    expect(ALL_RESTAURANTS.some((restaurant) => restaurant.id === "smoothie-king")).toBe(true);
  });

  it("matches local place names to restaurant database chains", () => {
    expect(matchRestaurantByName("Chick Fil A")?.id).toBe("chick-fil-a");
    expect(matchRestaurantByName("Moe's Southwest Grill")?.id).toBe("moes-southwest-grill");
    expect(matchRestaurantByName("Local Coffee Hut")).toBeNull();
  });

  it("searches menu items and scores against remaining goal room", () => {
    const results = searchRestaurantMenus({
      query: "chicken",
      preference: "under 600",
      remaining: { calories: 650, protein: 60, carbs: 90, fat: 35 },
      limit: 8,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.item.calories <= 600)).toBe(true);
    expect(results[0].fitLabel).toMatch(/kcal/);
    expect(results[0].insight.proteinLine).toMatch(/protein/i);
    expect(results[0].insight.carbLine).toMatch(/carbs/i);
    expect(menuItemTotals(results[0].item).calories).toBe(results[0].item.calories);
  });

  it("builds deterministic brand badges and macro insight copy", () => {
    const cava = ALL_RESTAURANTS.find((restaurant) => restaurant.id === "cava")!;
    const brand = restaurantBrand(cava);
    expect(brand.initials).toBe("C");
    expect(brand.bg).toMatch(/^#/);

    const insight = buildRestaurantMacroInsight(cava.items[0], {
      calories: 800,
      protein: 55,
      carbs: 90,
      fat: 35,
    });
    expect(insight.headline).toMatch(/kcal/);
    expect(insight.nextMove.length).toBeGreaterThan(10);
  });
});
