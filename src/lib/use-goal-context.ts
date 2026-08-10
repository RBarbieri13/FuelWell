"use client";

import { useSyncExternalStore } from "react";
import {
  buildDefaultGoalPlan,
  buildPreviewGarminSummary,
  type GoalPlan,
  type IntegrationDailySummary,
} from "@/lib/goal-context";
import { todayIsoDate } from "@/lib/fuelwell-data";
import { isPreviewHost } from "@/lib/preview-session";

type GoalStored = { plan: GoalPlan };
type IntegrationStored = { summary: IntegrationDailySummary };
type GoalWriter = (plan: GoalPlan) => Promise<GoalPlan>;
type IntegrationWriter = (summary: IntegrationDailySummary) => Promise<IntegrationDailySummary>;
type StoreMode = "preview" | "signed-in" | "signed-out";

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

function previewGoal(): GoalPlan {
  return readJson<GoalStored>(goalPlanStorageKey(GOAL_CONTEXT_PREVIEW_SCOPE))?.plan ??
    buildDefaultGoalPlan({ goal: "lose" });
}

function previewIntegration(): IntegrationDailySummary {
  return readJson<IntegrationStored>(integrationSummaryStorageKey(GOAL_CONTEXT_PREVIEW_SCOPE))?.summary ??
    disconnectedIntegrationSummary();
}

const startsPreview = typeof window !== "undefined" && isPreviewHost(window.location?.host);
let mode: StoreMode = startsPreview ? "preview" : "signed-out";
let activeScope = startsPreview ? GOAL_CONTEXT_PREVIEW_SCOPE : "signed-out";
let acknowledgedGoal = startsPreview ? previewGoal() : buildDefaultGoalPlan({ goal: "lose" });
let acknowledgedIntegration = startsPreview ? previewIntegration() : disconnectedIntegrationSummary();
let goalPlan = acknowledgedGoal;
let integrationSummary = acknowledgedIntegration;
let persistenceError: string | null = null;
let goalWriter: GoalWriter | null = null;
let integrationWriter: IntegrationWriter | null = null;
let identityGeneration = 0;
const goalPending: Array<{
  value: GoalPlan;
  resolve: (saved: boolean) => void;
  generation: number;
  scope: string;
}> = [];
const integrationPending: Array<{
  value: IntegrationDailySummary;
  resolve: (saved: boolean) => void;
  generation: number;
  scope: string;
}> = [];
let goalProcessing = false;
let integrationProcessing = false;
let storeSnapshot: {
  goalPlan: GoalPlan;
  integrationSummary: IntegrationDailySummary;
  persistenceError: string | null;
  pending: boolean;
} = {
  goalPlan,
  integrationSummary,
  persistenceError,
  pending: false,
};
const listeners = new Set<() => void>();

function notify() {
  storeSnapshot = {
    goalPlan,
    integrationSummary,
    persistenceError,
    pending: goalProcessing || integrationProcessing || goalPending.length > 0 || integrationPending.length > 0,
  };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persistPreviewGoal(plan: GoalPlan) {
  try {
    window.localStorage.setItem(
      goalPlanStorageKey(GOAL_CONTEXT_PREVIEW_SCOPE),
      JSON.stringify({ plan } satisfies GoalStored),
    );
  } catch {
    // Preview remains usable without storage.
  }
}

function persistPreviewIntegration(summary: IntegrationDailySummary) {
  try {
    window.localStorage.setItem(
      integrationSummaryStorageKey(GOAL_CONTEXT_PREVIEW_SCOPE),
      JSON.stringify({ summary } satisfies IntegrationStored),
    );
  } catch {
    // Preview remains usable without storage.
  }
}

async function processGoals() {
  if (goalProcessing || mode !== "signed-in" || !goalWriter) return;
  goalProcessing = true;
  notify();
  while (goalPending.length > 0 && mode === "signed-in" && goalWriter) {
    const operation = goalPending[0];
    const operationWriter = goalWriter;
    try {
      const saved = await operationWriter(operation.value);
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        goalPending[0] !== operation
      ) break;
      acknowledgedGoal = saved;
      persistenceError = null;
      goalPending.shift();
      operation.resolve(true);
    } catch (error) {
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        goalPending[0] !== operation
      ) break;
      goalPending.shift();
      persistenceError = error instanceof Error
        ? `${error.message} Your goal change was rolled back. Try again.`
        : "Your goal change was rolled back. Try again.";
      operation.resolve(false);
    }
    goalPlan = goalPending.at(-1)?.value ?? acknowledgedGoal;
    notify();
  }
  goalProcessing = false;
  notify();
  if (goalPending.length > 0) void processGoals();
}

async function processIntegrations() {
  if (integrationProcessing || mode !== "signed-in" || !integrationWriter) return;
  integrationProcessing = true;
  notify();
  while (integrationPending.length > 0 && mode === "signed-in" && integrationWriter) {
    const operation = integrationPending[0];
    const operationWriter = integrationWriter;
    try {
      const saved = await operationWriter(operation.value);
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        integrationPending[0] !== operation
      ) break;
      acknowledgedIntegration = saved;
      persistenceError = null;
      integrationPending.shift();
      operation.resolve(true);
    } catch (error) {
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        integrationPending[0] !== operation
      ) break;
      integrationPending.shift();
      persistenceError = error instanceof Error
        ? `${error.message} Your integration change was rolled back. Try again.`
        : "Your integration change was rolled back. Try again.";
      operation.resolve(false);
    }
    integrationSummary = integrationPending.at(-1)?.value ?? acknowledgedIntegration;
    notify();
  }
  integrationProcessing = false;
  notify();
  if (integrationPending.length > 0) void processIntegrations();
}

