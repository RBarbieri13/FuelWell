import { afterEach, describe, expect, it, vi } from "vitest";
import { todayIsoDate } from "@/lib/fuelwell-data";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

const date = todayIsoDate();
const serverItem = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Bananas",
  amount: "5",
  quantity: "5",
  category: "Produce" as const,
  source: "Coach",
  checked: false,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function installBrowser(storage = new MemoryStorage()) {
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("grocery persistence store", () => {
  it("keeps preview groceries in a date-scoped cache", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-grocery-preview-v2:${date}`, JSON.stringify([serverItem]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ signedIn: false, items: [] })));

    const store = await import("@/lib/use-grocery-list");
    await store.initializeGroceryList();
    expect(store.getGrocerySnapshot()).toMatchObject({
      items: [expect.objectContaining({ name: "Bananas" })],
      persistence: { mode: "preview", status: "saved", userId: null },
    });

    const result = await store.setGroceryItems([
      { ...serverItem, id: "preview-apples", name: "two apples", amount: "2" },
    ]);
    expect(result).toMatchObject({ ok: true });
    const saved = JSON.parse(storage.getItem(`fuelwell-grocery-preview-v2:${date}`)!);
    expect(saved).toEqual([expect.objectContaining({ name: "Apples", quantity: "2" })]);
  });

  it("uses the authenticated server over cache and never overwrites another user's cache", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-grocery-user-v2:user-a:${date}`, JSON.stringify([{ ...serverItem, name: "Stale" }]));
    storage.setItem(`fuelwell-grocery-user-v2:user-b:${date}`, JSON.stringify([{ ...serverItem, name: "Private B" }]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      signedIn: true,
      userId: "user-a",
      date,
      items: [serverItem],
    })));

    const store = await import("@/lib/use-grocery-list");
    await store.initializeGroceryList();

    expect(store.getGrocerySnapshot()).toMatchObject({
      items: [expect.objectContaining({ name: "Bananas" })],
      persistence: { mode: "authenticated", userId: "user-a" },
    });
    expect(JSON.parse(storage.getItem(`fuelwell-grocery-user-v2:user-b:${date}`)!)[0].name).toBe("Private B");
  });

  it("rolls back an optimistic authenticated mutation when persistence fails", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, items: [serverItem] }))
      .mockResolvedValueOnce(jsonResponse({ error: "database unavailable" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-grocery-list");
    await store.initializeGroceryList();
    const result = await store.setGroceryItems([{ ...serverItem, checked: true }]);

    expect(result).toEqual({ ok: false, error: "database unavailable" });
    expect(store.getGrocerySnapshot()).toMatchObject({
      items: [expect.objectContaining({ checked: false })],
      persistence: { status: "error", error: "database unavailable" },
    });
  });

  it("canonicalizes, deduplicates, and reuses legacy ID aliases across retries", async () => {
    installBrowser();
    const posted: Array<{ items: typeof serverItem[] }> = [];
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.body) {
        return jsonResponse({ signedIn: true, userId: "user-a", date, items: [] });
      }
      const body = JSON.parse(init.body as string) as { items: typeof serverItem[] };
      posted.push(body);
      return jsonResponse({ signedIn: true, userId: "user-a", date, items: body.items });
    });
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-grocery-list");
    await store.initializeGroceryList();
    const input = [
      { ...serverItem, id: "coach-bananas", name: "five bananas", amount: "5" },
      { ...serverItem, id: "duplicate-bananas", name: "bananas (5)", amount: "5" },
    ];
    await store.setGroceryItems(input);
    await store.setGroceryItems(input);

    expect(posted).toHaveLength(2);
    expect(posted[0].items).toHaveLength(1);
    expect(posted[0].items[0]).toMatchObject({ name: "Bananas", quantity: "5" });
    expect(posted[0].items[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(posted[1].items[0].id).toBe(posted[0].items[0].id);
  });

  it("rejects a response that switches authenticated users mid-mutation", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", date, items: [serverItem] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-b", date, items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-grocery-list");
    await store.initializeGroceryList();
    const result = await store.setGroceryItems([]);
    expect(result).toEqual({
      ok: false,
      error: "Authenticated grocery response did not match the current user.",
    });
    expect(store.getGrocerySnapshot().items).toEqual([
      expect.objectContaining({ name: "Bananas" }),
    ]);
  });
});
