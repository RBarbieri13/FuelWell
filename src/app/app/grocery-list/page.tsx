"use client";

import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  Beef,
  Carrot,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Circle,
  History,
  ListPlus,
  Milk,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Wheat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RECIPES } from "@/lib/recipes-data";
import { usePreferences } from "@/lib/use-preferences";
import { useMealPlan } from "@/lib/use-meal-plan";

import {
  useGroceryList,
  setGroceryItems,
  inferGroceryDetails,
  inferGroceryCategory,
  type GroceryCategory,
  type RichGroceryItem,
} from "@/lib/use-grocery-list";

const HISTORY_KEY = "fuelwell-grocery-history-v1";

type GroceryHistoryEntry = {
  id: string;
  savedAt: string;
  itemCount: number;
  checkedCount: number;
  items: RichGroceryItem[];
};

function loadGroceryHistory(): GroceryHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GroceryHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return [];
  }
}

/**
 * One tone + one glyph per aisle. Protein/Produce/Pantry/Dairy reuse the macro
 * hues the rest of the app already teaches (protein blue, carbs lemon, fat
 * coral), and every category carries an icon so the six groups stay separable
 * for anyone who cannot rely on hue alone.
 */
const categoryTone: Record<GroceryCategory, string> = {
  Protein: "bg-sky-50 text-sky-700 border-sky-100",
  Produce: "bg-primary-50 text-primary-800 border-primary-100",
  Pantry: "bg-lemon-50 text-lemon-700 border-lemon-200",
  Dairy: "bg-accent-50 text-accent-700 border-accent-100",
  Frozen: "bg-surface-sunken text-sky-700 border-hairline-strong",
  Other: "bg-surface-muted text-ink-muted border-hairline-strong",
};

const categoryIcon: Record<GroceryCategory, LucideIcon> = {
  Protein: Beef,
  Produce: Carrot,
  Pantry: Wheat,
  Dairy: Milk,
  Frozen: Snowflake,
  Other: ShoppingBasket,
};

/** Aisle order — roughly how a store is walked, so the list reads as a route. */
const CATEGORY_ORDER: GroceryCategory[] = [
  "Protein",
  "Produce",
  "Dairy",
  "Pantry",
  "Frozen",
  "Other",
];

const CATEGORY_OPTIONS: GroceryCategory[] = [
  "Protein",
  "Produce",
  "Pantry",
  "Dairy",
  "Frozen",
  "Other",
];

/** Groups the visible rows by aisle, dropping categories with nothing in them. */
function groupByCategory(rows: RichGroceryItem[]) {
  return CATEGORY_ORDER.map((category) => {
    const groupItems = rows.filter((item) => item.category === category);
    return {
      category,
      items: groupItems,
      checked: groupItems.filter((item) => item.checked).length,
    };
  }).filter((group) => group.items.length > 0);
}

