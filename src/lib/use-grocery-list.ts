"use client";

/**
 * Shared persisted grocery list. The Grocery page previously held ephemeral
 * useState; this store gives Coach and the page one source of truth.
 * Items keep the page's rich shape (amount/category/source); Coach mutations
 * carry the compact {id,name,checked} shape and are reconciled by id so rich
 * fields survive.
 */

import { useSyncExternalStore } from "react";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import type { GroceryItem as CoachGroceryItem } from "@/lib/coach/types";

export type GroceryCategory = "Protein" | "Produce" | "Pantry" | "Dairy" | "Frozen" | "Other";

export type RichGroceryItem = {
  id: string;
  name: string;
  amount: string;
  category: GroceryCategory;
  source: string;
  checked: boolean;
  servingSize?: string;
  classification?: string;
  vitaminBenefit?: string;
  quantity?: string;
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

export function inferGroceryDetails(
  name: string,
  amount: string,
  category: GroceryCategory = "Other"
): Pick<RichGroceryItem, "servingSize" | "classification" | "vitaminBenefit" | "quantity"> {
  const lower = name.toLowerCase();
  const quantity = amount.trim() || "1 item";
  const servingSize =
    lower.includes("yogurt") || lower.includes("cottage")
      ? "3/4 cup"
      : lower.includes("salmon") || lower.includes("turkey") || lower.includes("chicken")
        ? "4-6 oz cooked"
        : lower.includes("berries") || lower.includes("spinach") || lower.includes("broccoli")
          ? "1 cup"
          : lower.includes("quinoa") || lower.includes("rice") || lower.includes("oats")
            ? "1/2 cup cooked"
            : "1 serving";
  const classification =
    category === "Protein"
      ? "protein anchor"
      : category === "Produce"
        ? "produce + micronutrients"
        : category === "Dairy"
          ? "calcium + protein"
          : category === "Pantry"
            ? "staple carb or backup"
            : category === "Frozen"
              ? "backup produce"
              : "general grocery";
  const vitaminBenefit =
    lower.includes("spinach") || lower.includes("greens")
      ? "vitamin K, folate, magnesium"
      : lower.includes("berries")
        ? "vitamin C, polyphenols"
        : lower.includes("sweet potato")
          ? "vitamin A, potassium"
          : lower.includes("broccoli")
            ? "vitamin C, fiber"
            : category === "Protein"
              ? "iron, B vitamins, satiety"
              : category === "Dairy"
                ? "calcium, vitamin B12"
                : "supports meal-plan consistency";
  return { servingSize, classification, vitaminBenefit, quantity };
}

function enrichItem(item: RichGroceryItem): RichGroceryItem {
  const normalized = normalizeGroceryInput(item.name, item.quantity ?? item.amount);
  const amount = normalized.quantity ?? item.amount;
  const inferred = inferGroceryDetails(normalized.name, amount, item.category);
  return {
    ...item,
    name: normalized.name,
    amount,
    servingSize: item.servingSize ?? inferred.servingSize,
    classification: item.classification ?? inferred.classification,
    vitaminBenefit: item.vitaminBenefit ?? inferred.vitaminBenefit,
    quantity: normalized.quantity ?? item.quantity ?? inferred.quantity,
  };
}

function loadInitial(): RichGroceryItem[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RichGroceryItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(enrichItem);
    }
  } catch {
    // fall through
  }
  return SEED.map(enrichItem);
}

let items: RichGroceryItem[] = loadInitial();
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: RichGroceryItem[] = SEED.map(enrichItem);

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
      const normalized = normalizeGroceryInput(c.name, c.quantity ?? existing?.quantity ?? existing?.amount);
      const quantityPatch = normalized.quantity
        ? { amount: normalized.quantity, quantity: normalized.quantity }
        : {};
      return existing
        ? {
            ...existing,
            name: normalized.name,
            ...quantityPatch,
            checked: c.checked,
          }
        : enrichItem({
            id: c.id,
            name: normalized.name,
            amount: normalized.quantity ?? "1 item",
            category: "Other" as const,
            source: "Coach",
            checked: c.checked,
            ...(normalized.quantity ? { quantity: normalized.quantity } : {}),
          });
    })
  );
}

export function toCoachGrocery(rich: RichGroceryItem[]): CoachGroceryItem[] {
  return rich.map(({ id, name, checked, quantity, amount }) => {
    const normalized = normalizeGroceryInput(name, quantity ?? amount);
    return {
      id,
      name: normalized.name,
      checked,
      quantity: normalized.quantity ?? quantity ?? amount,
    };
  });
}

export function useGroceryList() {
  const current = useSyncExternalStore(subscribe, () => items, () => SERVER_SNAPSHOT);
  return { items: current, setGroceryItems, applyCoachGrocery };
}
