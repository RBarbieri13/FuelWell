"use client";

/**
 * Shared persisted grocery list. The Grocery page previously held ephemeral
 * useState; this store gives Coach and the page one source of truth.
 * Items keep the page's rich shape (amount/category/source); Coach mutations
 * carry the compact {id,name,checked} shape and are reconciled by id so rich
 * fields survive.
 */

import { useSyncExternalStore } from "react";
import type { GroceryItem as CoachGroceryItem } from "@/lib/coach/types";

export type GroceryCategory = "Protein" | "Produce" | "Pantry" | "Dairy" | "Frozen" | "Other";

export type RichGroceryItem = {
  id: string;
  name: string;
  amount: string;
  category: GroceryCategory;
  source: string;
  checked: boolean;
};

const STORAGE_KEY = "fuelwell-grocery-list-v1";

/** Same seed the Grocery page shipped with pre-store, so nothing visually changes. */
const SEED: RichGroceryItem[] = [
  { id: "turkey", name: "Lean ground turkey", amount: "1.5 lb", category: "Protein", source: "Turkey Quinoa Bowl", checked: false },
  { id: "salmon", name: "Salmon fillets", amount: "2 portions", category: "Protein", source: "Salmon Dinner", checked: false },
  { id: "greek-yogurt", name: "Plain Greek yogurt", amount: "32 oz", category: "Dairy", source: "Yogurt Berry Crunch", checked: true },
  { id: "eggs", name: "Liquid egg whites", amount: "16 oz", category: "Dairy", source: "Breakfast Wrap", checked: false },
  { id: "sweet-potatoes", name: "Sweet potatoes", amount: "3 medium", category: "Produce", source: "Salmon Dinner", checked: false },
  { id: "berries", name: "Blueberries", amount: "2 cups", category: "Produce", source: "Yogurt Berry Crunch", checked: true },
  { id: "greens", name: "Baby spinach", amount: "1 large box", category: "Produce", source: "Breakfast Wrap", checked: false },
  { id: "quinoa", name: "Quinoa", amount: "1 bag", category: "Pantry", source: "Turkey Quinoa Bowl", checked: false },
  { id: "tortillas", name: "High-fiber tortillas", amount: "1 pack", category: "Pantry", source: "Breakfast Wrap", checked: false },
  { id: "frozen-broccoli", name: "Frozen broccoli florets", amount: "1 bag", category: "Frozen", source: "Backup sides", checked: false },
];

function loadInitial(): RichGroceryItem[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RichGroceryItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through
  }
  return SEED;
}

let items: RichGroceryItem[] = loadInitial();
const listeners = new Set<() => void>();
const EMPTY: RichGroceryItem[] = [];

function persist(next: RichGroceryItem[]) {
  items = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

export function setGroceryItems(next: RichGroceryItem[]) {
  persist(next);
}

/** Apply a Coach set_grocery mutation: reconcile compact items against rich ones. */
export function applyCoachGrocery(compact: CoachGroceryItem[]) {
  const byId = new Map(items.map((i) => [i.id, i]));
  persist(
    compact.map((c) => {
      const existing = byId.get(c.id);
      return existing
        ? { ...existing, name: c.name, checked: c.checked }
        : { id: c.id, name: c.name, amount: "", category: "Other" as const, source: "Coach", checked: c.checked };
    })
  );
}

export function toCoachGrocery(rich: RichGroceryItem[]): CoachGroceryItem[] {
  return rich.map(({ id, name, checked }) => ({ id, name, checked }));
}

export function useGroceryList() {
  const current = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  return { items: current, setGroceryItems, applyCoachGrocery };
}
