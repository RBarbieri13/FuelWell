import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadGroceryList, replaceGroceryList } from "@/lib/grocery-repository";
import type { RichGroceryItem } from "@/lib/use-grocery-list";

type ResponseValue = { data: unknown; error: { message: string } | null };
type Call = { table: string; method: string; args: unknown[] };

function makeSupabase(responses: Record<string, ResponseValue[]>, calls: Call[]) {
  function chain(table: string) {
    let operation = "select";
    const result = () => {
      const queue = responses[`${table}.${operation}`] ?? [];
      return queue.shift() ?? { data: null, error: null };
    };
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "upsert", "delete", "in"]) {
      builder[method] = (...args: unknown[]) => {
        if (["upsert", "delete"].includes(method)) operation = method;
        calls.push({ table, method, args });
        return builder;
      };
    }
    builder.single = () => Promise.resolve(result());
    builder.maybeSingle = () => Promise.resolve(result());
    builder.then = (resolve: (value: ResponseValue) => unknown) => Promise.resolve(result()).then(resolve);
    return builder;
  }
  return { from: (table: string) => chain(table) } as unknown as SupabaseClient;
}

const item: RichGroceryItem = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "five bananas",
  amount: "5",
  quantity: "5",
  category: "Produce",
  source: "Coach",
  checked: false,
  servingSize: "1 medium",
  classification: "produce + micronutrients",
  vitaminBenefit: "potassium",
};

const itemRow = {
  id: item.id,
  name: "Bananas",
  quantity: 5,
  unit: "item",
  quantity_text: "5",
  category: "Produce",
  checked: false,
  position: 0,
  notes: JSON.stringify({
    source: "Coach",
    servingSize: "1 medium",
    classification: "produce + micronutrients",
    vitaminBenefit: "potassium",
  }),
};

describe("grocery repository", () => {
  it("loads only the requested user's dated list and canonicalizes stored rows", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "grocery_lists.select": [{ data: { id: "list-a" }, error: null }],
      "grocery_items.select": [{ data: [itemRow], error: null }],
    }, calls);

    await expect(loadGroceryList(supabase, "user-a", "2026-07-12")).resolves.toEqual([
      expect.objectContaining({ name: "Bananas", amount: "5", quantity: "5", source: "Coach" }),
    ]);
    expect(calls).toEqual(expect.arrayContaining([
      { table: "grocery_lists", method: "eq", args: ["user_id", "user-a"] },
      { table: "grocery_lists", method: "eq", args: ["list_date", "2026-07-12"] },
      { table: "grocery_items", method: "eq", args: ["user_id", "user-a"] },
      { table: "grocery_items", method: "eq", args: ["grocery_list_id", "list-a"] },
    ]));
  });

  it("uses stable idempotency keys and returns authoritative server items", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({
      "grocery_lists.select": [{ data: null, error: null }],
      "grocery_lists.upsert": [{ data: { id: "list-a" }, error: null }],
      "grocery_items.select": [
        { data: [], error: null },
        { data: [itemRow], error: null },
      ],
      "grocery_items.upsert": [{ data: null, error: null }],
    }, calls);

    await expect(replaceGroceryList(supabase, "user-a", "2026-07-12", [item])).resolves.toEqual([
      expect.objectContaining({ name: "Bananas", quantity: "5" }),
    ]);
    const listUpsert = calls.find((call) => call.table === "grocery_lists" && call.method === "upsert");
    expect(listUpsert?.args).toEqual([
      expect.objectContaining({
        user_id: "user-a",
        idempotency_key: "grocery-list:2026-07-12",
      }),
      { onConflict: "user_id,list_date,name" },
    ]);
    const itemUpsert = calls.find((call) => call.table === "grocery_items" && call.method === "upsert");
    expect(itemUpsert?.args).toEqual([
      [expect.objectContaining({
        id: item.id,
        user_id: "user-a",
        grocery_list_id: "list-a",
        idempotency_key: item.id,
        name: "Bananas",
        quantity: 5,
      })],
      { onConflict: "id" },
    ]);
  });

  it("restores the prior list after a failed authenticated replacement", async () => {
    const calls: Call[] = [];
    const priorRow = { ...itemRow, name: "Apples", quantity_text: "2", quantity: 2 };
    const supabase = makeSupabase({
      "grocery_lists.select": [{ data: { id: "list-a" }, error: null }],
      "grocery_items.select": [{ data: [priorRow], error: null }],
      "grocery_items.upsert": [
        { data: null, error: { message: "write failed" } },
        { data: null, error: null },
      ],
    }, calls);

    await expect(replaceGroceryList(supabase, "user-a", "2026-07-12", [item]))
      .rejects.toThrow("write failed");
    const upserts = calls.filter((call) => call.table === "grocery_items" && call.method === "upsert");
    expect(upserts).toHaveLength(2);
    expect(upserts[1].args[0]).toEqual([
      expect.objectContaining({ name: "Apples", user_id: "user-a", grocery_list_id: "list-a" }),
    ]);
    const itemUserFilters = calls.filter(
      (call) => call.table === "grocery_items" && call.method === "eq" && call.args[0] === "user_id",
    );
    expect(itemUserFilters.every((call) => call.args[1] === "user-a")).toBe(true);
  });

  it("rejects malformed dates before issuing a query", async () => {
    const calls: Call[] = [];
    const supabase = makeSupabase({}, calls);
    await expect(loadGroceryList(supabase, "user-a", "07/12/2026"))
      .rejects.toThrow("YYYY-MM-DD");
    expect(calls).toEqual([]);
  });
});
