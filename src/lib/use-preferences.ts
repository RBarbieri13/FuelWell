"use client";

import { useSyncExternalStore } from "react";
import {
  PREVIEW_IDENTITY_SCOPE,
  preferenceStorageKey,
} from "@/lib/profile-preferences";
import { isPreviewHost } from "@/lib/preview-session";

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

type PreferenceWriter = (next: PreferenceState) => Promise<PreferenceState>;
type PreferenceOperation = {
  apply: (value: PreferenceState) => PreferenceState;
  resolve: (saved: boolean) => void;
  generation: number;
  scope: string;
};
type StoreMode = "preview" | "signed-in" | "signed-out";

const EMPTY: PreferenceState = { likes: [], dislikes: [], diets: [], allergies: [] };
const SERVER_SNAPSHOT: PreferenceState & {
  persistenceError: string | null;
  pending: boolean;
} = {
  ...EMPTY,
  persistenceError: null,
  pending: false,
};

function normalizeStoredAllergies(allergies: string[]): string[] {
  return allergies.filter((allergy) => allergy.trim().toLocaleLowerCase() !== "none");
}

function normalize(value: PreferenceState): PreferenceState {
  return {
    likes: [...value.likes],
    dislikes: [...value.dislikes],
    diets: [...value.diets],
    allergies: normalizeStoredAllergies(value.allergies),
  };
}

function loadPreview(): PreferenceState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(preferenceStorageKey(PREVIEW_IDENTITY_SCOPE));
    if (raw) return normalize({ ...EMPTY, ...(JSON.parse(raw) as Partial<PreferenceState>) });
  } catch {
    // Preview storage is best effort and never used for authenticated state.
  }
  return EMPTY;
}

function startsInPreview(): boolean {
  return typeof window !== "undefined" && isPreviewHost(window.location?.host);
}

let mode: StoreMode = startsInPreview() ? "preview" : "signed-out";
let activeScope = mode === "preview" ? PREVIEW_IDENTITY_SCOPE : "signed-out";
let acknowledgedState: PreferenceState = mode === "preview" ? loadPreview() : EMPTY;
let state: PreferenceState = acknowledgedState;
let persistenceError: string | null = null;
let writer: PreferenceWriter | null = null;
let processing = false;
let identityGeneration = 0;
const queue: PreferenceOperation[] = [];
let storeSnapshot: PreferenceState & { persistenceError: string | null; pending: boolean } = {
  ...state,
  persistenceError,
  pending: false,
};
const listeners = new Set<() => void>();

function notify() {
  storeSnapshot = { ...state, persistenceError, pending: processing || queue.length > 0 };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function replayPending() {
  state = queue.reduce((value, operation) => normalize(operation.apply(value)), acknowledgedState);
}

function persistPreview(next: PreferenceState) {
  state = normalize(next);
  acknowledgedState = state;
  persistenceError = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        preferenceStorageKey(PREVIEW_IDENTITY_SCOPE),
        JSON.stringify(state),
      );
    } catch {
      // Preview remains usable when browser storage is unavailable.
    }
  }
  notify();
}

async function processQueue() {
  if (processing || mode !== "signed-in" || !writer) return;
  processing = true;
  notify();
  while (queue.length > 0 && mode === "signed-in" && writer) {
    const operation = queue[0];
    const operationWriter = writer;
    const candidate = normalize(operation.apply(acknowledgedState));
    try {
      const saved = normalize(await operationWriter(candidate));
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        queue[0] !== operation
      ) break;
      acknowledgedState = saved;
      persistenceError = null;
      queue.shift();
      operation.resolve(true);
    } catch (error) {
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        queue[0] !== operation
      ) break;
      queue.shift();
      persistenceError = error instanceof Error
        ? `${error.message} Your preference change was rolled back. Try again.`
        : "Your preference change was not saved and was rolled back. Try again.";
      operation.resolve(false);
    }
    replayPending();
    notify();
  }
  processing = false;
  notify();
  if (queue.length > 0) void processQueue();
}

