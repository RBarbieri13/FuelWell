"use client";

import { useState } from "react";
import { Check, Plus, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
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
  const boughtCount = items.filter((item) => item.checked).length;

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
    <div className="min-w-0 max-w-full rounded-[24px] border border-hairline bg-surface p-3 shadow-e2 sm:p-4">
      <SectionHeader
        as="h3"
        icon={ShoppingBasket}
        title="Grocery list"
        action={
          items.length > 0 ? (
            <Badge variant="neutral" size="sm" className="tabular-nums">
              {boughtCount}/{items.length} bought
            </Badge>
          ) : undefined
        }
      />

      {contextLine && (
        <p className="mt-2 flex max-w-full items-start gap-1.5 rounded-[0.9rem] bg-primary-50 px-2.5 py-1.5 text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100">
          <span
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
          />
          <span className="min-w-0 break-words">{contextLine}</span>
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-3 flex items-center gap-3 rounded-[1.25rem] bg-surface-muted px-3 py-4 ring-1 ring-inset ring-hairline">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-ink-subtle ring-1 ring-inset ring-hairline-strong"
          >
            <ShoppingBasket className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">Nothing on the list</p>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-ink-muted">
              Add an item below and it lands on the Groceries page too.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 max-h-72 min-w-0 max-w-full overflow-y-auto overflow-x-hidden rounded-[1.25rem] ring-1 ring-inset ring-hairline">
          <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] bg-surface-sunken px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-ink-muted sm:grid-cols-[3.75rem_minmax(0,1fr)_7.25rem] sm:px-3">
            <div aria-hidden="true" />
            <div>Item</div>
            <div className="hidden sm:block">Quantity</div>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "grid min-h-12 min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-center border-t border-hairline px-2 py-1.5 sm:grid-cols-[3.75rem_minmax(0,1fr)_7.25rem] sm:px-3",
                changedKeys.has(groceryItemKey(item.name)) ? "bg-primary-50/80" : "bg-surface"
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
                className="fw-press flex h-11 w-11 items-center justify-center rounded-full hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 active:bg-primary-100"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors",
                    item.checked
                      ? "bg-primary-600 text-white ring-primary-700/20"
                      : "bg-surface ring-hairline-strong"
                  )}
                >
                  {item.checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </button>
              <div className="min-w-0 py-1">
                <span
                  className={cn(
                    "block min-w-0 break-words text-sm font-black",
                    item.checked ? "text-ink-muted line-through" : "text-ink"
                  )}
                >
                  {item.name}
                </span>
                <span className="mt-1 inline-flex max-w-full break-words rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold tabular-nums text-ink-muted ring-1 ring-inset ring-hairline sm:hidden">
                  {item.quantity ?? "1 item"}
                </span>
              </div>
              <span className="hidden min-w-0 break-words rounded-full bg-surface-muted px-3 py-1.5 text-center text-xs font-bold tabular-nums text-ink-muted ring-1 ring-inset ring-hairline sm:block">
                {item.quantity ?? "1 item"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
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
          className="min-h-11 min-w-0 flex-1 rounded-[1rem] bg-surface-muted px-3 py-2.5 text-sm font-semibold text-ink ring-1 ring-inset ring-hairline placeholder:font-medium placeholder:text-ink-subtle focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <Button
          type="button"
          size="icon"
          aria-label="Add item to grocery list"
          onClick={submitAdd}
          disabled={!draft.trim()}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
