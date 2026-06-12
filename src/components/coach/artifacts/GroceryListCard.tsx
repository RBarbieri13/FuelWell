"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { ArtifactSpec, GroceryItem } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type GroceryListArtifact = ArtifactSpec & {
  items: GroceryItem[];
  added?: string[];
  toggled?: string;
  cleared?: boolean;
};

export function GroceryListCard({ artifact, onAction }: ArtifactCardProps<GroceryListArtifact>) {
  const [draft, setDraft] = useState("");
  const items = artifact.items ?? [];

  const contextLine = artifact.cleared
    ? "List cleared"
    : artifact.toggled
      ? `Toggled ${artifact.toggled}`
      : artifact.added && artifact.added.length > 0
        ? `Added ${artifact.added.join(", ")}`
        : null;

  function submitAdd() {
    const name = draft.trim();
    if (!name) return;
    onAction({ kind: "invoke_tool", name: "add_grocery_item", input: { name } });
    setDraft("");
  }

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black text-neutral-900">Grocery list</p>
        {contextLine && (
          <span className="min-w-0 truncate text-xs font-bold text-primary-700">{contextLine}</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-neutral-500">Nothing on the list</p>
      ) : (
        <ul className="mt-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
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
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-neutral-50"
              >
                <span
                  className={
                    item.checked
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary-500 text-white"
                      : "h-5 w-5 shrink-0 rounded-md border-2 border-neutral-300"
                  }
                >
                  {item.checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span
                  className={
                    item.checked
                      ? "min-w-0 truncate text-sm font-medium text-neutral-400 line-through"
                      : "min-w-0 truncate text-sm font-bold text-neutral-700"
                  }
                >
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
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
          className="min-w-0 flex-1 rounded-xl bg-neutral-100 px-3 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          aria-label="Add item to grocery list"
          onClick={submitAdd}
          disabled={!draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
