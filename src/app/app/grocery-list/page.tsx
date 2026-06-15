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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Grocery List
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Shop grouped ingredients from your planned meals, then check off as
            you go.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setGroceryItems(items.map((item) => ({ ...item, checked: true })))}
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark all shopped
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary-50/80 via-white to-accent-50/60 border-primary-100">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100">
                  <ShoppingBasket className="w-3.5 h-3.5" />
                  This week
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900">
                  {remainingCount === 0
                    ? "All shopped for this week."
                    : `${remainingCount} items left for 4 planned days.`}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {remainingCount === 0
                    ? "You're set — check back when new meals are planned."
                    : "Protein and produce are the priority. Pantry items can wait if you are doing a quick store run."}
                </p>
              </div>
              <div className="rounded-2xl bg-white/85 border border-white px-5 py-4 text-center">
                <p className="text-3xl font-bold tabular-nums text-neutral-900">
                  {checkedCount}/{items.length}
                </p>
                <p className="text-xs font-medium text-neutral-500">checked off</p>
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
                    "rounded-full border px-3 py-2.5 md:py-1.5 text-sm font-medium transition-all",
                    activeCategory === category
                      ? "border-primary-300 bg-primary-50 text-primary-700"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
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
                <Card key={category} padding="sm">
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

                  <div className="mt-3 divide-y divide-neutral-100">
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
                              "text-sm font-medium text-neutral-900",
                              item.checked && "text-neutral-400 line-through"
                            )}
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {item.amount} / {item.source}
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

        <aside className="space-y-4">
          <Card padding="sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <ListPlus className="w-4 h-4 text-primary-600" />
              Add custom item
            </h2>
            <form onSubmit={addItem} className="mt-4 space-y-3">
              <div>
                <label htmlFor="item-name" className="text-xs font-medium text-neutral-500">
                  Item
                </label>
                <input
                  id="item-name"
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="e.g. sparkling water"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-amount" className="text-xs font-medium text-neutral-500">
                  Amount
                </label>
                <input
                  id="item-amount"
                  value={newItemAmount}
                  onChange={(event) => setNewItemAmount(event.target.value)}
                  placeholder="1 pack"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="item-category" className="text-xs font-medium text-neutral-500">
                  Category
                </label>
                <select
                  id="item-category"
                  value={newItemCategory}
                  onChange={(event) => setNewItemCategory(event.target.value as GroceryCategory)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4" />
                Add item
              </Button>
            </form>
          </Card>

          <Card padding="sm" className="bg-neutral-900 text-white border-neutral-900">
            <Sparkles className="w-5 h-5 text-primary-300" />
            <h2 className="mt-3 text-sm font-semibold">Next best move</h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-300">
              Shop protein first, then produce. If time is short, skip pantry
              items that are already marked as backup sides.
            </p>
          </Card>

          <Card padding="sm">
            <h2 className="text-sm font-semibold text-neutral-900">Store mode</h2>
            <div className="mt-3 space-y-2">
              {["Group by aisle", "Hide checked", "Keep screen awake"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2">
                  <span className="text-sm text-neutral-700">{label}</span>
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                      index === 0
                        ? "border-primary-200 bg-primary-50 text-primary-600"
                        : "border-neutral-200 text-neutral-300"
                    )}
                  >
                    {index === 0 && <Check className="w-3 h-3" />}
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
