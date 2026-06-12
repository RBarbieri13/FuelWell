import { z } from "zod";
import { registerTools } from "../registry";
import { remaining, sumMealItems } from "@/lib/fuelwell-data";

/**
 * Tool modules register here. Section B adds meal/workout/recipe/progress/
 * restaurant/grocery/settings/meta modules; each module file calls
 * registerTools() and is imported below.
 */

registerTools([
  {
    name: "get_todays_plate",
    description:
      "Get everything logged today: each meal with macros, plus remaining calorie/protein/carb/fat budget vs targets. Use before suggesting food.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const { meals, totals, targets } = ctx.snapshot;
      return {
        persisted: false,
        modelResult: {
          meals: meals.map((m) => ({
            id: m.id,
            slot: m.mealType,
            name: m.name,
            ...sumMealItems(m.items),
          })),
          totals,
          targets,
          remaining: {
            calories: remaining(totals.calories, targets.calories),
            protein: remaining(totals.protein, targets.protein),
            carbs: remaining(totals.carbs, targets.carbs),
            fat: remaining(totals.fat, targets.fat),
          },
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "todays_plate",
          meals: meals.map((m) => ({
            id: m.id,
            slot: m.mealType,
            name: m.name,
            macros: sumMealItems(m.items),
          })),
          totals,
          targets,
        },
      };
    },
  },
]);
