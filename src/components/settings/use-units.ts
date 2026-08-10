"use client";

import { useSyncExternalStore } from "react";
import { isPreviewHost } from "@/lib/preview-session";

const PREVIEW_STORAGE_KEY = "fuelwell-units-v2:preview";
export type UnitSystem = "metric" | "imperial";
type UnitWriter = (next: UnitSystem) => Promise<UnitSystem>;
type StoreMode = "preview" | "signed-in" | "signed-out";

const DEFAULT: UnitSystem = "metric";
const SERVER_SNAPSHOT: {
  units: UnitSystem;
  persistenceError: string | null;
  pending: boolean;
} = {
  units: DEFAULT,
  persistenceError: null,
  pending: false,
};

function loadPreview(): UnitSystem {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const value = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (value === "metric" || value === "imperial") return value;
  } catch {
    // Preview storage is best effort.
  }
  return DEFAULT;
}

const startsPreview = typeof window !== "undefined" && isPreviewHost(window.location?.host);
let mode: StoreMode = startsPreview ? "preview" : "signed-out";
let acknowledgedState: UnitSystem = startsPreview ? loadPreview() : DEFAULT;
let state = acknowledgedState;
let writer: UnitWriter | null = null;
let activeScope = startsPreview ? "preview" : "signed-out";
let identityGeneration = 0;
let persistenceError: string | null = null;
const pending: Array<{
  next: UnitSystem;
  resolve: (saved: boolean) => void;
  generation: number;
  scope: string;
}> = [];
let processing = false;
let snapshot: { units: UnitSystem; persistenceError: string | null; pending: boolean } = {
  units: state,
  persistenceError,
  pending: false,
};
const listeners = new Set<() => void>();

function notify() {
  snapshot = { units: state, persistenceError, pending: processing || pending.length > 0 };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function previewWrite(next: UnitSystem) {
  state = next;
  acknowledgedState = next;
  persistenceError = null;
  try {
    window.localStorage.setItem(PREVIEW_STORAGE_KEY, next);
  } catch {
    // Preview remains usable without storage.
  }
  notify();
}

async function processQueue() {
  if (processing || mode !== "signed-in" || !writer) return;
  processing = true;
  notify();
  while (pending.length > 0 && mode === "signed-in" && writer) {
    const operation = pending[0];
    const operationWriter = writer;
    try {
      const saved = await operationWriter(operation.next);
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        pending[0] !== operation
      ) break;
      acknowledgedState = saved;
      persistenceError = null;
      pending.shift();
      operation.resolve(true);
    } catch (error) {
      if (
        operation.generation !== identityGeneration ||
        operation.scope !== activeScope ||
        pending[0] !== operation
      ) break;
      pending.shift();
      persistenceError = error instanceof Error
        ? `${error.message} Your unit change was rolled back. Try again.`
        : "Your unit change was rolled back. Try again.";
      operation.resolve(false);
    }
    state = pending.at(-1)?.next ?? acknowledgedState;
    notify();
  }
  processing = false;
  notify();
  if (pending.length > 0) void processQueue();
}

export function setUnits(next: UnitSystem): Promise<boolean> {
  if (mode === "preview") {
    previewWrite(next);
    return Promise.resolve(true);
  }
  if (mode !== "signed-in" || !writer) {
    persistenceError = "Sign in again before changing units.";
    notify();
    return Promise.resolve(false);
  }
  const result = new Promise<boolean>((resolve) => pending.push({
    next,
    resolve,
    generation: identityGeneration,
    scope: activeScope,
  }));
  state = next;
  persistenceError = null;
  notify();
  void processQueue();
  return result;
}

export function getUnitsSnapshot() {
  return snapshot;
}

export function configurePreviewUnits() {
  identityGeneration += 1;
  mode = "preview";
  activeScope = "preview";
  writer = null;
  pending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = loadPreview();
  state = acknowledgedState;
  persistenceError = null;
  notify();
}

export function configureSignedOutUnits() {
  identityGeneration += 1;
  mode = "signed-out";
  activeScope = "signed-out";
  writer = null;
  pending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = DEFAULT;
  state = DEFAULT;
  persistenceError = null;
  notify();
}

export function configureUnitsPersistence(scope: string, nextWriter: UnitWriter) {
  identityGeneration += 1;
  mode = "signed-in";
  activeScope = scope;
  writer = nextWriter;
  pending.splice(0).forEach((operation) => operation.resolve(false));
  acknowledgedState = DEFAULT;
  state = DEFAULT;
  persistenceError = null;
  notify();
}

export function hydrateUnitsFromServer(next: UnitSystem, expectedScope?: string) {
  if (mode !== "signed-in" || (expectedScope && expectedScope !== activeScope)) return;
  acknowledgedState = next;
  state = pending.at(-1)?.next ?? next;
  persistenceError = null;
  notify();
}

export function reportUnitsPersistenceError(message: string) {
  persistenceError = message;
  notify();
}

export function useUnits() {
  const current = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );
  return { ...current, setUnits };
}
