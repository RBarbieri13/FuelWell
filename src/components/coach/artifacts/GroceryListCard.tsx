"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { ArtifactSpec, GroceryItem } from "@/lib/coach/types";
import { groceryItemKey, normalizeGroceryInput } from "@/lib/grocery-normalization";
import { cn } from "@/lib/utils/cn";
import type { ArtifactCardProps } from "./contract";

type GroceryListArtifact = ArtifactSpec & {
  items: GroceryItem[];
  added?: string[];
  toggled?: string;
  cleared?: boolean;
};

export function GroceryListCard({ artifact, onAction }: ArtifactCardProps<GroceryListArtifact>) {
  const [draft, setDraft] = useState("");
  const items = (artifact.items ?? []).map((item) => {
    const normalized = normalizeGroceryInput(item.name, item.quantity);
    return { ...item, name: normalized.name, quantity: normalized.quantity ?? item.quantity ?? "1 item" };
  });
  const changedKeys = new Set([
    ...(artifact.added ?? []).map((name) => groceryItemKey(name)),
    ...(artifact.toggled ? [groceryItemKey(artifact.toggled)] : []),
  ]);

  const contextLine = artifact.cleared
    ? "List cleared"
    : artifact.toggled
      ? `Updated ${normalizeGroceryInput(artifact.toggled).name}`
      : artifact.added && artifact.added.length > 0
        ? `Added ${artifact.added.map((name) => normalizeGroceryInput(name).name).join(", ")}`
        : null;

  function submitAdd() {
    const { name, quantity } = normalizeGroceryInput(draft);
    if (!name) return;
    onAction({ kind: "invoke_tool", name: "add_grocery_item", input: { name, quantity } });
    setDraft("");
  }

  return (
    <div className="mt-3 min-w-0 max-w-full rounded-2xl border border-primary-100 bg-white p-3 shadow-[0_12px_30px_rgba(20,90,75,0.06)] sm:p-4">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <p className="text-sm font-black text-[#16302a]">Grocery list</p>
        {contextLine && (
          <span className="min-w-0 break-words text-xs font-bold text-primary-700 sm:text-right">{contextLine}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-muted-foreground">Nothing on the list</p>
      ) : (
        <div className="mt-3 min-w-0 max-w-full max-h-72 overflow-y-auto overflow-x-hidden rounded-[1.25rem] border border-primary-100">
          <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] bg-[#f4f8f6] px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground sm:grid-cols-[3.75rem_minmax(0,1fr)_7.25rem] sm:px-3">
            <span aria-hidden="true" />
            <span>Item</span>
            <span className="hidden sm:block">Quantity</span>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-center border-t border-primary-100/70 px-2 py-2 sm:min-h-12 sm:grid-cols-[3.75rem_minmax(0,1fr)_7.25rem] sm:px-3",
                changedKeys.has(groceryItemKey(item.name)) ? "bg-primary-50/80" : "bg-white"
              )}
            >
              <button
                type="button"
                aria-label={
                  item.checked ? `Mark ${item.name} as not bought` : `Mark ${item.name} as bought`
                }
                onClick={() =>
                  onAction({
                    kind: "invoke_tool",
                    name: "check_grocery_item",
                    input: { item: item.id },
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-primary-50"
              >
                <span
                  className={
                    item.checked
                      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white"
                      : "h-6 w-6 shrink-0 rounded-full border-2 border-primary-100"
                  }
                >
                  {item.checked && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
              <div className="min-w-0 py-1">
                <span
                  className={cn(
                    "block min-w-0 break-words text-sm font-black",
                    item.checked ? "text-muted-foreground line-through" : "text-[#16302a]"
                  )}
                >
                  {item.name}
                </span>
                <span className="mt-1 inline-flex max-w-full break-words rounded-full border border-primary-100 bg-[#f8fbf9] px-2.5 py-1 text-xs font-black text-[#16302a] sm:hidden">
                  {item.quantity ?? "1 item"}
                </span>
              </div>
              <span className="hidden min-w-0 break-words rounded-full border border-primary-100 bg-[#f8fbf9] px-3 py-1.5 text-center text-xs font-black text-[#16302a] sm:block">
                {item.quantity ?? "1 item"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitAdd();
            }
          }}
          placeholder="Add an item"
          aria-label="New grocery item"
          className="min-w-0 flex-1 rounded-xl bg-[#f4f8f6] px-3 py-2.5 text-sm font-medium text-[#16302a] placeholder:text-[#91a7a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          aria-label="Add item to grocery list"
          onClick={submitAdd}
          disabled={!draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:bg-[#91a7a0]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
