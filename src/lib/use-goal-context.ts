"use client";

import { useSyncExternalStore } from "react";
import {
  buildDefaultGoalPlan,
  buildPreviewGarminSummary,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import { todayIsoDate } from "@/lib/fuelwell-data";

type GoalStored = { plan: GoalPlan };
type IntegrationStored = { summary: IntegrationDailySummary };

const GOAL_KEY_PREFIX = "fuelwell-goal-plan-v1";
const INTEGRATION_KEY_PREFIX = "fuelwell-integration-summary-v1";
const GOAL_CONTEXT_PREVIEW_SCOPE = "preview";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function goalPlanStorageKey(scope: string): string {
  return `${GOAL_KEY_PREFIX}:${scope}`;
}

export function integrationSummaryStorageKey(scope: string): string {
  return `${INTEGRATION_KEY_PREFIX}:${scope}`;
}

function disconnectedIntegrationSummary(): IntegrationDailySummary {
  return {
    provider: "garmin",
    status: "disconnected",
    date: todayIsoDate(),
    sourceLabel: "Garmin Connect",
    note: "Connect Garmin to use activity, sleep, and recovery context in meal guidance.",
  };
}

function loadInitialGoal(scope: string): GoalPlan {
  return (
    readJson<GoalStored>(goalPlanStorageKey(scope))?.plan ??
    buildDefaultGoalPlan({ goal: "lose" })
  );
}

function loadInitialIntegration(scope: string): IntegrationDailySummary {
  return readJson<IntegrationStored>(integrationSummaryStorageKey(scope))?.summary ??
    disconnectedIntegrationSummary();
}

let activeScope = GOAL_CONTEXT_PREVIEW_SCOPE;
let goalPlan = loadInitialGoal(activeScope);
let integrationSummary = loadInitialIntegration(activeScope);
let storeSnapshot = { goalPlan, integrationSummary };
const listeners = new Set<() => void>();

function notify() {
  storeSnapshot = { goalPlan, integrationSummary };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persistGoalPlan(scope: string, plan: GoalPlan) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(goalPlanStorageKey(scope), JSON.stringify({ plan } satisfies GoalStored));
  } catch {
    // best effort
  }
}

function persistIntegrationSummary(scope: string, summary: IntegrationDailySummary) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      integrationSummaryStorageKey(scope),
      JSON.stringify({ summary } satisfies IntegrationStored)
    );
  } catch {
    // best effort
  }
}

export function setGoalPlan(plan: GoalPlan) {
  goalPlan = plan;
  persistGoalPlan(activeScope, plan);
  notify();
}

export function setIntegrationSummary(summary: IntegrationDailySummary) {
  integrationSummary = summary;
  persistIntegrationSummary(activeScope, summary);
  notify();
}

export function enablePreviewGarminSummary() {
  setIntegrationSummary(buildPreviewGarminSummary(todayIsoDate()));
}

export function disconnectIntegrationSummary() {
  setIntegrationSummary(disconnectedIntegrationSummary());
}

export function getGoalContextSnapshot() {
  return storeSnapshot;
}

export function setGoalContextScope(scope: string) {
  const nextScope = scope || GOAL_CONTEXT_PREVIEW_SCOPE;
  if (nextScope === activeScope) return;
  activeScope = nextScope;
  goalPlan = loadInitialGoal(activeScope);
  integrationSummary = loadInitialIntegration(activeScope);
  notify();
}

export function clearGoalContextForUser(userId: string) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(goalPlanStorageKey(userId));
      window.localStorage.removeItem(integrationSummaryStorageKey(userId));
    } catch {
      // Cache cleanup must never prevent sign-out.
    }
  }

  if (activeScope === userId) {
    activeScope = GOAL_CONTEXT_PREVIEW_SCOPE;
    goalPlan = loadInitialGoal(activeScope);
    integrationSummary = loadInitialIntegration(activeScope);
    notify();
  }
}

export function useGoalContextStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => storeSnapshot,
    () => storeSnapshot
  );

  return {
    goalPlan: snapshot.goalPlan,
    integrationSummary: snapshot.integrationSummary,
    setGoalPlan,
    setIntegrationSummary,
    enablePreviewGarminSummary,
    disconnectIntegrationSummary,
  };
}
