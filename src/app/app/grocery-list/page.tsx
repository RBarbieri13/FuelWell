"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import {
  Check,
  CheckCheck,
  CheckCircle2,
  Circle,
  History,
  ListPlus,
  Plus,
  ShoppingBasket,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useGroceryList,
  setGroceryItems,
  type GroceryCategory,
  type RichGroceryItem,
} from "@/lib/use-grocery-list";

const categories: GroceryCategory[] = ["Protein", "Produce", "Pantry", "Dairy", "Frozen", "Other"];
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
  const [activeCategory, setActiveCategory] = useState<GroceryCategory | "All">("All");
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>("Produce");
  const [history, setHistory] = useState<GroceryHistoryEntry[]>(loadGroceryHistory);
  const [storeMode, setStoreMode] = useState({
    groupByAisle: true,
    hideChecked: false,
    keepAwake: false,
  });

  const checkedCount = items.filter((item) => item.checked).length;
  const remainingCount = items.length - checkedCount;
  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);
  const visibleItems = storeMode.hideChecked
    ? filteredItems.filter((item) => !item.checked)
    : filteredItems;

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

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    setGroceryItems([
      {
        id: `custom-${Date.now().toString(36)}`,
        name: trimmedName,
        amount: newItemAmount.trim() || "1 item",
        category: newItemCategory,
        source: "Added manually",
        checked: false,
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

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Grocery list</h1>
            <p className="fw-muted mt-1 text-base">
              Grouped from your planned meals — check off as you go.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => setGroceryItems(items.map((item) => ({ ...item, checked: true })))}
              className="rounded-full"
            >
              <CheckCheck className="w-5 h-5" />
              Mark all shopped
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={clearAndArchiveList}
              disabled={items.length === 0}
              className="rounded-full"
            >
              <History className="w-5 h-5" />
              Clear list
            </Button>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-lg font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)]">
              M
            </div>
          </div>
        </div>
      </header>

      <div className="fw-page-inner grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Card className="fw-mint-panel rounded-[24px] border-primary-200/80 px-6 py-6 shadow-none">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-black text-primary-700">
                  <ShoppingBasket className="w-3.5 h-3.5" />
                  This week
                </div>
                <h2 className="mt-4 font-heading text-[22px] font-black tracking-tight text-[#16302a] md:text-2xl">
                  {remainingCount === 0
                    ? "All shopped for this week."
                    : `${remainingCount} items left for 4 planned days`}
                </h2>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-primary-900/75 md:text-[15px]">
                  {remainingCount === 0
                    ? "You're set — check back when new meals are planned."
                    : "Protein and produce are the priority. Pantry items can wait if you are doing a quick store run."}
                </p>
              </div>
              <div className="rounded-[20px] bg-white px-8 py-6 text-center shadow-[0_8px_18px_rgba(20,90,75,0.08)]">
                <p className="font-heading text-[42px] font-black leading-none tabular-nums text-primary-600">
                  {checkedCount}/{items.length}
                </p>
                <p className="mt-1 text-sm font-bold text-[#7c968f]">checked off</p>
              </div>
            </div>
          </Card>

          <Card padding="sm" className="rounded-[18px] border-[#e6efeb] shadow-[0_8px_22px_rgba(20,90,75,0.05)]">
            <div className="flex flex-wrap gap-2">
              {(["All", ...categories] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-bold transition-all",
                    activeCategory === category
                      ? "border-primary-500 bg-primary-500 text-white shadow-[0_10px_22px_rgba(30,174,132,0.22)]"
                      : "border-[#e6efeb] bg-[#f4f8f6] text-[#54635d] hover:bg-white"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {categories.map((category) => {
              const categoryItems = visibleItems.filter(
                (item) => item.category === category
              );
              if (categoryItems.length === 0) return null;

              const categoryChecked = categoryItems.filter((item) => item.checked).length;

              return (
                <Card key={category} className="rounded-[22px] border-[#e6efeb] px-6 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full border px-3 py-1 text-sm font-black", categoryTone[category])}>
                        {category}
                      </span>
                      <span className="text-sm font-semibold text-[#9db0aa]">
                        {categoryChecked}/{categoryItems.length} done
                      </span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        categoryChecked === categoryItems.length
                          ? "bg-primary-100 text-primary-700"
                          : "bg-[#f4f8f6] text-[#7c968f]"
                      )}
                    >
                      {categoryChecked === categoryItems.length ? "Complete" : "To shop"}
                    </span>
                  </div>

                  <div className="mt-4 divide-y divide-neutral-100">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-3 first:pt-1 last:pb-1"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                          className={cn(
                            "-m-2 rounded-full p-2 transition-colors",
                            item.checked ? "text-primary-500" : "text-[#cfe0da] hover:text-primary-500"
                          )}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="h-7 w-7" />
                          ) : (
                            <Circle className="h-7 w-7" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                            "font-heading text-base font-black tracking-tight text-[#16302a]",
                              item.checked && "text-[#9db0aa] line-through"
                            )}
                          >
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-[#9db0aa]">
                            {item.amount} · {item.source}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="-m-1.5 rounded-xl p-3.5 text-[#c9d6d1] transition-colors hover:bg-red-50 hover:text-red-500 md:m-0 md:p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {visibleItems.length === 0 && (
              <EmptyState
                icon={ShoppingBasket}
                title="Nothing to shop"
                description="Items from your planned meals will appear here, or add one manually."
              />
            )}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28">
          <Card className="rounded-[22px] border-[#e6efeb] px-6 py-6 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
            <h2 className="flex items-center gap-3 font-heading text-lg font-black tracking-tight text-[#16302a]">
              <span className="fw-icon-chip h-10 w-10 rounded-full">
                <ListPlus className="w-5 h-5" />
              </span>
              Add custom item
            </h2>
            <form onSubmit={addItem} className="mt-5 space-y-4">
              <div>
                <label htmlFor="item-name" className="text-sm font-black text-[#7c968f]">
                  Item
                </label>
                <input
                  id="item-name"
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="e.g. sparkling water"
                  className="mt-2 w-full rounded-xl border border-[#e0ebe6] bg-[#f4f8f6] px-4 py-3 text-base font-semibold text-[#16302a] outline-none placeholder:text-[#7c7c7c] focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-amount" className="text-sm font-black text-[#7c968f]">
                  Amount
                </label>
                <input
                  id="item-amount"
                  value={newItemAmount}
                  onChange={(event) => setNewItemAmount(event.target.value)}
                  placeholder="1 pack"
                  className="mt-2 w-full rounded-xl border border-[#e0ebe6] bg-[#f4f8f6] px-4 py-3 text-base font-semibold text-[#16302a] outline-none placeholder:text-[#7c7c7c] focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-category" className="text-sm font-black text-[#7c968f]">
                  Category
                </label>
                <select
                  id="item-category"
                  value={newItemCategory}
                  onChange={(event) => setNewItemCategory(event.target.value as GroceryCategory)}
                  className="mt-2 w-full rounded-xl border border-[#e0ebe6] bg-[#f4f8f6] px-4 py-3 text-base font-semibold text-[#16302a] outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </form>
          </Card>

          <Card className="fw-dark-panel rounded-[22px] px-6 py-6 shadow-[0_18px_38px_rgba(16,48,40,0.3)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-[#1592a0] text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-heading text-lg font-black tracking-tight text-white">
              Next best move
            </h2>
            <p className="mt-3 text-base font-semibold leading-7 text-white/75">
              Shop protein first, then produce. If time is short, skip pantry
              items that are already marked as backup sides.
            </p>
          </Card>

          <Card className="rounded-[22px] border-[#e6efeb] px-6 py-6 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
            <h2 className="flex items-center gap-3 font-heading text-lg font-black tracking-tight text-[#16302a]">
              <span className="fw-icon-chip h-10 w-10 rounded-full">
                <History className="w-5 h-5" />
              </span>
              Past lists
            </h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm font-semibold leading-6 text-[#7c968f]">
                  Cleared lists will appear here so you can review or restore what you bought before.
                </p>
              ) : (
                history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => restoreList(entry)}
                    className="w-full rounded-[1rem] border border-primary-100 bg-[#f8fbf9] px-4 py-3 text-left transition hover:bg-primary-50"
                  >
                    <span className="block text-sm font-black text-[#16302a]">
                      {entry.itemCount} items · {entry.checkedCount} shopped
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-[#7c968f]">
                      {new Date(entry.savedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-[22px] border-[#e6efeb] px-6 py-6 shadow-[0_8px_22px_rgba(20,90,75,0.06)]">
            <h2 className="font-heading text-lg font-black tracking-tight text-[#16302a]">
              Store mode
            </h2>
            <div className="mt-5 space-y-3">
              {[
                ["groupByAisle", "Group by aisle"],
                ["hideChecked", "Hide checked"],
                ["keepAwake", "Keep screen awake"],
              ].map(([key, label]) => {
                const settingKey = key as keyof typeof storeMode;
                const enabled = storeMode[settingKey];
                return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setStoreMode((current) => ({
                      ...current,
                      [settingKey]: !current[settingKey],
                    }))
                  }
                  className="flex w-full items-center justify-between py-1.5 text-left"
                >
                  <span className="text-base font-bold text-[#54635d]">{label}</span>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full border-2",
                      enabled
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-[#d6e2dd] text-transparent"
                    )}
                  >
                    {enabled && <Check className="h-4 w-4" />}
                  </span>
                </button>
              );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