export function setGoalPlan(plan: GoalPlan): Promise<boolean> {
  if (mode === "preview") {
    acknowledgedGoal = plan;
    goalPlan = plan;
    persistenceError = null;
    persistPreviewGoal(plan);
    notify();
    return Promise.resolve(true);
  }
  if (mode !== "signed-in" || !goalWriter) {
    persistenceError = "Sign in again before changing your goal plan.";
    notify();
    return Promise.resolve(false);
  }
  const result = new Promise<boolean>((resolve) => goalPending.push({
    value: plan,
    resolve,
    generation: identityGeneration,
    scope: activeScope,
  }));
  goalPlan = plan;
  persistenceError = null;
  notify();
  void processGoals();
  return result;
}

export function setIntegrationSummary(summary: IntegrationDailySummary): Promise<boolean> {
  if (mode === "preview") {
    acknowledgedIntegration = summary;
    integrationSummary = summary;
    persistenceError = null;
    persistPreviewIntegration(summary);
    notify();
    return Promise.resolve(true);
  }
  if (mode !== "signed-in" || !integrationWriter) {
    persistenceError = "Sign in again before changing integration data.";
    notify();
    return Promise.resolve(false);
  }
  const result = new Promise<boolean>((resolve) => integrationPending.push({
    value: summary,
    resolve,
    generation: identityGeneration,
    scope: activeScope,
  }));
  integrationSummary = summary;
  persistenceError = null;
  notify();
  void processIntegrations();
  return result;
}

export function enablePreviewGarminSummary() {
  return setIntegrationSummary(buildPreviewGarminSummary(todayIsoDate()));
}

export function disconnectIntegrationSummary() {
  return setIntegrationSummary(disconnectedIntegrationSummary());
}

export function getGoalContextSnapshot() {
  return storeSnapshot;
}

export function configurePreviewGoalContext() {
  identityGeneration += 1;
  mode = "preview";
  activeScope = GOAL_CONTEXT_PREVIEW_SCOPE;
  goalWriter = null;
  integrationWriter = null;
  goalPending.splice(0).forEach((operation) => operation.resolve(false));
  integrationPending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedGoal = previewGoal();
  acknowledgedIntegration = previewIntegration();
  goalPlan = acknowledgedGoal;
  integrationSummary = acknowledgedIntegration;
  persistenceError = null;
  notify();
}

export function configureSignedOutGoalContext() {
  identityGeneration += 1;
  mode = "signed-out";
  activeScope = "signed-out";
  goalWriter = null;
  integrationWriter = null;
  goalPending.splice(0).forEach((operation) => operation.resolve(false));
  integrationPending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedGoal = buildDefaultGoalPlan({ goal: "lose" });
  acknowledgedIntegration = disconnectedIntegrationSummary();
  goalPlan = acknowledgedGoal;
  integrationSummary = acknowledgedIntegration;
  persistenceError = null;
  notify();
}

export function configureGoalContextPersistence(
  scope: string,
  writers: { saveGoalPlan: GoalWriter; saveIntegrationSummary: IntegrationWriter },
) {
  identityGeneration += 1;
  mode = "signed-in";
  activeScope = scope;
  goalWriter = writers.saveGoalPlan;
  integrationWriter = writers.saveIntegrationSummary;
  goalPending.splice(0).forEach((operation) => operation.resolve(false));
  integrationPending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedGoal = buildDefaultGoalPlan({ goal: "lose" });
  acknowledgedIntegration = disconnectedIntegrationSummary();
  goalPlan = acknowledgedGoal;
  integrationSummary = acknowledgedIntegration;
  persistenceError = null;
  notify();
}

export function hydrateGoalContextFromServer(values: {
  goalPlan: GoalPlan;
  integrationSummary: IntegrationDailySummary;
}, expectedScope?: string) {
  if (mode !== "signed-in" || (expectedScope && expectedScope !== activeScope)) return;
  acknowledgedGoal = values.goalPlan;
  acknowledgedIntegration = values.integrationSummary;
  goalPlan = goalPending.at(-1)?.value ?? acknowledgedGoal;
  integrationSummary = integrationPending.at(-1)?.value ?? acknowledgedIntegration;
  persistenceError = null;
  notify();
}

export function acknowledgeGoalPlanFromServer(plan: GoalPlan) {
  acknowledgedGoal = plan;
  goalPlan = goalPending.at(-1)?.value ?? plan;
  notify();
}

export function acknowledgeIntegrationSummaryFromServer(summary: IntegrationDailySummary) {
  acknowledgedIntegration = summary;
  integrationSummary = integrationPending.at(-1)?.value ?? summary;
  notify();
}

export function reportGoalContextPersistenceError(message: string) {
  persistenceError = message;
  notify();
}

export function setGoalContextScope(scope: string) {
  if (scope === GOAL_CONTEXT_PREVIEW_SCOPE) configurePreviewGoalContext();
  else activeScope = scope;
}

export function clearGoalContextForUser(userId: string) {
  if (typeof window !== "undefined") {
    try {
      // Remove legacy user-scoped cache. Authenticated state never loads it.
      window.localStorage.removeItem(goalPlanStorageKey(userId));
      window.localStorage.removeItem(integrationSummaryStorageKey(userId));
    } catch {
      // Cache cleanup must never prevent sign-out.
    }
  }
  if (activeScope === userId) configureSignedOutGoalContext();
}

export function useGoalContextStore() {
  const current = useSyncExternalStore(subscribe, () => storeSnapshot, () => storeSnapshot);
  return {
    ...current,
    setGoalPlan,
    setIntegrationSummary,
    enablePreviewGarminSummary,
    disconnectIntegrationSummary,
  };
}
