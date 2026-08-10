"use client";

import { useEffect, useSyncExternalStore } from "react";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import type { GroceryItem as CoachGroceryItem } from "@/lib/coach/types";
import { todayIsoDate } from "@/lib/fuelwell-data";
import type { IdentityScope } from "@/lib/use-day-log";

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

export type GroceryPersistence = {
  mode: "unknown" | "preview" | "authenticated" | "anonymous";
  status: "idle" | "loading" | "saving" | "saved" | "error";
  userId: string | null;
  error: string | null;
};

export type GroceryMutationResult =
  | { ok: true; value: RichGroceryItem[] }
  | { ok: false; error: string };

type GrocerySnapshot = {
  items: RichGroceryItem[];
  persistence: GroceryPersistence;
};

type GroceryResponse = {
  signedIn: boolean;
  userId?: string;
  date?: string;
  items: RichGroceryItem[];
  error?: string;
};

const PREVIEW_CACHE_PREFIX = "fuelwell-grocery-preview-v2";
const USER_CACHE_PREFIX = "fuelwell-grocery-user-v2";
const LEGACY_CACHE_KEY = "fuelwell-grocery-list-v1";
const date = todayIsoDate();

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
  category: GroceryCategory = "Other",
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

export function inferGroceryCategory(name: string): GroceryCategory {
  const lower = name.toLowerCase();
  if (/chicken|turkey|salmon|beef|pork|shrimp|tuna|egg|tofu|tempeh|protein/.test(lower)) return "Protein";
  if (/spinach|broccoli|berry|berries|apple|banana|greens|potato|tomato|pepper|lettuce|orange|carrot|cucumber|avocado/.test(lower)) return "Produce";
  if (/yogurt|milk|cheese|cottage|skyr|kefir/.test(lower)) return "Dairy";
  if (/frozen|ice/.test(lower)) return "Frozen";
  if (/rice|quinoa|oat|pasta|tortilla|bean|bread|granola|cereal|lentil|flour/.test(lower)) return "Pantry";
  return "Other";
}

function enrichItem(item: RichGroceryItem): RichGroceryItem {
  const normalized = normalizeGroceryInput(item.name, item.quantity ?? item.amount);
  const amount = normalized.quantity ?? (item.amount.trim() || "1 item");
  const inferred = inferGroceryDetails(normalized.name, amount, item.category);
  return {
    ...item,
    name: normalized.name,
    amount,
    servingSize: item.servingSize ?? inferred.servingSize,
    classification: item.classification ?? inferred.classification,
    vitaminBenefit: item.vitaminBenefit ?? inferred.vitaminBenefit,
    quantity: amount,
  };
}

const SERVER_ITEMS = SEED.map(enrichItem);
let snapshot: GrocerySnapshot = {
  items: SERVER_ITEMS,
  persistence: { mode: "unknown", status: "idle", userId: null, error: null },
};
const serverSnapshot = snapshot;
const listeners = new Set<() => void>();
const idAliases = new Map<string, string>();
let initialized = false;
let activeIdentity: IdentityScope | null = null;
let identityGeneration = 0;
let initializedIdentityKey: string | null = null;
let initializePromise: Promise<boolean> | null = null;
let initializePromiseKey: string | null = null;
let mutationQueue: Promise<void> = Promise.resolve();

function previewCacheKey() {
  return `${PREVIEW_CACHE_PREFIX}:${date}`;
}

function userCacheKey(userId: string) {
  return `${USER_CACHE_PREFIX}:${userId}:${date}`;
}

function identityKey(identity: IdentityScope | null) {
  if (!identity) return "unknown";
  return identity.mode === "authenticated"
    ? `authenticated:${identity.userId}`
    : identity.mode;
}

function responseMatchesIdentity(body: GroceryResponse, identity: IdentityScope | null) {
  if (!identity) return true;
  if (identity.mode === "authenticated") {
    return body.signedIn && body.userId === identity.userId;
  }
  return !body.signedIn;
}

function adoptResponseIdentity(body: GroceryResponse) {
  if (activeIdentity) return;
  activeIdentity = body.signedIn && body.userId
    ? { mode: "authenticated", userId: body.userId }
    : { mode: "preview" };
}

function readCache(key: string): RichGroceryItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as unknown;
    return Array.isArray(parsed) ? (parsed as RichGroceryItem[]).map(enrichItem) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, items: RichGroceryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function setSnapshot(items: RichGroceryItem[], patch: Partial<GroceryPersistence>) {
  snapshot = {
    items: items.map(enrichItem),
    persistence: { ...snapshot.persistence, ...patch },
  };
  listeners.forEach((listener) => listener());
}

export function resetGroceryListForIdentity(identity: IdentityScope) {
  if (identityKey(activeIdentity) === identityKey(identity)) return;
  activeIdentity = identity;
  identityGeneration += 1;
  initialized = false;
  initializedIdentityKey = null;
  initializePromise = null;
  initializePromiseKey = null;
  mutationQueue = Promise.resolve();
  idAliases.clear();
  setSnapshot([], {
    mode: "unknown",
    status: "idle",
    userId: identity.mode === "authenticated" ? identity.userId : null,
    error: null,
  });
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Grocery list request failed.";
}

async function readResponse(response: Response): Promise<GroceryResponse> {
  const body = (await response.json()) as GroceryResponse;
  if (!response.ok) throw new Error(body.error || "Grocery list request failed.");
  return body;
}

export function getGrocerySnapshot() {
  return snapshot;
}

