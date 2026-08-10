"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isPreviewHost } from "@/lib/preview-session";
import {
  buildDefaultGoalPlan,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import {
  configureGoalContextPersistence,
  configurePreviewGoalContext,
  configureSignedOutGoalContext,
  hydrateGoalContextFromServer,
  reportGoalContextPersistenceError,
  useGoalContextStore,
} from "@/lib/use-goal-context";
import { todayIsoDate, type MacroTargets } from "@/lib/fuelwell-data";
import { subscribeAuthenticatedUserIds } from "@/lib/preferences-sync";
import {
  assertAuthenticatedResponseOwner,
  resolveStorageAuthorityMode,
} from "@/lib/authenticated-storage-types";

type GoalPlanRow = {
  id: string; primary_goal: GoalPlan["primaryGoal"]; goal_reason: string | null;
  target_weight_kg: number | string | null; weekly_rate_kg: number | string | null;
  protein_strategy: GoalPlan["proteinStrategy"]; training_priority: GoalPlan["trainingPriority"];
  calorie_floor: number; calorie_ceiling: number; macro_targets: Partial<MacroTargets> | null;
  adaptation_policy: GoalPlan["adaptationPolicy"]; status: GoalPlan["status"]; updated_at: string;
};

type IntegrationSummaryRow = {
  provider: IntegrationDailySummary["provider"]; summary_date: string; steps: number | null;
  active_calories: number | null; sleep_hours: number | string | null;
  stress_level: IntegrationDailySummary["stressLevel"] | null; body_battery: number | null;
  recovery_label: string | null; workout_planned: string | null;
  raw_jsonb: Partial<IntegrationDailySummary> | null; updated_at: string;
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

function disconnectedSummary(): IntegrationDailySummary {
  return {
    provider: "garmin",
    status: "disconnected",
    date: todayIsoDate(),
    sourceLabel: "Garmin Connect",
    note: "Connect Garmin to use activity, sleep, and recovery context in meal guidance.",
  };
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Server rejected the change.");
  return body as T;
}

export function GoalContextSync() {
  const { persistenceError } = useGoalContextStore();

  useEffect(() => {
    let cancelled = false;
    let syncGeneration = 0;
    let activeUserId: string | null | undefined;
    const preview = typeof window !== "undefined" && isPreviewHost(window.location?.host);
    const authorityMode = resolveStorageAuthorityMode(preview, hasSupabaseConfig());
    if (authorityMode === "preview") {
      configurePreviewGoalContext();
      return undefined;
    }
    if (authorityMode === "unavailable") {
      configureSignedOutGoalContext();
      reportGoalContextPersistenceError(
        "Secure goal storage is unavailable. Refresh after the connection is restored.",
      );
      return undefined;
    }
    const supabase = createClient();

    async function syncUser(userId: string | null) {
      if (userId === activeUserId) return;
      activeUserId = userId;
      const generation = ++syncGeneration;
      if (!userId) {
        configureSignedOutGoalContext();
        return;
      }
      configureGoalContextPersistence(userId, {
        saveGoalPlan: async (goalPlan) => {
          const response = await fetch("/api/user-state/goal-context", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ goalPlan, expectedUserId: userId }),
          });
          const document = await responseJson<{ goalPlan: GoalPlan; userId: string }>(response);
          assertAuthenticatedResponseOwner(document, userId);
          return document.goalPlan;
        },
        saveIntegrationSummary: async (integrationSummary) => {
          const response = await fetch("/api/user-state/goal-context", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ integrationSummary, expectedUserId: userId }),
          });
          const document = await responseJson<{
            integrationSummary: IntegrationDailySummary;
            userId: string;
          }>(response);
          assertAuthenticatedResponseOwner(document, userId);
          return document.integrationSummary;
        },
      });
      try {
        const date = todayIsoDate();
        const [profileResult, goalResult, integrationResult] = await Promise.all([
          supabase.from("profiles").select("goal").eq("id", userId).maybeSingle(),
          supabase.from("goal_plans")
            .select("id, primary_goal, goal_reason, target_weight_kg, weekly_rate_kg, protein_strategy, training_priority, calorie_floor, calorie_ceiling, macro_targets, adaptation_policy, status, updated_at")
            .eq("user_id", userId).eq("status", "active").maybeSingle(),
          supabase.from("integration_daily_summaries")
            .select("provider, summary_date, steps, active_calories, sleep_hours, stress_level, body_battery, recovery_label, workout_planned, raw_jsonb, updated_at")
            .eq("user_id", userId).eq("provider", "garmin").eq("summary_date", date).maybeSingle(),
        ]);
        const readError = profileResult.error ?? goalResult.error ?? integrationResult.error;
        if (readError) throw new Error(`Unable to load goal context: ${readError.message}`);
        if (cancelled || generation !== syncGeneration) return;
        hydrateGoalContextFromServer({
          goalPlan: goalResult.data
            ? mapGoalPlan(goalResult.data as GoalPlanRow)
            : buildDefaultGoalPlan({ goal: (profileResult.data?.goal as string | null | undefined) ?? undefined }),
          integrationSummary: integrationResult.data
            ? mapIntegrationSummary(integrationResult.data as IntegrationSummaryRow)
            : disconnectedSummary(),
        }, userId);
      } catch (error) {
        if (!cancelled && generation === syncGeneration) {
          reportGoalContextPersistenceError(
            `${error instanceof Error ? error.message : "Unable to load goal context."} Refresh to retry.`,
          );
        }
      }
    }

    const unsubscribe = subscribeAuthenticatedUserIds(
      supabase as unknown as Parameters<typeof subscribeAuthenticatedUserIds>[0],
      (userId) => { void syncUser(userId); },
    );
    return () => {
      cancelled = true;
      syncGeneration += 1;
      unsubscribe();
      configureSignedOutGoalContext();
    };
  }, []);

  if (!persistenceError) return null;
  return (
    <div
      role="alert"
      className="fixed bottom-40 right-4 z-50 max-w-sm rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm font-bold text-coral-800 shadow-e3"
    >
      {persistenceError}
    </div>
  );
}
