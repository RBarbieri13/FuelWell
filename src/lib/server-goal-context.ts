import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildDailyGoalContext,
  type DailyGoalContext,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import type { MacroTargets, MacroTotals, MealRecord } from "@/lib/fuelwell-data";

type GoalPlanRow = {
  id: string;
  primary_goal: GoalPlan["primaryGoal"];
  goal_reason: string | null;
  target_weight_kg: number | string | null;
  weekly_rate_kg: number | string | null;
  protein_strategy: GoalPlan["proteinStrategy"];
  training_priority: GoalPlan["trainingPriority"];
  calorie_floor: number;
  calorie_ceiling: number;
  macro_targets: Partial<MacroTargets> | null;
  adaptation_policy: GoalPlan["adaptationPolicy"];
  status: GoalPlan["status"];
  updated_at: string;
};

type IntegrationSummaryRow = {
  provider: IntegrationDailySummary["provider"];
  summary_date: string;
  steps: number | null;
  active_calories: number | null;
  sleep_hours: number | string | null;
  stress_level: IntegrationDailySummary["stressLevel"] | null;
  body_battery: number | null;
  recovery_label: string | null;
  workout_planned: string | null;
  raw_jsonb: Partial<IntegrationDailySummary> | null;
  updated_at: string;
};

function numberOrUndefined(value: number | string | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function macroTargetsFromRow(value: Partial<MacroTargets> | null, fallback: MacroTargets): MacroTargets {
  return {
    calories: Number(value?.calories ?? fallback.calories),
    protein: Number(value?.protein ?? fallback.protein),
    carbs: Number(value?.carbs ?? fallback.carbs),
    fat: Number(value?.fat ?? fallback.fat),
  };
}

function mapGoalPlan(row: GoalPlanRow, fallbackTargets: MacroTargets): GoalPlan {
  return {
    id: row.id,
    primaryGoal: row.primary_goal,
    goalReason: row.goal_reason || "Use the active goal to guide today's meals.",
    targetWeightKg: numberOrUndefined(row.target_weight_kg),
    weeklyRateKg: numberOrUndefined(row.weekly_rate_kg),
    proteinStrategy: row.protein_strategy,
    trainingPriority: row.training_priority,
    calorieFloor: row.calorie_floor,
    calorieCeiling: row.calorie_ceiling,
    macroTargets: macroTargetsFromRow(row.macro_targets, fallbackTargets),
    adaptationPolicy: row.adaptation_policy,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function mapIntegrationSummary(row: IntegrationSummaryRow): IntegrationDailySummary {
  const raw = row.raw_jsonb ?? {};
  return {
    provider: row.provider,
    status: raw.status ?? "connected",
    date: row.summary_date,
    sourceLabel: raw.sourceLabel ?? "Garmin Connect",
    steps: row.steps ?? undefined,
    activeCalories: row.active_calories ?? undefined,
    sleepHours: numberOrUndefined(row.sleep_hours),
    stressLevel: row.stress_level ?? undefined,
    bodyBattery: row.body_battery ?? undefined,
    recoveryLabel: row.recovery_label ?? undefined,
    workoutPlanned: row.workout_planned ?? undefined,
    lastSyncAt: raw.lastSyncAt ?? row.updated_at,
    note: raw.note,
  };
}

export async function loadServerDailyGoalContext(
  supabase: SupabaseClient,
  input: {
    userId: string;
    date: string;
    meals: MealRecord[];
    totals: MacroTotals;
    targets: MacroTargets;
    profile?: { goal?: string | null };
  },
): Promise<DailyGoalContext> {
  const [goalResult, integrationResult] = await Promise.all([
    supabase
      .from("goal_plans")
      .select(
        "id, primary_goal, goal_reason, target_weight_kg, weekly_rate_kg, protein_strategy, training_priority, calorie_floor, calorie_ceiling, macro_targets, adaptation_policy, status, updated_at",
      )
      .eq("user_id", input.userId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("integration_daily_summaries")
      .select(
        "provider, summary_date, steps, active_calories, sleep_hours, stress_level, body_battery, recovery_label, workout_planned, raw_jsonb, updated_at",
      )
      .eq("user_id", input.userId)
      .eq("provider", "garmin")
      .eq("summary_date", input.date)
      .maybeSingle(),
  ]);

  return buildDailyGoalContext({
    date: input.date,
    meals: input.meals,
    totals: input.totals,
    targets: input.targets,
    profile: { goal: input.profile?.goal ?? undefined },
    goalPlan: goalResult.data
      ? mapGoalPlan(goalResult.data as GoalPlanRow, input.targets)
      : undefined,
    integration: integrationResult.data
      ? mapIntegrationSummary(integrationResult.data as IntegrationSummaryRow)
      : undefined,
  });
}
