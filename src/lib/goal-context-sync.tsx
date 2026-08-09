"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/preview-session";
import {
  buildDefaultGoalPlan,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import {
  disconnectIntegrationSummary,
  setGoalContextScope,
  setGoalPlan,
  setIntegrationSummary,
} from "@/lib/use-goal-context";
import { todayIsoDate, type MacroTargets } from "@/lib/fuelwell-data";

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

function mapGoalPlan(row: GoalPlanRow): GoalPlan {
  const fallback = buildDefaultGoalPlan({ goal: row.primary_goal });
  return {
    id: row.id,
    primaryGoal: row.primary_goal,
    goalReason: row.goal_reason || fallback.goalReason,
    targetWeightKg: numberOrUndefined(row.target_weight_kg),
    weeklyRateKg: numberOrUndefined(row.weekly_rate_kg),
    proteinStrategy: row.protein_strategy,
    trainingPriority: row.training_priority,
    calorieFloor: row.calorie_floor,
    calorieCeiling: row.calorie_ceiling,
    macroTargets: {
      calories: Number(row.macro_targets?.calories ?? fallback.macroTargets.calories),
      protein: Number(row.macro_targets?.protein ?? fallback.macroTargets.protein),
      carbs: Number(row.macro_targets?.carbs ?? fallback.macroTargets.carbs),
      fat: Number(row.macro_targets?.fat ?? fallback.macroTargets.fat),
    },
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

export function GoalContextSync() {
  useEffect(() => {
    let cancelled = false;
    if (!hasSupabaseConfig()) return undefined;

    const supabase = createClient();

    async function start() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      setGoalContextScope(user.id);

      const date = todayIsoDate();
      const [{ data: profile, error: profileError }, { data: goalPlan, error: goalError }, { data: integration, error: integrationError }] = await Promise.all([
        supabase.from("profiles").select("goal").eq("id", user.id).maybeSingle(),
        supabase
          .from("goal_plans")
          .select(
            "id, primary_goal, goal_reason, target_weight_kg, weekly_rate_kg, protein_strategy, training_priority, calorie_floor, calorie_ceiling, macro_targets, adaptation_policy, status, updated_at",
          )
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("integration_daily_summaries")
          .select(
            "provider, summary_date, steps, active_calories, sleep_hours, stress_level, body_battery, recovery_label, workout_planned, raw_jsonb, updated_at",
          )
          .eq("user_id", user.id)
          .eq("provider", "garmin")
          .eq("summary_date", date)
          .maybeSingle(),
      ]);

      if (cancelled || profileError || goalError || integrationError) return;

      if (goalPlan) {
        setGoalPlan(mapGoalPlan(goalPlan as GoalPlanRow));
      } else {
        setGoalPlan(buildDefaultGoalPlan({ goal: (profile?.goal as string | null | undefined) ?? undefined }));
      }

      if (integration) {
        setIntegrationSummary(mapIntegrationSummary(integration as IntegrationSummaryRow));
      } else {
        disconnectIntegrationSummary();
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