export async function initializeGroceryList() {
  const requestKey = identityKey(activeIdentity);
  if (initialized && initializedIdentityKey === requestKey) return true;
  if (initializePromise && initializePromiseKey === requestKey) return initializePromise;
  const requestGeneration = identityGeneration;
  const requestIdentity = activeIdentity;
  const request = (async () => {
    setSnapshot(snapshot.items, { status: "loading", error: null });
    try {
      const body = await readResponse(await fetch(`/api/grocery-list?date=${date}`));
      if (requestGeneration !== identityGeneration) return false;
      if (!responseMatchesIdentity(body, requestIdentity)) {
        throw new Error("Grocery response did not match the active account.");
      }
      adoptResponseIdentity(body);
      if (body.signedIn && body.userId) {
        const items = body.items.map(enrichItem);
        writeCache(userCacheKey(body.userId), items);
        setSnapshot(items, {
          mode: "authenticated",
          status: "saved",
          userId: body.userId,
          error: null,
        });
      } else {
        const isPreview = activeIdentity?.mode !== "anonymous";
        const signedOutItems = isPreview
          ? readCache(previewCacheKey()) ?? readCache(LEGACY_CACHE_KEY) ?? SERVER_ITEMS
          : [];
        if (isPreview) writeCache(previewCacheKey(), signedOutItems);
        setSnapshot(signedOutItems, {
          mode: isPreview ? "preview" : "anonymous",
          status: "saved",
          userId: null,
          error: null,
        });
      }
      initialized = true;
      initializedIdentityKey = identityKey(activeIdentity);
      return true;
    } catch (error) {
      if (requestGeneration !== identityGeneration) return false;
      setSnapshot(snapshot.items, { status: "error", error: errorText(error) });
      return false;
    }
  })();
  initializePromise = request;
  initializePromiseKey = requestKey;
  void request.then(
    () => {
      if (initializePromise === request) {
        initializePromise = null;
        initializePromiseKey = null;
      }
    },
    () => {
      if (initializePromise === request) {
        initializePromise = null;
        initializePromiseKey = null;
      }
    },
  );
  return request;
}

function normalizeId(id: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const existing = idAliases.get(id);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  idAliases.set(id, generated);
  return generated;
}

function normalizeItems(items: RichGroceryItem[]) {
  const byName = new Map<string, RichGroceryItem>();
  for (const candidate of items) {
    const item = enrichItem({ ...candidate, id: normalizeId(candidate.id) });
    const key = item.name.toLocaleLowerCase();
    const existing = byName.get(key);
    byName.set(key, existing ? { ...existing, ...item, id: existing.id } : item);
  }
  return [...byName.values()];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function enqueue(operation: () => Promise<GroceryMutationResult>) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

export function setGroceryItems(next: RichGroceryItem[]): Promise<GroceryMutationResult> {
  const queuedGeneration = identityGeneration;
  return enqueue(async () => {
    if (queuedGeneration !== identityGeneration) {
      return { ok: false, error: "The active account changed before the grocery list was saved." };
    }
    if (!(await initializeGroceryList())) {
      return { ok: false, error: snapshot.persistence.error || "Grocery list did not initialize." };
    }
    if (queuedGeneration !== identityGeneration) {
      return { ok: false, error: "The active account changed before the grocery list was saved." };
    }
    const operationGeneration = queuedGeneration;
    const operationUserId = snapshot.persistence.userId;
    const before = snapshot.items;
    const normalized = normalizeItems(next);
    setSnapshot(normalized, { status: "saving", error: null });

    if (snapshot.persistence.mode === "preview") {
      writeCache(previewCacheKey(), normalized);
      setSnapshot(normalized, { status: "saved", error: null });
      return { ok: true, value: normalized };
    }
    if (snapshot.persistence.mode !== "authenticated" || !snapshot.persistence.userId) {
      const message = "Authentication state is unknown; grocery list was not persisted.";
      setSnapshot(before, { status: "error", error: message });
      return { ok: false, error: message };
    }

    try {
      const body = await readResponse(await fetch("/api/grocery-list", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, items: normalized }),
      }));
      if (operationGeneration !== identityGeneration) {
        return { ok: false, error: "The active account changed before the grocery list was saved." };
      }
      if (!body.signedIn || body.userId !== operationUserId) {
        throw new Error("Authenticated grocery response did not match the current user.");
      }
      const saved = body.items.map(enrichItem);
      writeCache(userCacheKey(body.userId), saved);
      setSnapshot(saved, { status: "saved", error: null });
      return { ok: true, value: saved };
    } catch (error) {
      const message = errorText(error);
      if (operationGeneration !== identityGeneration) {
        return { ok: false, error: "The active account changed before the grocery list was saved." };
      }
      setSnapshot(before, { status: "error", error: message });
      return { ok: false, error: message };
    }
  });
}

export function applyCoachGrocery(compact: CoachGroceryItem[]) {
  const byId = new Map(snapshot.items.map((item) => [item.id, item]));
  return setGroceryItems(compact.map((candidate) => {
    const existing = byId.get(candidate.id);
    const normalized = normalizeGroceryInput(
      candidate.name,
      candidate.quantity ?? existing?.quantity ?? existing?.amount,
    );
    const amount = normalized.quantity ?? existing?.amount ?? "1 item";
    return existing
      ? { ...existing, name: normalized.name, amount, quantity: amount, checked: candidate.checked }
      : {
          id: candidate.id,
          name: normalized.name,
          amount,
          quantity: amount,
          category: "Other",
          source: "Coach",
          checked: candidate.checked,
        };
  }));
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
  useEffect(() => {
    void initializeGroceryList();
  }, []);
  const current = useSyncExternalStore(subscribe, getGrocerySnapshot, () => serverSnapshot);
  return {
    items: current.items,
    persistence: current.persistence,
    setGroceryItems,
    applyCoachGrocery,
  };
}
