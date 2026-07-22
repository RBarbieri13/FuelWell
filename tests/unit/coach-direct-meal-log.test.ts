import { describe, expect, it } from "vitest";
import "@/lib/coach/tools";
import { getTool } from "@/lib/coach/registry";
import { parseDirectMealLog } from "@/lib/coach/direct-meal-log";
import { makeCtx } from "./helpers";

describe("parseDirectMealLog", () => {
  it("resolves 'log 2 eggs for breakfast' to log_meal with database macros", () => {
    const parsed = parseDirectMealLog("log 2 eggs for breakfast");
    expect(parsed).not.toBeNull();
    expect(parsed!.tool).toBe("log_meal");
    const input = parsed!.input as { food_id: string; portion: number; meal_slot: string };
    expect(input.meal_slot).toBe("breakfast");
    // "Egg, whole, large (50 g each)" -> 2 x 50 g
    expect(input.portion).toBe(100);
    expect(parsed!.reply).toMatch(/Egg/);
    expect(parsed!.reply).toMatch(/143 kcal/);
  });

  it("resolves 'I had a bowl of oatmeal for breakfast' via container-word stripping", () => {
    const parsed = parseDirectMealLog("I had a bowl of oatmeal for breakfast");
    expect(parsed).not.toBeNull();
    expect(parsed!.tool).toBe("log_meal");
    expect(parsed!.reply).toMatch(/Oatmeal/);
  });

  it("keeps the explicit-calorie custom path unchanged", () => {
    const parsed = parseDirectMealLog("log chicken and rice 650 calories for dinner");
    expect(parsed).not.toBeNull();
    expect(parsed!.tool).toBe("log_custom_meal");
    const input = parsed!.input as { name: string; kcal: number; meal_slot: string };
    expect(input.kcal).toBe(650);
    expect(input.meal_slot).toBe("dinner");
    expect(parsed!.reply).toBe(`Logged ${input.name} as an additional dinner.`);
  });

  it("returns null without a log verb or meal slot", () => {
    expect(parseDirectMealLog("what should I eat for dinner?")).toBeNull();
    expect(parseDirectMealLog("add eggs to my grocery list")).toBeNull();
  });

  it("returns null for unresolvable food names instead of guessing", () => {
    expect(parseDirectMealLog("log flurbogriz for lunch")).toBeNull();
  });

  it("executes end-to-end through the registered tool: mutation, artifact, macros", async () => {
    const parsed = parseDirectMealLog("log 2 eggs for breakfast")!;
    const def = getTool(parsed.tool)!;
    const { ctx, applied } = makeCtx();
    const input = def.schema.parse(parsed.input);
    const result = await def.run(input, ctx);
    result.mutations?.forEach(ctx.applyMutation);

    expect(result.persisted).toBe(true);
    expect(result.artifact?.type).toBe("meal_logged");
    expect(applied).toHaveLength(1);
    const m = applied[0];
    expect(m.kind).toBe("add_meal");
    if (m.kind === "add_meal") {
      expect(m.meal.mealType).toBe("breakfast");
      expect(m.meal.items[0].calories).toBe(143); // 100 g of whole egg
      expect(m.meal.items[0].protein).toBe(13);
      expect(ctx.snapshot.meals.some((meal) => meal.id === m.meal.id)).toBe(true);
    }
  });
});