export default function GroceryListPage() {
  // Shared persisted store — the same list Coach reads and mutates (D-gate).
  const { items } = useGroceryList();
  const { likes } = usePreferences();
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [history, setHistory] = useState<GroceryHistoryEntry[]>(loadGroceryHistory);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [storeMode, setStoreMode] = useState({
    hideChecked: false,
    keepAwake: false,
  });
  // Bulk actions ask before firing (audit G1/G3/G5); one pending action at a time.
  const [confirmAction, setConfirmAction] = useState<
    | { type: "clear" }
    | { type: "markAll" }
    | { type: "restore"; entry: GroceryHistoryEntry }
    | null
  >(null);
  const { days: planDays } = useMealPlan();

  const checkedCount = items.filter((item) => item.checked).length;
  const remainingCount = items.length - checkedCount;
  const recipeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const source = item.source || "Added manually";
      counts.set(source, (counts.get(source) ?? 0) + 1);
    });
    const likedRecipeTitles = new Set(
      RECIPES.filter((recipe) => likes.includes(recipe.id)).map((recipe) => recipe.title)
    );

    return Array.from(counts.entries())
      .map(([source, count]) => ({
        source,
        count,
        liked: likedRecipeTitles.has(source),
        manual: /added manually|backup sides|coach/i.test(source),
      }))
      .sort((a, b) => Number(b.liked) - Number(a.liked) || Number(a.manual) - Number(b.manual) || a.source.localeCompare(b.source));
  }, [items, likes]);
  // Exact-title matches only — fuzzy links to the wrong recipe are worse
  // than no link (audit G6).
  const recipeHrefBySource = useMemo(() => {
    const map = new Map<string, string>();
    const byTitle = new Map<string, string>();
    for (const recipe of RECIPES) {
      const key = recipe.title.toLowerCase();
      if (!byTitle.has(key)) byTitle.set(key, recipe.id);
    }
    items.forEach((item) => {
      if (!item.source) return;
      const id = byTitle.get(item.source.toLowerCase());
      if (id) map.set(item.source, `/app/recipes?recipe=${id}`);
    });
    return map;
  }, [items]);
  const visibleItems = storeMode.hideChecked
    ? items.filter((item) => !item.checked)
    : items;
  const filteredItems =
    selectedSources.length === 0
      ? visibleItems
      : visibleItems.filter((item) => selectedSources.includes(item.source || "Added manually"));
  const groupedItems = groupByCategory(filteredItems);
  // The hero summarises the whole list, so its aisle chips must not inherit
  // the store-mode / recipe-filter view the rows below are showing.
  const allGroups = groupByCategory(items);
  const checkedPercent = items.length
    ? Math.round((checkedCount / items.length) * 100)
    : 0;

  function inferCategory(name: string): GroceryCategory {
    return inferGroceryCategory(name);
  }

  function persistHistory(next: GroceryHistoryEntry[]) {
    setHistory(next);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // Best-effort local archive.
    }
  }

  function toggleItem(itemId: string) {
    setGroceryItems(
      items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function removeItem(itemId: string) {
    setGroceryItems(items.filter((item) => item.id !== itemId));
  }

  function updateItem(itemId: string, patch: Partial<RichGroceryItem>) {
    setGroceryItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const next = { ...item, ...patch };
        const inferred = inferGroceryDetails(next.name, next.amount, next.category);
        return {
          ...next,
          servingSize: patch.servingSize ?? inferred.servingSize,
          classification: inferred.classification,
          vitaminBenefit: inferred.vitaminBenefit,
          quantity: inferred.quantity,
        };
      })
    );
  }

  function adjustAmount(item: RichGroceryItem, delta: number) {
    const match = item.amount.match(/^(\d+(?:\.\d+)?)(.*)$/);
    const current = match ? Number(match[1]) : 1;
    const unit = match?.[2]?.trim() || "item";
    const nextAmount = `${Math.max(0, current + delta)} ${unit}`.trim();
    updateItem(item.id, { amount: nextAmount });
  }

  function toggleSource(source: string) {
    setSelectedSources((current) =>
      current.includes(source) ? current.filter((item) => item !== source) : [...current, source]
    );
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = newItemName.trim();
    if (!trimmedName) return;
    const category = inferCategory(trimmedName);
    const amount = newItemAmount.trim() || "1 item";

    setGroceryItems([
      {
        id: `custom-${Date.now().toString(36)}`,
        name: trimmedName,
        amount,
        category,
        source: "Added manually",
        checked: false,
        ...inferGroceryDetails(trimmedName, amount, category),
      },
      ...items,
    ]);
    setNewItemName("");
    setNewItemAmount("");
  }

  function clearAndArchiveList() {
    if (items.length === 0) return;
    const entry: GroceryHistoryEntry = {
      id: `list-${Date.now().toString(36)}`,
      savedAt: new Date().toISOString(),
      itemCount: items.length,
      checkedCount,
      items,
    };
    persistHistory([entry, ...history].slice(0, 4));
    setGroceryItems([]);
  }

  function restoreList(entry: GroceryHistoryEntry) {
    setGroceryItems(entry.items);
  }

  function requestRestore(entry: GroceryHistoryEntry) {
    // Restoring over a non-empty list replaces it — that needs a confirm.
    if (items.length === 0) {
      restoreList(entry);
      return;
    }
    setConfirmAction({ type: "restore", entry });
  }

  function runConfirmedAction() {
    if (!confirmAction) return;
    if (confirmAction.type === "clear") clearAndArchiveList();
    if (confirmAction.type === "markAll") {
      setGroceryItems(items.map((item) => ({ ...item, checked: true })));
    }
    if (confirmAction.type === "restore") restoreList(confirmAction.entry);
    setConfirmAction(null);
  }

  const confirmCopy =
    confirmAction?.type === "clear"
      ? {
          title: `Clear all ${items.length} items?`,
          detail: "The list is saved to Past lists below, so you can restore it any time.",
          cta: "Yes, clear list",
          destructive: true,
        }
      : confirmAction?.type === "markAll"
        ? {
            title: `Mark all ${remainingCount} remaining items as shopped?`,
            detail: "You can uncheck individual items afterwards.",
            cta: "Mark all shopped",
            destructive: false,
          }
        : confirmAction?.type === "restore"
          ? {
              title: `Restore this past list (${confirmAction.entry.itemCount} items)?`,
              detail: `It replaces the ${items.length} items currently on your list.`,
              cta: "Restore list",
              destructive: false,
            }
          : null;

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex min-w-0 flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-7">
          <div className="min-w-0">
            <h1 className="fw-heading text-2xl md:text-4xl">Grocery list</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">
              Grouped from your planned meals — check off as you go.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => setConfirmAction({ type: "markAll" })}
              disabled={items.length === 0 || remainingCount === 0}
              className="min-w-0 whitespace-nowrap rounded-full px-3 text-center text-sm sm:px-5 sm:text-base"
            >
              <CheckCheck className="hidden h-[1.125rem] w-[1.125rem] shrink-0 sm:block" strokeWidth={2.25} />
              Mark all shopped
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={() => setConfirmAction({ type: "clear" })}
              disabled={items.length === 0}
              className="min-w-0 whitespace-nowrap rounded-full px-3 text-center text-sm sm:px-5 sm:text-base"
            >
              <History className="hidden h-[1.125rem] w-[1.125rem] shrink-0 sm:block" strokeWidth={2.25} />
              Clear list
            </Button>
          </div>
        </div>
      </header>

      <div className="fw-page-inner grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        {confirmAction && confirmCopy && (
          <div
            role="alertdialog"
            aria-label={confirmCopy.title}
            className={cn(
              "min-w-0 rounded-[1.35rem] p-4 shadow-e1 ring-1 ring-inset lg:col-span-2",
              confirmCopy.destructive
                ? "bg-red-50/70 ring-red-200"
                : "bg-primary-50/70 ring-primary-200"
            )}
          >
            <p className="text-sm font-black text-ink">{confirmCopy.title}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{confirmCopy.detail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant={confirmCopy.destructive ? "danger" : "primary"}
                size="sm"
                onClick={runConfirmedAction}
              >
                {confirmCopy.cta}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="min-w-0 space-y-4">
          <Card className="fw-mint-panel min-w-0 border-primary-200/80 px-4 py-4 shadow-e1 sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:gap-5">
              <div className="min-w-0">
                <div className="inline-flex min-h-8 items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm font-black text-primary-700 ring-1 ring-inset ring-primary-100">
                  <ShoppingBasket className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  This week
                </div>
                <h2 className="mt-3 break-words font-heading text-[22px] font-black leading-snug tracking-tight text-ink md:text-2xl">
                  {items.length === 0
                    ? "List cleared."
                    : remainingCount === 0
                      ? "All shopped for this week."
                      : `${remainingCount} items left for ${planDays.length} planned days`}
                </h2>
                {items.length === 0 ? (
                  <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-primary-900/75 md:text-[15px]">
                    Restore a past list below, or add items manually.
                  </p>
                ) : remainingCount === 0 ? (
                  <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-primary-900/75 md:text-[15px]">
                    You&apos;re set — check back when new meals are planned.
                  </p>
                ) : null}
                {allGroups.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {allGroups.map((group) => {
                      const Icon = categoryIcon[group.category];
                      const done = group.checked === group.items.length;
                      return (
                        <span
                          key={group.category}
                          className={cn(
                            "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ring-inset",
                            done
                              ? "bg-surface/70 text-ink-faint ring-hairline"
                              : `${categoryTone[group.category]} ring-hairline`
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                          <span className="truncate">{group.category}</span>
                          <span className="tabular-nums opacity-80">
                            {group.checked}/{group.items.length}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Nested inside a tinted panel, so this plate is held by a ring
                  rather than a second drop shadow. */}
              <div className="min-w-0 rounded-[1.25rem] bg-surface px-4 py-3.5 text-center ring-1 ring-inset ring-primary-100 sm:px-8 sm:py-6 md:px-5 md:py-5">
                <p className="font-heading text-[2rem] font-black leading-none tabular-nums text-primary-600 md:text-[2.5rem]">
                  {items.length === 0 ? "—" : `${checkedCount}/${items.length}`}
                </p>
                <p className="mt-1 text-sm font-bold text-ink-muted">
                  {items.length === 0 ? "no items yet" : "checked off"}
                </p>
                <ProgressMeter
                  className="mt-2.5 w-full bg-primary-100"
                  value={checkedCount}
                  target={Math.max(items.length, 1)}
                  color="var(--color-primary-500)"
                  label={`${checkedCount} of ${items.length} grocery items checked off`}
                />
                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-ink-subtle">
                  <span className="tabular-nums">{checkedPercent}%</span> done
                </p>
              </div>
            </div>
          </Card>

          {remainingCount > 0 && (
            <Card className="fw-dark-panel min-w-0 px-5 py-5 shadow-e3 sm:px-6">
              <div className="flex min-w-0 items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-primary-500 to-teal-600 text-white ring-1 ring-inset ring-white/20">
                  <Sparkles className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-black tracking-tight text-white">
                    Next best move
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-white/75">
                    Shop protein first, then produce. If time is short, skip pantry
                    items that are already marked as backup sides.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <aside className="min-w-0 space-y-5 max-lg:order-3">
          <Card className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
            <SectionHeader as="h3" icon={ListPlus} title="Add custom item" />
            <form onSubmit={addItem} className="mt-5 space-y-4">
              <div>
                <label htmlFor="item-name" className="text-sm font-black text-ink-muted">
                  Item
                </label>
                <input
                  id="item-name"
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="e.g. sparkling water"
                  className="mt-2 min-h-12 w-full rounded-[1.1rem] bg-surface-muted px-4 py-3 text-base font-semibold text-ink outline-none ring-1 ring-inset ring-hairline-strong transition placeholder:text-ink-faint hover:bg-surface-subtle focus:bg-surface focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-amount" className="text-sm font-black text-ink-muted">
                  Amount
                </label>
                <input
                  id="item-amount"
                  value={newItemAmount}
                  onChange={(event) => setNewItemAmount(event.target.value)}
                  placeholder="1 pack"
                  className="mt-2 min-h-12 w-full rounded-[1.1rem] bg-surface-muted px-4 py-3 text-base font-semibold text-ink outline-none ring-1 ring-inset ring-hairline-strong transition placeholder:text-ink-faint hover:bg-surface-subtle focus:bg-surface focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={newItemName.trim().length === 0}
              >
                <Plus className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2.25} />
                Add item
              </Button>
            </form>
          </Card>
        </aside>

        <section className="order-3 grid min-w-0 gap-5 lg:col-span-2 lg:grid-cols-2">
          <Card className="min-w-0 px-5 py-6 sm:px-6">
            <SectionHeader
              as="h3"
              icon={History}
              title="Past lists"
              action={
                history.length > 0 ? (
                  <Badge variant="neutral" size="sm" className="tabular-nums">
                    {history.length} saved
                  </Badge>
                ) : undefined
              }
            />
            <div className="mt-4 space-y-2">
              {history.length === 0 ? (
                <p className="rounded-[1.15rem] bg-surface-muted px-4 py-3 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
                  Cleared lists will appear here so you can review or restore what you bought before.
                </p>
              ) : (
                history.map((entry) => {
                  const shoppedPercent = entry.itemCount
                    ? Math.round((entry.checkedCount / entry.itemCount) * 100)
                    : 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[1.15rem] bg-surface-subtle px-4 py-3 ring-1 ring-inset ring-hairline transition-colors hover:bg-primary-50/60 hover:ring-primary-100"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-black tabular-nums text-ink">
                          {entry.itemCount} items · {entry.checkedCount} shopped
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-ink-muted">
                          {new Date(entry.savedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <ProgressMeter
                          className="mt-2 max-w-52 bg-surface-sunken"
                          size="sm"
                          value={entry.checkedCount}
                          target={Math.max(entry.itemCount, 1)}
                          color="var(--color-primary-400)"
                          label={`${shoppedPercent} percent of that list was shopped`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => requestRestore(entry)}
                        aria-label={`Restore list of ${entry.itemCount} items`}
                      >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                        Restore
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="min-w-0 px-5 py-6 sm:px-6">
            <SectionHeader
              as="h3"
              icon={SlidersHorizontal}
              title="Store mode"
            />
            <div className="mt-4 space-y-2">
              {[
                ["hideChecked", "Hide checked"],
                ["keepAwake", "Keep screen awake"],
              ].map(([key, label]) => {
                const settingKey = key as keyof typeof storeMode;
                const enabled = storeMode[settingKey];
                return (
                <button
                  key={key}
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() =>
                    setStoreMode((current) => ({
                      ...current,
                      [settingKey]: !current[settingKey],
                    }))
                  }
                  className={cn(
                    "fw-press flex min-h-11 w-full items-center justify-between gap-3 rounded-[1.15rem] px-3.5 py-2 text-left ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                    enabled
                      ? "bg-primary-50 ring-primary-100"
                      : "bg-surface-subtle ring-hairline hover:bg-surface-muted"
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 break-words text-base font-bold",
                      enabled ? "text-primary-800" : "text-ink-muted"
                    )}
                  >
                    {label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex h-7 w-12 shrink-0 items-center rounded-full ring-1 ring-inset transition-colors duration-200 ease-out-soft",
                      enabled
                        ? "bg-primary-600 ring-primary-700/40"
                        : "bg-surface-sunken ring-hairline-strong"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full bg-surface shadow-e1 transition-transform duration-200 ease-spring",
                        enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </span>
                </button>
              );
              })}
            </div>
          </Card>
        </section>

        <section className="order-2 min-w-0 space-y-4 lg:col-span-2">
          <Card variant="outlined" className="min-w-0 px-4 py-4 shadow-e1">
            <SectionHeader
              as="h3"
              title="Recipe filters"
              description="Highlight a recipe source to show only the groceries needed for that meal."
              action={
                selectedSources.length > 0 ? (
                  <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    onClick={() => setSelectedSources([])}
                  >
                    Show all groceries
                  </Button>
                ) : undefined
              }
            />
            <div className="mt-3 sm:hidden">
              <label htmlFor="mobile-recipe-filter" className="sr-only">
                Add a recipe filter
              </label>
              <select
                id="mobile-recipe-filter"
                value=""
                onChange={(event) => {
                  if (event.target.value) toggleSource(event.target.value);
                }}
                className="min-h-12 w-full rounded-[1.1rem] bg-surface-subtle px-3 text-sm font-black text-ink outline-none ring-1 ring-inset ring-primary-100 transition focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Filter by recipe</option>
                {recipeOptions.map((option) => (
                  <option key={option.source} value={option.source}>
                    {option.source} ({option.count})
                  </option>
                ))}
              </select>
              {selectedSources.length > 0 && (
                <div className="mt-2 flex min-w-0 flex-wrap gap-2" aria-label="Active recipe filters">
                  {selectedSources.map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => toggleSource(source)}
                      className="fw-press min-h-11 max-w-full rounded-full bg-primary-600 px-3 py-2 text-left text-xs font-black text-white shadow-e1 ring-1 ring-inset ring-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                      aria-label={`Remove ${source} filter`}
                    >
                      <span className="block truncate">{source} ×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 sm:flex">
              {recipeOptions.map((option) => {
                const selected = selectedSources.includes(option.source);
                return (
                  <button
                    key={option.source}
                    type="button"
                    onClick={() => toggleSource(option.source)}
                    className={cn(
                      "fw-press inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                      selected
                        ? "bg-primary-600 text-white shadow-glow ring-primary-700"
                        : option.liked
                          ? "bg-primary-50 text-primary-800 ring-primary-200 hover:bg-primary-100"
                          : "bg-surface text-ink-muted ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-100"
                    )}
                    aria-pressed={selected}
                  >
                    {option.source}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        selected ? "bg-white/20" : "bg-surface-muted text-ink-subtle"
                      )}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {filteredItems.length > 0 && (
          <Card padding="sm" className="min-w-0 overflow-hidden p-0 md:p-4">
            <div className="space-y-5 p-2 md:hidden" data-testid="mobile-grocery-list">
              {groupedItems.map((group) => {
                const GroupIcon = categoryIcon[group.category];
                const groupDone = group.checked === group.items.length;
                return (
                <section key={group.category} className="min-w-0 space-y-2">
                  {/* Aisle header — the list is walked category by category, so
                      the grouping needs a real heading, not just chip colour. */}
                  <header className="flex min-w-0 items-center gap-2.5 rounded-[1rem] bg-surface-muted px-2.5 py-2 ring-1 ring-inset ring-hairline">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.75rem] ring-1 ring-inset ring-hairline",
                        categoryTone[group.category]
                      )}
                    >
                      <GroupIcon className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <h3 className="min-w-0 flex-1 truncate text-sm font-black uppercase tracking-[0.1em] text-ink">
                      {group.category}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums ring-1 ring-inset",
                        groupDone
                          ? "bg-primary-50 text-primary-700 ring-primary-100"
                          : "bg-surface text-ink-muted ring-hairline"
                      )}
                    >
                      {group.checked}/{group.items.length}
                    </span>
                  </header>
              {group.items.map((item) => {
                const details = inferGroceryDetails(item.name, item.amount, item.category);
                const servingSize = item.servingSize ?? details.servingSize;
                const classification = item.classification ?? details.classification;
                const vitaminBenefit = item.vitaminBenefit ?? details.vitaminBenefit;
                const expanded = expandedItemId === item.id;
                return (
                  <article
                    key={item.id}
                    data-testid="mobile-grocery-item"
                    className={cn(
                      "min-w-0 rounded-[1.15rem] p-3 ring-1 ring-inset transition-colors duration-200 ease-out-soft",
                      item.checked
                        ? "bg-primary-50/55 ring-primary-100"
                        : "bg-surface ring-hairline-strong"
                    )}
                  >
                    <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                        className={cn(
                          "fw-press flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                          item.checked
                            ? "bg-primary-100 text-primary-600"
                            : "text-primary-400 hover:bg-primary-50 hover:text-primary-600"
                        )}
                      >
                        {item.checked ? (
                          <CheckCircle2
                            className="h-6 w-6 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-200"
                            strokeWidth={2.25}
                          />
                        ) : (
                          <Circle className="h-6 w-6" strokeWidth={2} />
                        )}
                      </button>
                      <textarea
                        value={item.name}
                        onChange={(event) => updateItem(item.id, { name: event.target.value })}
                        rows={2}
                        data-testid="mobile-grocery-name"
                        className={cn(
                          "min-h-12 min-w-0 w-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-[0.9rem] border border-transparent bg-transparent px-2 py-2 font-heading text-base font-black leading-6 text-ink outline-none transition focus:border-primary-200 focus:bg-surface-subtle focus:ring-2 focus:ring-primary-100",
                          item.checked && "text-ink-faint line-through decoration-primary-300 decoration-2"
                        )}
                        aria-label={`Edit item name for ${item.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="fw-press flex h-11 w-11 items-center justify-center rounded-[0.9rem] text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                    </div>

                    <div className="mt-2 min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-ink-subtle">Quantity</span>
                      <div className="mt-1 grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustAmount(item, -1)}
                          className="fw-press flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                          aria-label={`Reduce quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <input
                          value={item.amount}
                          onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                          className="min-h-11 min-w-0 w-full rounded-[0.9rem] bg-surface-subtle px-3 py-2 text-center text-sm font-black tabular-nums text-ink outline-none ring-1 ring-inset ring-primary-100 transition focus:bg-surface focus:ring-2 focus:ring-primary-500"
                          aria-label={`Edit quantity for ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => adjustAmount(item, 1)}
                          className="fw-press flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Serving/category/benefit are planning-time edits — collapsed so
                        in-store check-offs stay a short scroll. */}
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-hairline pt-2 text-xs font-bold text-ink-muted">
                      <p className="min-w-0 break-words">
                        <span className="text-ink-subtle">Recipe:</span>{" "}
                        {recipeHrefBySource.has(item.source) ? (
                          <Link
                            href={recipeHrefBySource.get(item.source)!}
                            className="rounded font-black text-primary-700 underline decoration-primary-300 underline-offset-2 transition hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                          >
                            {item.source}
                          </Link>
                        ) : (
                          item.source
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => setExpandedItemId(expanded ? null : item.id)}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Hide" : "Show"} details for ${item.name}`}
                        className="fw-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                      >
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform duration-200 ease-out-soft",
                            expanded && "rotate-180"
                          )}
                          strokeWidth={2.25}
                        />
                      </button>
                    </div>

                    {expanded && (
                      <>
                        <div className="mt-1 grid min-w-0 gap-3 min-[360px]:grid-cols-2">
                          <label className="min-w-0 text-[11px] font-black uppercase tracking-[0.1em] text-ink-subtle">
                            Serving
                            <input
                              value={servingSize}
                              onChange={(event) => updateItem(item.id, { servingSize: event.target.value })}
                              className="mt-1 min-h-11 min-w-0 w-full rounded-[0.9rem] bg-surface-subtle px-3 py-2 text-sm font-bold normal-case tracking-normal text-ink outline-none ring-1 ring-inset ring-primary-100 transition focus:bg-surface focus:ring-2 focus:ring-primary-500"
                              aria-label={`Edit serving size for ${item.name}`}
                            />
                          </label>
                          <label className="min-w-0 text-[11px] font-black uppercase tracking-[0.1em] text-ink-subtle">
                            Category
                            <select
                              value={item.category}
                              onChange={(event) => updateItem(item.id, { category: event.target.value as GroceryCategory })}
                              className={cn(
                                "mt-1 min-h-11 min-w-0 w-full rounded-[0.9rem] border px-3 py-2 text-sm font-black normal-case tracking-normal outline-none transition focus:ring-2 focus:ring-primary-500",
                                categoryTone[item.category]
                              )}
                              aria-label={`Edit category for ${item.name}`}
                            >
                              {CATEGORY_OPTIONS.map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
                          <span className="max-w-full break-words rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-black text-ink-muted ring-1 ring-inset ring-hairline">{classification}</span>
                          <span className="max-w-full break-words rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-black text-primary-800 ring-1 ring-inset ring-primary-100">{vitaminBenefit}</span>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
                </section>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-surface-muted text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">
                    <th scope="col" className="w-12 rounded-tl-[0.9rem] px-3 py-3">Done</th>
                    <th scope="col" className="min-w-[11rem] px-3 py-3">Item</th>
                    <th scope="col" className="px-3 py-3">Quantity</th>
                    <th scope="col" className="px-3 py-3">Serving</th>
                    <th scope="col" className="px-3 py-3">Category</th>
                    <th scope="col" className="px-3 py-3">Recipe</th>
                    <th scope="col" className="px-3 py-3">Benefit</th>
                    <th scope="col" className="w-24 rounded-tr-[0.9rem] px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                {groupedItems.map((group) => {
                  const GroupIcon = categoryIcon[group.category];
                  return (
                <tbody key={group.category}>
                  {/* Aisle band — the same grouping the phone list uses, so both
                      breakpoints teach the list the same way. */}
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={8}
                      className="border-t border-hairline bg-surface-subtle px-3 py-2 text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.65rem] ring-1 ring-inset ring-hairline",
                            categoryTone[group.category]
                          )}
                        >
                          <GroupIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-ink">
                          {group.category}
                        </span>
                        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-black tabular-nums text-ink-muted ring-1 ring-inset ring-hairline">
                          {group.checked}/{group.items.length}
                        </span>
                      </span>
                    </th>
                  </tr>
                  {group.items.map((item) => {
                    const details = inferGroceryDetails(item.name, item.amount, item.category);
                    const servingSize = item.servingSize ?? details.servingSize;
                    const classification = item.classification ?? details.classification;
                    const vitaminBenefit = item.vitaminBenefit ?? details.vitaminBenefit;
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "h-[4.25rem] text-sm font-semibold text-ink-muted transition-colors duration-200 ease-out-soft",
                          item.checked
                            ? "bg-primary-50/45 hover:bg-primary-50/70"
                            : "bg-surface hover:bg-surface-subtle"
                        )}
                      >
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                            className={cn(
                              "fw-press flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                              item.checked
                                ? "bg-primary-100 text-primary-600"
                                : "text-primary-400 hover:bg-primary-50 hover:text-primary-600"
                            )}
                          >
                            {item.checked ? (
                              <CheckCircle2
                                className="h-6 w-6 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-200"
                                strokeWidth={2.25}
                              />
                            ) : (
                              <Circle className="h-6 w-6" strokeWidth={2} />
                            )}
                          </button>
                        </td>
                        <td className="min-w-[11rem] border-t border-hairline px-3 py-2 align-middle">
                          <input
                            value={item.name}
                            onChange={(event) => updateItem(item.id, { name: event.target.value })}
                            className={cn(
                              "w-full min-w-[11rem] rounded-[0.9rem] border border-transparent bg-transparent px-2 py-2 font-heading text-base font-black text-ink outline-none transition focus:border-primary-200 focus:bg-surface-subtle focus:ring-2 focus:ring-primary-100",
                              item.checked && "text-ink-faint line-through decoration-primary-300 decoration-2"
                            )}
                            aria-label={`Edit item name for ${item.name}`}
                          />
                        </td>
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustAmount(item, -1)}
                              className="fw-press flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                              aria-label={`Reduce quantity for ${item.name}`}
                            >
                              <Minus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <input
                              value={item.amount}
                              onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                              className="w-28 rounded-[0.9rem] bg-surface-subtle px-3 py-2 text-sm font-black tabular-nums text-ink outline-none ring-1 ring-inset ring-primary-100 transition focus:bg-surface focus:ring-2 focus:ring-primary-500"
                              aria-label={`Edit quantity for ${item.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => adjustAmount(item, 1)}
                              className="fw-press flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <Plus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          <input
                            value={servingSize}
                            onChange={(event) => updateItem(item.id, { servingSize: event.target.value })}
                            className="w-32 rounded-[0.9rem] bg-surface-subtle px-3 py-2 text-sm font-bold text-ink outline-none ring-1 ring-inset ring-primary-100 transition focus:bg-surface focus:ring-2 focus:ring-primary-500"
                            aria-label={`Edit serving size for ${item.name}`}
                          />
                        </td>
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          <select
                            value={item.category}
                            onChange={(event) => updateItem(item.id, { category: event.target.value as GroceryCategory })}
                            className={cn(
                              "rounded-full border px-3 py-2 text-xs font-black outline-none transition focus:ring-2 focus:ring-primary-500",
                              categoryTone[item.category]
                            )}
                            aria-label={`Edit category for ${item.name}`}
                          >
                            {CATEGORY_OPTIONS.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          {recipeHrefBySource.has(item.source) ? (
                            <Link
                              href={recipeHrefBySource.get(item.source)!}
                              className="inline-block rounded-full bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                            >
                              {item.source}
                            </Link>
                          ) : (
                            <span className="inline-block rounded-full bg-surface-muted px-2.5 py-1 text-xs font-black text-ink-muted ring-1 ring-inset ring-hairline">
                              {item.source}
                            </span>
                          )}
                        </td>
                        <td className="border-t border-hairline px-3 py-2 align-middle">
                          <div className="flex flex-col items-start gap-1">
                            <span className="max-w-[9rem] truncate rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-black text-ink-muted ring-1 ring-inset ring-hairline" title={classification}>
                              {classification}
                            </span>
                            <span className="max-w-[9rem] truncate rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-black text-primary-800 ring-1 ring-inset ring-primary-100" title={vitaminBenefit}>
                              {vitaminBenefit}
                            </span>
                          </div>
                        </td>
                        <td className="border-t border-hairline px-3 py-2 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="fw-press rounded-[0.9rem] p-2 text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                  );
                })}
              </table>
            </div>
          </Card>
          )}
          {filteredItems.length === 0 && (
            <Card variant="tinted" padding="none">
              <EmptyState
                icon={ShoppingBasket}
                title="Nothing to shop"
                description="Items from your planned meals will appear here, or add one manually. Clear recipe filters if you expected more rows."
              />
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
