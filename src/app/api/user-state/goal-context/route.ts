import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import { persistGoalPlan, persistIntegrationSummary } from "@/lib/coach/persistence";
import type { GoalPlan, IntegrationDailySummary } from "@/lib/goal-context";

const goalPlanSchema = z.object({
  id: z.string().min(1),
  primaryGoal: z.string().min(1),
  goalReason: z.string(),
  targetWeightKg: z.number().optional(),
  weeklyRateKg: z.number().optional(),
  proteinStrategy: z.string().min(1),
  trainingPriority: z.string().min(1),
  calorieFloor: z.number().int().positive(),
  calorieCeiling: z.number().int().positive(),
  macroTargets: z.object({
    calories: z.number(), protein: z.number(), carbs: z.number(), fat: z.number(),
  }),
  adaptationPolicy: z.string().min(1),
  status: z.string().min(1),
  updatedAt: z.string().min(1),
});

const integrationSchema = z.object({
  provider: z.string().min(1),
  status: z.string().min(1),
  date: z.string().min(1),
  sourceLabel: z.string().min(1),
  steps: z.number().optional(),
  activeCalories: z.number().optional(),
  sleepHours: z.number().optional(),
  stressLevel: z.string().optional(),
  bodyBattery: z.number().optional(),
  recoveryLabel: z.string().optional(),
  workoutPlanned: z.string().optional(),
  lastSyncAt: z.string().optional(),
  note: z.string().optional(),
});

export async function PUT(request: Request) {
  if (!hasSupabaseConfig()) return Response.json({ error: "Sign in to save goal context." }, { status: 401 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in to save goal context." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.expectedUserId !== "string" || !body.expectedUserId) {
    return Response.json({ error: "The expected account is required to save goal context." }, { status: 400 });
  }
  if (body.expectedUserId !== user.id) {
    return Response.json({ error: "Your account changed before this goal update completed." }, { status: 409 });
  }
  try {
    if (body?.goalPlan !== undefined) {
      const goalPlan = goalPlanSchema.parse(body.goalPlan) as GoalPlan;
      await persistGoalPlan(supabase, user.id, goalPlan, "User goal context update");
      return Response.json({ goalPlan, userId: user.id });
    }
    if (body?.integrationSummary !== undefined) {
      const integrationSummary = integrationSchema.parse(body.integrationSummary) as IntegrationDailySummary;
      await persistIntegrationSummary(supabase, user.id, integrationSummary);
      return Response.json({ integrationSummary, userId: user.id });
    }
    return Response.json({ error: "No goal-context change was provided." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save goal context.";
    const status = error instanceof z.ZodError ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
