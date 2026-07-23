"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Circle,
  History,
  ListPlus,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Trash2,
} from "lucide-react";
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

const categoryTone: Record<GroceryCategory, string> = {
  Protein: "bg-sky-100 text-sky-700 border-sky-100",
  Produce: "bg-primary-100 text-primary-700 border-primary-100",
  Pantry: "bg-lemon-50 text-lemon-700 border-lemon-100",
  Dairy: "bg-sky-100 text-sky-700 border-sky-100",
  Frozen: "bg-accent-100 text-accent-600 border-accent-100",
  Other: "bg-neutral-50 text-[#54635d] border-neutral-200",
};

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
              <CheckCheck className="hidden w-5 h-5 sm:block" />
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
              <History className="hidden w-5 h-5 sm:block" />
              Clear list
            </Button>
          </div>
        </div>
      </header>

      <div className="fw-page-inner grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        {confirmAction && confirmCopy && (
          <div
            className={cn(
              "min-w-0 rounded-[1.35rem] border p-4 lg:col-span-2",
              confirmCopy.destructive
                ? "border-red-200 bg-red-50/70"
                : "border-primary-200 bg-primary-50/70"
            )}
          >
            <p className="text-sm font-black text-neutral-900">{confirmCopy.title}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{confirmCopy.detail}</p>
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
          <Card className="fw-mint-panel min-w-0 rounded-[24px] border-primary-200/80 px-4 py-4 shadow-none sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center md:gap-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-black text-primary-700">
                  <ShoppingBasket className="w-3.5 h-3.5" />
                  This week
                </div>
                <h2 className="mt-3 font-heading text-[22px] font-black tracking-tight text-[#16302a] md:text-2xl">
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
              </div>
              <div className="min-w-0 rounded-[20px] bg-white px-4 py-3.5 text-center md:px-5 md:py-5 shadow-[0_8px_18px_rgba(20,90,75,0.08)] sm:px-8 sm:py-6">
                <p className="font-heading text-[2rem] font-black leading-none tabular-nums md:text-[42px] text-primary-600">
                  {items.length === 0 ? "—" : `${checkedCount}/${items.length}`}
                </p>
                <p className="mt-1 text-sm font-bold text-muted-foreground">
                  {items.length === 0 ? "no items yet" : "checked off"}
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-100">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${items.length ? Math.round((checkedCount / items.length) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {remainingCount > 0 && (
            <Card className="fw-dark-panel rounded-[22px] px-6 py-5 shadow-[0_18px_38px_rgba(16,48,40,0.3)]">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-[#1592a0] text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
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
          <Card className="min-w-0 rounded-[24px] border-border px-4 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)] sm:px-6 sm:py-6">
            <h2 className="flex items-center gap-3 font-heading text-lg font-black tracking-tight text-[#16302a]">
              <span className="fw-icon-chip h-10 w-10 rounded-full">
                <ListPlus className="w-5 h-5" />
              </span>
              Add custom item
            </h2>
            <form onSubmit={addItem} className="mt-5 space-y-4">
              <div>
                <label htmlFor="item-name" className="text-sm font-black text-muted-foreground">
                  Item
                </label>
                <input
                  id="item-name"
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="e.g. sparkling water"
                  className="mt-2 w-full rounded-xl border border-border bg-[#f4f8f6] px-4 py-3 text-base font-semibold text-[#16302a] outline-none placeholder:text-[#7c7c7c] focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-amount" className="text-sm font-black text-muted-foreground">
                  Amount
                </label>
                <input
                  id="item-amount"
                  value={newItemAmount}
                  onChange={(event) => setNewItemAmount(event.target.value)}
                  placeholder="1 pack"
                  className="mt-2 w-full rounded-xl border border-border bg-[#f4f8f6] px-4 py-3 text-base font-semibold text-[#16302a] outline-none placeholder:text-[#7c7c7c] focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </form>
          </Card>
        </aside>

        <section className="order-3 grid min-w-0 gap-5 lg:col-span-2 lg:grid-cols-2">
          <Card className="rounded-[24px] border-border px-6 py-6 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
            <h2 className="flex items-center gap-3 font-heading text-lg font-black tracking-tight text-[#16302a]">
              <span className="fw-icon-chip h-10 w-10 rounded-full">
                <History className="w-5 h-5" />
              </span>
              Past lists
            </h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm font-semibold leading-6 text-muted-foreground">
                  Cleared lists will appear here so you can review or restore what you bought before.
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-[1rem] border border-primary-100 bg-[#f8fbf9] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <span className="block text-sm font-black text-[#16302a]">
                        {entry.itemCount} items · {entry.checkedCount} shopped
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                        {new Date(entry.savedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => requestRestore(entry)}
                      aria-label={`Restore list of ${entry.itemCount} items`}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-[24px] border-border px-6 py-6 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
            <h2 className="font-heading text-lg font-black tracking-tight text-[#16302a]">
              Store mode
            </h2>
            <div className="mt-5 space-y-3">
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
                  className="flex min-h-11 w-full items-center justify-between py-1.5 text-left"
                >
                  <span className="text-base font-bold text-[#54635d]">{label}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
                      enabled ? "bg-primary-500" : "bg-neutral-200"
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(22,48,42,0.18)] transition-transform",
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
          <Card className="min-w-0 rounded-[24px] border-primary-100 bg-white/88 px-4 py-4 shadow-[0_8px_22px_rgba(20,90,75,0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-heading text-lg font-black text-[#16302a]">
                  Recipe filters
                </h2>
                <p className="text-sm font-semibold text-muted-foreground">
                  Highlight a recipe source to show only the groceries needed for that meal.
                </p>
              </div>
              {selectedSources.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="self-start rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 lg:self-center"
                >
                  Show all groceries
                </button>
              )}
            </div>
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
                className="min-h-12 w-full rounded-xl border border-primary-100 bg-[#f8fbf9] px-3 text-sm font-black text-[#16302a] outline-none focus:ring-2 focus:ring-primary-100"
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
                      className="min-h-11 max-w-full rounded-full border border-primary-500 bg-primary-600 px-3 py-2 text-left text-xs font-black text-white"
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
                      "shrink-0 rounded-full border px-3.5 py-2 text-xs font-black transition",
                      selected
                        ? "border-primary-500 bg-primary-600 text-white shadow-[0_12px_24px_rgba(21,145,108,0.2)]"
                        : option.liked
                          ? "border-primary-200 bg-primary-50 text-primary-800"
                          : "border-primary-100 bg-white text-[#60776f] hover:bg-primary-50"
                    )}
                    aria-pressed={selected}
                  >
                    {option.source}
                    <span className="ml-2 opacity-70">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card padding="sm" className="min-w-0 overflow-hidden rounded-[24px] border-border p-0 shadow-[0_10px_26px_rgba(20,90,75,0.06)] md:p-4">
            <div className="space-y-3 p-2 md:hidden" data-testid="mobile-grocery-list">
              {filteredItems.map((item) => {
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
                      "min-w-0 rounded-[18px] border border-primary-100 p-3",
                      item.checked ? "bg-primary-50/55" : "bg-white"
                    )}
                  >
                    <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                          item.checked ? "text-primary-500" : "text-primary-400 hover:text-primary-600"
                        )}
                      >
                        {item.checked ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                      </button>
                      <textarea
                        value={item.name}
                        onChange={(event) => updateItem(item.id, { name: event.target.value })}
                        rows={2}
                        data-testid="mobile-grocery-name"
                        className={cn(
                          "min-h-12 min-w-0 w-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-xl border border-transparent bg-transparent px-2 py-2 font-heading text-base font-black leading-6 text-[#16302a] outline-none transition focus:border-primary-200 focus:bg-[#f8fbf9] focus:ring-2 focus:ring-primary-100",
                          item.checked && "text-muted-foreground line-through"
                        )}
                        aria-label={`Edit item name for ${item.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">Quantity</span>
                      <div className="mt-1 grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustAmount(item, -1)}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f8f6] text-[#60776f] transition hover:bg-primary-50 hover:text-primary-700"
                          aria-label={`Reduce quantity for ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          value={item.amount}
                          onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                          className="min-h-11 min-w-0 w-full rounded-xl border border-primary-100 bg-[#f8fbf9] px-3 py-2 text-center text-sm font-black text-[#16302a] outline-none focus:ring-2 focus:ring-primary-100"
                          aria-label={`Edit quantity for ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => adjustAmount(item, 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f8f6] text-[#60776f] transition hover:bg-primary-50 hover:text-primary-700"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Serving/category/benefit are planning-time edits — collapsed so
                        in-store check-offs stay a short scroll. */}
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-primary-100/70 pt-2 text-xs font-bold text-[#60776f]">
                      <p className="min-w-0 break-words">
                        <span className="text-muted-foreground">Recipe:</span>{" "}
                        {recipeHrefBySource.has(item.source) ? (
                          <Link
                            href={recipeHrefBySource.get(item.source)!}
                            className="font-black text-primary-700 underline decoration-primary-300 underline-offset-2 transition hover:text-primary-800"
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
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-600 transition hover:bg-primary-50"
                      >
                        <ChevronDown className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")} />
                      </button>
                    </div>

                    {expanded && (
                      <>
                        <div className="mt-1 grid min-w-0 gap-3 min-[360px]:grid-cols-2">
                          <label className="min-w-0 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                            Serving
                            <input
                              value={servingSize}
                              onChange={(event) => updateItem(item.id, { servingSize: event.target.value })}
                              className="mt-1 min-h-11 min-w-0 w-full rounded-xl border border-primary-100 bg-[#f8fbf9] px-3 py-2 text-sm font-bold normal-case tracking-normal text-[#16302a] outline-none focus:ring-2 focus:ring-primary-100"
                              aria-label={`Edit serving size for ${item.name}`}
                            />
                          </label>
                          <label className="min-w-0 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                            Category
                            <select
                              value={item.category}
                              onChange={(event) => updateItem(item.id, { category: event.target.value as GroceryCategory })}
                              className={cn("mt-1 min-h-11 min-w-0 w-full rounded-xl border px-3 py-2 text-sm font-black normal-case tracking-normal outline-none", categoryTone[item.category])}
                              aria-label={`Edit category for ${item.name}`}
                            >
                              {(["Protein", "Produce", "Pantry", "Dairy", "Frozen", "Other"] as GroceryCategory[]).map((category) => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">
                          <span className="max-w-full break-words rounded-full bg-[#f4f8f6] px-2.5 py-1 text-[11px] font-black text-[#54635d]">{classification}</span>
                          <span className="max-w-full break-words rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-black text-primary-800">{vitaminBenefit}</span>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f4f8f6] text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="w-12 px-3 py-3">Done</th>
                    <th className="min-w-[11rem] px-3 py-3">Item</th>
                    <th className="px-3 py-3">Quantity</th>
                    <th className="px-3 py-3">Serving</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Recipe</th>
                    <th className="px-3 py-3">Benefit</th>
                    <th className="w-24 px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const details = inferGroceryDetails(item.name, item.amount, item.category);
                    const servingSize = item.servingSize ?? details.servingSize;
                    const classification = item.classification ?? details.classification;
                    const vitaminBenefit = item.vitaminBenefit ?? details.vitaminBenefit;
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "h-[4.25rem] border-t border-primary-100/70 text-sm font-semibold text-[#54635d]",
                          item.checked ? "bg-primary-50/45" : "bg-white"
                        )}
                      >
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                            className={cn(
                              "rounded-full p-1.5 transition-colors",
                              item.checked ? "text-primary-500" : "text-primary-400 hover:text-primary-600"
                            )}
                          >
                            {item.checked ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </button>
                        </td>
                        <td className="min-w-[11rem] border-t border-primary-100/70 px-3 py-2 align-middle">
                          <input
                            value={item.name}
                            onChange={(event) => updateItem(item.id, { name: event.target.value })}
                            className={cn(
                              "w-full min-w-[11rem] rounded-xl border border-transparent bg-transparent px-2 py-2 font-heading text-base font-black text-[#16302a] outline-none transition focus:border-primary-200 focus:bg-[#f8fbf9] focus:ring-2 focus:ring-primary-100",
                              item.checked && "text-muted-foreground line-through"
                            )}
                            aria-label={`Edit item name for ${item.name}`}
                          />
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustAmount(item, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f8f6] text-[#60776f] transition hover:bg-primary-50 hover:text-primary-700"
                              aria-label={`Reduce quantity for ${item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              value={item.amount}
                              onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                              className="w-28 rounded-xl border border-primary-100 bg-[#f8fbf9] px-3 py-2 text-sm font-black text-[#16302a] outline-none focus:ring-2 focus:ring-primary-100"
                              aria-label={`Edit quantity for ${item.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => adjustAmount(item, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f8f6] text-[#60776f] transition hover:bg-primary-50 hover:text-primary-700"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          <input
                            value={servingSize}
                            onChange={(event) => updateItem(item.id, { servingSize: event.target.value })}
                            className="w-32 rounded-xl border border-primary-100 bg-[#f8fbf9] px-3 py-2 text-sm font-bold text-[#16302a] outline-none focus:ring-2 focus:ring-primary-100"
                            aria-label={`Edit serving size for ${item.name}`}
                          />
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          <select
                            value={item.category}
                            onChange={(event) => updateItem(item.id, { category: event.target.value as GroceryCategory })}
                            className={cn("rounded-full border px-3 py-2 text-xs font-black outline-none", categoryTone[item.category])}
                            aria-label={`Edit category for ${item.name}`}
                          >
                            {(["Protein", "Produce", "Pantry", "Dairy", "Frozen", "Other"] as GroceryCategory[]).map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          {recipeHrefBySource.has(item.source) ? (
                            <Link
                              href={recipeHrefBySource.get(item.source)!}
                              className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 transition hover:bg-primary-100"
                            >
                              {item.source}
                            </Link>
                          ) : (
                            <span className="rounded-full bg-[#f4f8f6] px-2.5 py-1 text-xs font-black text-[#60776f]">
                              {item.source}
                            </span>
                          )}
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="max-w-[9rem] truncate rounded-full bg-[#f4f8f6] px-2.5 py-1 text-[11px] font-black text-[#54635d]" title={classification}>
                              {classification}
                            </span>
                            <span className="max-w-[9rem] truncate rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-black text-primary-800" title={vitaminBenefit}>
                              {vitaminBenefit}
                            </span>
                          </div>
                        </td>
                        <td className="border-t border-primary-100/70 px-3 py-2 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {filteredItems.length === 0 && (
            <EmptyState
              icon={ShoppingBasket}
              title="Nothing to shop"
              description="Items from your planned meals will appear here, or add one manually. Clear recipe filters if you expected more rows."
            />
          )}
        </section>
      </div>
    </div>
  );
}
