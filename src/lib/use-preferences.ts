"use client";

/**
 * usePreferences — persisted food/recipe preferences (meeting decision
 * 2026-06-09: like/dislike, diet filters, allergy-aware).
 *
 * Likes and dislikes are stored as id lists in localStorage. Diet filters and
 * allergies drive list filtering. Built on a module-level store +
 * useSyncExternalStore so Log and Recipes share one preference brain and stay
 * in sync. Helpers let any list downrank disliked items and hide allergens.
 */

import { useSyncExternalStore } from "react";
import {
  PREVIEW_IDENTITY_SCOPE,
  preferenceStorageKey,
} from "@/lib/profile-preferences";

export type DietFilter = "high-protein" | "low-carb" | "low-fat" | "vegan";

export const DIET_FILTERS: { id: DietFilter; label: string }[] = [
  { id: "high-protein", label: "High protein" },
  { id: "low-carb", label: "Low carb" },
  { id: "low-fat", label: "Low fat" },
  { id: "vegan", label: "Vegan" },
];

export type PreferenceState = {
  likes: string[];
  dislikes: string[];
  diets: DietFilter[];
  allergies: string[];
};

const EMPTY: PreferenceState = { likes: [], dislikes: [], diets: [], allergies: [] };

function loadInitial(scope: string): PreferenceState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(preferenceStorageKey(scope));
    if (raw) {
      const loaded = { ...EMPTY, ...(JSON.parse(raw) as Partial<PreferenceState>) };
      return { ...loaded, allergies: normalizeStoredAllergies(loaded.allergies) };
    }
  } catch {
    // fall through
  }
  return EMPTY;
}

let activeScope = PREVIEW_IDENTITY_SCOPE;
let state: PreferenceState = loadInitial(activeScope);
const listeners = new Set<() => void>();

function persist(next: PreferenceState) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(preferenceStorageKey(activeScope), JSON.stringify(next));
    } catch {
      // best-effort
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current state, for non-React consumers (server sync, coach store). */
export function getPreferences(): PreferenceState {
  return state;
}

export function setPreferencesScope(scope: string) {
  if (scope === activeScope) return;
  activeScope = scope;
  state = loadInitial(scope);
  listeners.forEach((listener) => listener());
}

export function clearPreferencesForUser(userId: string) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(preferenceStorageKey(userId));
    } catch {
      // Cache cleanup must never prevent sign-out.
    }
  }
  if (activeScope === userId) {
    activeScope = PREVIEW_IDENTITY_SCOPE;
    state = loadInitial(activeScope);
    listeners.forEach((listener) => listener());
  }
}

/** Subscribe outside React (server sync). Returns an unsubscribe fn. */
export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Merge a partial state into the store (server hydration on sign-in, or a
 * coach set_preferences mutation). Persists and notifies like any toggle.
 */
export function mergePreferences(patch: Partial<PreferenceState>) {
  persist({
    ...state,
    ...patch,
    allergies: normalizeStoredAllergies(patch.allergies ?? state.allergies),
  });
}

function normalizeStoredAllergies(allergies: string[]): string[] {
  return allergies.filter((allergy) => allergy.trim().toLocaleLowerCase() !== "none");
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleLike(id: string) {
  persist({
    ...state,
    likes: toggle(state.likes, id),
    dislikes: state.dislikes.filter((x) => x !== id),
  });
}

export function toggleDislike(id: string) {
  persist({
    ...state,
    dislikes: toggle(state.dislikes, id),
    likes: state.likes.filter((x) => x !== id),
  });
}

export function toggleDiet(id: DietFilter) {
  persist({ ...state, diets: toggle(state.diets, id) as DietFilter[] });
}

/**
 * usePreferences — reactive view of the shared preference store plus mutators.
 */
export function usePreferences() {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY
  );

  return {
    ...current,
    toggleLike,
    toggleDislike,
    toggleDiet,
    isLiked: (id: string) => current.likes.includes(id),
    isDisliked: (id: string) => current.dislikes.includes(id),
  };
}

/**
 * rankByPreference — sort a list so liked items rise and disliked items sink,
 * preserving original order within each tier. Pure; UI-agnostic.
 */
export function rankByPreference<T>(
  items: T[],
  getId: (item: T) => string,
  prefs: Pick<PreferenceState, "likes" | "dislikes">
): T[] {
  const weight = (item: T) => {
    const id = getId(item);
    if (prefs.likes.includes(id)) return -1;
    if (prefs.dislikes.includes(id)) return 1;
    return 0;
  };
  return items
    .map((item, index) => ({ item, index, w: weight(item) }))
    .sort((a, b) => a.w - b.w || a.index - b.index)
    .map((x) => x.item);
}
