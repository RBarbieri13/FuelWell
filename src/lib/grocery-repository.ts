import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import type { GroceryCategory, RichGroceryItem } from "@/lib/use-grocery-list";

type GroceryListRow = {
  id: string;
};

type GroceryItemRow = {
  id: string;
  name: string;
  quantity: number | string | null;
  unit: string | null;
  quantity_text: string | null;
  category: string | null;
  checked: boolean;
  position: number;
  notes: string | null;
};

const LIST_NAME = "Grocery list";
const ITEM_SELECT =
  "id, name, quantity, unit, quantity_text, category, checked, position, notes";
const CATEGORIES = new Set<GroceryCategory>([
  "Protein",
  "Produce",
  "Pantry",
  "Dairy",
  "Frozen",
  "Other",
]);

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Grocery list date must use YYYY-MM-DD format.");
  }
}

function errorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

function category(value: string | null): GroceryCategory {
  return value && CATEGORIES.has(value as GroceryCategory)
    ? (value as GroceryCategory)
    : "Other";
}

type StoredDetails = Pick<
  RichGroceryItem,
  "source" | "servingSize" | "classification" | "vitaminBenefit"
>;

function parseDetails(notes: string | null): Partial<StoredDetails> {
  if (!notes) return {};
  try {
    const value = JSON.parse(notes) as Partial<StoredDetails>;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function amountFromRow(row: GroceryItemRow) {
  if (row.quantity_text?.trim()) return row.quantity_text.trim();
  const quantity = row.quantity === null ? "" : String(Number(row.quantity));
  return [quantity, row.unit?.trim()].filter(Boolean).join(" ") || "1 item";
}

function mapItem(row: GroceryItemRow): RichGroceryItem {
  const details = parseDetails(row.notes);
  const normalized = normalizeGroceryInput(row.name, amountFromRow(row));
  const amount = normalized.quantity ?? amountFromRow(row);
  return {
    id: row.id,
    name: normalized.name,
    amount,
    quantity: amount,
    category: category(row.category),
    source: details.source || "Manual",
    checked: row.checked,
    ...(details.servingSize ? { servingSize: details.servingSize } : {}),
    ...(details.classification ? { classification: details.classification } : {}),
    ...(details.vitaminBenefit ? { vitaminBenefit: details.vitaminBenefit } : {}),
  };
}

function quantityParts(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) {
    return { quantity: null, unit: null, quantity_text: cleaned || "1 item" };
  }
  return {
    quantity: Number(match[1]),
    unit: match[2].trim() || "item",
    quantity_text: cleaned,
  };
}

function itemRow(
  item: RichGroceryItem,
  userId: string,
  groceryListId: string,
  position: number,
) {
  const normalized = normalizeGroceryInput(item.name, item.quantity ?? item.amount);
  const quantityText = normalized.quantity ?? item.quantity ?? item.amount ?? "1 item";
  const quantity = quantityParts(quantityText);
  return {
    id: item.id,
    user_id: userId,
    grocery_list_id: groceryListId,
    idempotency_key: item.id,
    name: normalized.name,
    ...quantity,
    category: category(item.category),
    checked: item.checked,
    checked_at: item.checked ? new Date().toISOString() : null,
    position,
    notes: JSON.stringify({
      source: item.source || "Manual",
      servingSize: item.servingSize,
      classification: item.classification,
      vitaminBenefit: item.vitaminBenefit,
    } satisfies StoredDetails),
  };
}

async function findList(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<GroceryListRow | null> {
  assertDate(date);
  const { data, error } = await supabase
    .from("grocery_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("list_date", date)
    .eq("name", LIST_NAME)
    .maybeSingle();
  if (error) throw new Error(errorMessage(error, "Unable to find grocery list."));
  return (data as GroceryListRow | null) ?? null;
}

async function ensureList(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<{ list: GroceryListRow; created: boolean }> {
  const existing = await findList(supabase, userId, date);
  if (existing) return { list: existing, created: false };

  const { data, error } = await supabase
    .from("grocery_lists")
    .upsert(
      {
        user_id: userId,
        list_date: date,
        name: LIST_NAME,
        source: "app",
        idempotency_key: `grocery-list:${date}`,
      },
      { onConflict: "user_id,list_date,name" },
    )
    .select("id")
    .single();
  if (error || !data?.id) {
    throw new Error(errorMessage(error, "Unable to create grocery list."));
  }
  return { list: data as GroceryListRow, created: true };
}

async function loadItems(
  supabase: SupabaseClient,
  userId: string,
  groceryListId: string,
) {
  const { data, error } = await supabase
    .from("grocery_items")
    .select(ITEM_SELECT)
    .eq("user_id", userId)
    .eq("grocery_list_id", groceryListId)
    .order("position", { ascending: true });
  if (error) throw new Error(errorMessage(error, "Unable to load grocery items."));
  return ((data ?? []) as GroceryItemRow[]).map(mapItem);
}

export async function loadGroceryList(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<RichGroceryItem[]> {
  const list = await findList(supabase, userId, date);
  return list ? loadItems(supabase, userId, list.id) : [];
}

async function restoreItems(
  supabase: SupabaseClient,
  userId: string,
  groceryListId: string,
  before: RichGroceryItem[],
  incomingIds: string[],
) {
  const beforeIds = new Set(before.map((item) => item.id));
  const addedIds = incomingIds.filter((id) => !beforeIds.has(id));
  if (addedIds.length > 0) {
    await supabase
      .from("grocery_items")
      .delete()
      .eq("user_id", userId)
      .eq("grocery_list_id", groceryListId)
      .in("id", addedIds);
  }
  if (before.length > 0) {
    await supabase
      .from("grocery_items")
      .upsert(
        before.map((item, position) => itemRow(item, userId, groceryListId, position)),
        { onConflict: "id" },
      );
  }
}

export async function replaceGroceryList(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  items: RichGroceryItem[],
): Promise<RichGroceryItem[]> {
  const { list, created } = await ensureList(supabase, userId, date);
  const before = await loadItems(supabase, userId, list.id);
  const rows = items.map((item, position) => itemRow(item, userId, list.id, position));
  const incomingIds = rows.map((row) => row.id);

  try {
    if (rows.length > 0) {
      const { error } = await supabase
        .from("grocery_items")
        .upsert(rows, { onConflict: "id" });
      if (error) throw new Error(errorMessage(error, "Unable to save grocery items."));
    }

    const staleIds = before
      .map((item) => item.id)
      .filter((id) => !incomingIds.includes(id));
    if (staleIds.length > 0) {
      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("user_id", userId)
        .eq("grocery_list_id", list.id)
        .in("id", staleIds);
      if (error) throw new Error(errorMessage(error, "Unable to remove grocery items."));
    }

    return loadItems(supabase, userId, list.id);
  } catch (error) {
    if (created) {
      await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", list.id)
        .eq("user_id", userId);
    } else {
      await restoreItems(supabase, userId, list.id, before, incomingIds);
    }
    throw error;
  }
}