function enqueue(apply: (value: PreferenceState) => PreferenceState): Promise<boolean> {
  if (mode === "preview") {
    persistPreview(apply(state));
    return Promise.resolve(true);
  }
  if (mode !== "signed-in" || !writer) {
    persistenceError = "Sign in again before changing preferences.";
    notify();
    return Promise.resolve(false);
  }
  const result = new Promise<boolean>((resolve) => queue.push({
    apply,
    resolve,
    generation: identityGeneration,
    scope: activeScope,
  }));
  replayPending();
  persistenceError = null;
  notify();
  void processQueue();
  return result;
}

export function getPreferences(): PreferenceState {
  return state;
}

export function getPreferencesStoreSnapshot() {
  return storeSnapshot;
}

export function configurePreviewPreferences() {
  identityGeneration += 1;
  mode = "preview";
  activeScope = PREVIEW_IDENTITY_SCOPE;
  writer = null;
  queue.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = loadPreview();
  state = acknowledgedState;
  persistenceError = null;
  notify();
}

export function configureSignedOutPreferences() {
  identityGeneration += 1;
  mode = "signed-out";
  activeScope = "signed-out";
  writer = null;
  queue.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = EMPTY;
  state = EMPTY;
  persistenceError = null;
  notify();
}

export function configurePreferencesPersistence(scope: string, nextWriter: PreferenceWriter) {
  identityGeneration += 1;
  mode = "signed-in";
  activeScope = scope;
  writer = nextWriter;
  queue.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = EMPTY;
  state = EMPTY;
  persistenceError = null;
  notify();
}

export function hydratePreferencesFromServer(next: PreferenceState, expectedScope?: string) {
  if (mode !== "signed-in" || (expectedScope && expectedScope !== activeScope)) return;
  acknowledgedState = normalize(next);
  replayPending();
  persistenceError = null;
  notify();
}

export function acknowledgePreferencePatch(patch: Partial<PreferenceState>) {
  acknowledgedState = normalize({ ...acknowledgedState, ...patch });
  replayPending();
  notify();
}

export function reportPreferencesPersistenceError(message: string) {
  persistenceError = message;
  notify();
}

export function setPreferencesScope(scope: string) {
  if (scope === PREVIEW_IDENTITY_SCOPE) configurePreviewPreferences();
  else activeScope = scope;
}

export function clearPreferencesForUser(userId: string) {
  if (typeof window !== "undefined") {
    try {
      // Remove legacy per-user cache if one exists. Authenticated state is no
      // longer loaded from or written to this key.
      window.localStorage.removeItem(preferenceStorageKey(userId));
    } catch {
      // Cache cleanup must never prevent sign-out.
    }
  }
  if (activeScope === userId) configureSignedOutPreferences();
}

export function subscribePreferences(listener: () => void): () => void {
  return subscribe(listener);
}

export function mergePreferences(patch: Partial<PreferenceState>): Promise<boolean> {
  return enqueue((current) => ({
    ...current,
    ...patch,
    allergies: normalizeStoredAllergies(patch.allergies ?? current.allergies),
  }));
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export function toggleLike(id: string): Promise<boolean> {
  return enqueue((current) => ({
    ...current,
    likes: toggle(current.likes, id),
    dislikes: current.dislikes.filter((value) => value !== id),
  }));
}

export function toggleDislike(id: string): Promise<boolean> {
  return enqueue((current) => ({
    ...current,
    dislikes: toggle(current.dislikes, id),
    likes: current.likes.filter((value) => value !== id),
  }));
}

export function toggleDiet(id: DietFilter): Promise<boolean> {
  return enqueue((current) => ({ ...current, diets: toggle(current.diets, id) as DietFilter[] }));
}

export function usePreferences() {
  const current = useSyncExternalStore(
    subscribe,
    () => storeSnapshot,
    () => SERVER_SNAPSHOT,
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

export function rankByPreference<T>(
  items: T[],
  getId: (item: T) => string,
  prefs: Pick<PreferenceState, "likes" | "dislikes">,
): T[] {
  const weight = (item: T) => {
    const id = getId(item);
    if (prefs.likes.includes(id)) return -1;
    if (prefs.dislikes.includes(id)) return 1;
    return 0;
  };
  return items
    .map((item, index) => ({ item, index, weight: weight(item) }))
    .sort((a, b) => a.weight - b.weight || a.index - b.index)
    .map(({ item }) => item);
}
