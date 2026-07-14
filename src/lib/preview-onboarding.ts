"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MacroTargets } from "@/lib/fuelwell-data";

/**
 * Completed-intake override written by the onboarding quiz in preview
 * runtimes. Every preview surface that shows profile-derived values (name,
 * goal, targets) must read through this so the quiz visibly takes effect.
 */
export const PREVIEW_COMPLETED_STORAGE_KEY = "fuelwell:new-user-onboarding:v1";
const CHANGE_EVENT = "fuelwell:preview-onboarding-change";

export type PreviewOnboardingOverride = {
  completedAt?: string;
  data?: {
    displayName?: string;
    dateOfBirth?: string;
    goal?: string;
    activityLevel?: string;
    dietaryPreference?: string;
    allergies?: string[];
    dietTastes?: string[];
    favoriteExerciseMethods?: string[];
    heightIn?: number | "";
    weightLb?: number | "";
  };
  macros?: Partial<MacroTargets>;
};

export function readPreviewOnboardingOverride(): PreviewOnboardingOverride | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREVIEW_COMPLETED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PreviewOnboardingOverride) : null;
  } catch {
    return null;
  }
}

export function writePreviewOnboardingOverride(value: PreviewOnboardingOverride) {
  window.localStorage.setItem(PREVIEW_COMPLETED_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(PREVIEW_COMPLETED_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

export function usePreviewOnboardingOverride(): PreviewOnboardingOverride | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as PreviewOnboardingOverride) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
