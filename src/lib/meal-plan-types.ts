import { z } from "zod";

export const planSlotSchema = z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]);
export const plannedMealStatusSchema = z.enum(["planned", "logged", "open", "added"]);

export const plannedMealSchema = z.object({
  slot: planSlotSchema,
  recipeId: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200),
  calories: z.number().finite().nonnegative().max(20_000),
  protein: z.number().finite().nonnegative().max(2_000),
  prep: z.string().trim().max(100),
  status: plannedMealStatusSchema,
});

export const planDaySchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(32),
  date: z.string().trim().min(1).max(64),
  iso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  focus: z.string().trim().max(120),
  meals: z.array(plannedMealSchema).max(8),
});

export const planDaysSchema = z.array(planDaySchema).max(7);

export const weekStartSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => new Date(`${value}T00:00:00.000Z`).getUTCDay() === 1, {
    message: "Week start must be a Monday.",
  });

export type PlanSlot = z.infer<typeof planSlotSchema>;
export type PlannedMealStatus = z.infer<typeof plannedMealStatusSchema>;
export type PlannedMeal = z.infer<typeof plannedMealSchema>;
export type PlanDay = z.infer<typeof planDaySchema>;
