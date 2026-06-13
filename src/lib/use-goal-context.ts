"use client";

import { useSyncExternalStore } from "react";
import {
  buildDefaultGoalPlan,
  buildPreviewGarminSummary,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import { SAMPLE_TARGETS, todayIsoDate } from "@/lib/fuelwell-data";

const GOAL_KEY = "fuelwell-goal-plan-v1";
const INTEGRATION_KEY = "fuelwell-integration-summary-v1";

type GoalStored = { plan: GoalPlan };
type IntegrationStored = { summary: IntegrationDailySummary };

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function initialGoal(): GoalPlan {
  return (
    readJson<GoalStored>(GOAL_KEY)?.plan ??
    buildDefaultGoalPlan({ goal: "lose", targets: SAMPLE_TARGETS })
  );
}

function initialIntegration(): IntegrationDailySummary {
  return (
    readJson<IntegrationStored>(INTEGRATION_KEY)?.summary ?? {
      provider: "garmin",
      status: "disconnected",
      date: todayIsoDate(),
      sourceLabel: "Garmin Connect",
      note: "Connect Garmin to use activity, sleep, and recovery context in meal guidance.",
    }
  );
}

let goalPlan = initialGoal();
let integrationSummary = initialIntegration();
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

export function setGoalPlan(plan: GoalPlan) {
  goalPlan = plan;
  try {
    window.localStorage.setItem(GOAL_KEY, JSON.stringify({ plan } satisfies GoalStored));
  } catch {
    // best effort
  }
  notify();
}

export function setIntegrationSummary(summary: IntegrationDailySummary) {
  integrationSummary = summary;
  try {
    window.localStorage.setItem(
      INTEGRATION_KEY,
      JSON.stringify({ summary } satisfies IntegrationStored)
    );
  } catch {
    // best effort
  }
  notify();
}

export function enablePreviewGarminSummary() {
  setIntegrationSummary(buildPreviewGarminSummary(todayIsoDate()));
}

export function disconnectIntegrationSummary() {
  setIntegrationSummary({
    provider: "garmin",
    status: "disconnected",
    date: todayIsoDate(),
    sourceLabel: "Garmin Connect",
    note: "Connect Garmin to use activity, sleep, and recovery context in meal guidance.",
  });
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
