"use client";

import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import {
  Check,
  CheckCircle2,
  Circle,
  ListPlus,
  Plus,
  SlidersHorizontal,
  ShoppingBasket,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useGroceryList,
  setGroceryItems,
  type GroceryCategory,
} from "@/lib/use-grocery-list";

const categories: GroceryCategory[] = ["Protein", "Produce", "Pantry", "Dairy", "Frozen", "Other"];

const categoryTone: Record<GroceryCategory, string> = {
  Protein: "bg-primary-50 text-primary-700 border-primary-100",
  Produce: "bg-primary-50 text-primary-700 border-primary-100",
  Pantry: "bg-lemon-50 text-lemon-700 border-lemon-100",
  Dairy: "bg-sky-50 text-sky-700 border-sky-100",
  Frozen: "bg-purple-50 text-purple-700 border-purple-100",
  Other: "bg-neutral-50 text-neutral-600 border-neutral-200",
};

export default function GroceryListPage() {
  // Shared persisted store — the same list Coach reads and mutates (D-gate).
  const { items } = useGroceryList();
  const [activeCategory, setActiveCategory] = useState<GroceryCategory | "All">("All");
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>("Produce");

  const checkedCount = items.filter((item) => item.checked).length;
  const remainingCount = items.length - checkedCount;
  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

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
              <CheckCircle2 className="w-5 h-5" />
              Mark all shopped
            </Button>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-lg font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)]">
              M
            </div>
          </div>
        </div>
      </header>

      <div className="fw-page-inner grid gap-6 2xl:grid-cols-[minmax(0,1fr)_29rem]">
        <div className="space-y-4">
          <Card className="fw-mint-panel">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100">
                  <ShoppingBasket className="w-3.5 h-3.5" />
                  This week
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-neutral-900">
                  {remainingCount === 0
                    ? "All shopped for this week."
                    : `${remainingCount} items left for 4 planned days`}
                </h2>
                <p className="mt-3 max-w-xl text-lg font-semibold leading-relaxed text-primary-900/75">
                  {remainingCount === 0
                    ? "You're set — check back when new meals are planned."
                    : "Protein and produce are the priority. Pantry items can wait if you are doing a quick store run."}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-8 py-6 text-center shadow-sm shadow-primary-900/5">
                <p className="text-5xl font-black tabular-nums text-primary-600">
                  {checkedCount}/{items.length}
                </p>
                <p className="text-sm font-bold text-neutral-400">checked off</p>
              </div>
            </div>
          </Card>

          <Card padding="sm" className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["All", ...categories] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full border px-5 py-3 text-sm font-bold transition-all",
                    activeCategory === category
                      ? "border-primary-500 bg-primary-500 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter(
                (item) => item.category === category
              );
              if (categoryItems.length === 0) return null;

              const categoryChecked = categoryItems.filter((item) => item.checked).length;

              return (
                <Card key={category} className="px-7 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", categoryTone[category])}>
                        {category}
                      </span>
                      <span className="text-xs font-medium text-neutral-400">
                        {categoryChecked}/{categoryItems.length} done
                      </span>
                    </div>
                    <Badge variant={categoryChecked === categoryItems.length ? "success" : "default"}>
                      {categoryChecked === categoryItems.length ? "Complete" : "To shop"}
                    </Badge>
                  </div>

                  <div className="mt-5 divide-y divide-neutral-100">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                          className={cn(
                            "rounded-full p-3 -m-3 transition-colors",
                            item.checked ? "text-primary-600" : "text-neutral-300 hover:text-primary-500"
                          )}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                            "text-base font-black text-neutral-900",
                              item.checked && "text-neutral-400 line-through"
                            )}
                          >
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold text-neutral-400 mt-0.5">
                            {item.amount} · {item.source}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="rounded-xl p-3.5 -m-1.5 md:p-2 md:m-0 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {filteredItems.length === 0 && (
              <EmptyState
                icon={ShoppingBasket}
                title="Nothing to shop"
                description="Items from your planned meals will appear here, or add one manually."
              />
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="px-7 py-7">
            <h2 className="flex items-center gap-4 text-2xl font-black text-neutral-900">
              <span className="fw-icon-chip h-11 w-11 rounded-[1rem]">
                <ListPlus className="w-5 h-5" />
              </span>
              Add custom item
            </h2>
            <form onSubmit={addItem} className="mt-4 space-y-3">
              <div>
                <label htmlFor="item-name" className="text-sm font-black text-neutral-500">
                  Item
                </label>
                <input
                  id="item-name"
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="e.g. sparkling water"
                  className="mt-2 w-full rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-4 text-base font-semibold outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-amount" className="text-sm font-black text-neutral-500">
                  Amount
                </label>
                <input
                  id="item-amount"
                  value={newItemAmount}
                  onChange={(event) => setNewItemAmount(event.target.value)}
                  placeholder="1 pack"
                  className="mt-2 w-full rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-4 text-base font-semibold outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-category" className="text-sm font-black text-neutral-500">
                  Category
                </label>
                <select
                  id="item-category"
                  value={newItemCategory}
                  onChange={(event) => setNewItemCategory(event.target.value as GroceryCategory)}
                  className="mt-2 w-full rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-4 text-base font-semibold outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Plus className="w-4 h-4" />
                Add item
              </Button>
            </form>
          </Card>

          <Card className="fw-dark-panel px-7 py-7">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-500 text-white">
              <Sparkles className="w-6 h-6" />
            </span>
            <h2 className="mt-5 text-2xl font-black">Next best move</h2>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-white/75">
              Shop protein first, then produce. If time is short, skip pantry
              items that are already marked as backup sides.
            </p>
          </Card>

          <Card className="px-7 py-7">
            <h2 className="flex items-center gap-3 text-2xl font-black text-neutral-900">
              <SlidersHorizontal className="h-5 w-5 text-primary-600" />
              Store mode
            </h2>
            <div className="mt-5 space-y-4">
              {["Group by aisle", "Hide checked", "Keep screen awake"].map((label, index) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-base font-bold text-neutral-700">{label}</span>
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border-2",
                      index === 0
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-primary-100 text-neutral-300"
                    )}
                  >
                    {index === 0 && <Check className="w-4 h-4" />}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
