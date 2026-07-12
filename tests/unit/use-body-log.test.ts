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
const serverEntry = { date, weightKg: 79.8, mood: 4, waterMl: 1200 };

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

describe("body log persistence store", () => {
  it("keeps preview entries in a date-scoped cache and merges daily fields", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-body-log-preview-v2:${date}`, JSON.stringify([serverEntry]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ signedIn: false, entries: [] })));

    const store = await import("@/lib/use-body-log");
    await store.initializeBodyLog();
    await store.addBodyLogEntry({ date, mood: 5 });

    expect(store.getBodyLogSnapshot()).toMatchObject({
      entries: [{ date, weightKg: 79.8, mood: 5, waterMl: 1200 }],
      persistence: { mode: "preview", status: "saved", userId: null },
    });
    const saved = JSON.parse(storage.getItem(`fuelwell-body-log-preview-v2:${date}`)!);
    expect(saved.entries).toEqual([{ date, weightKg: 79.8, mood: 5, waterMl: 1200 }]);
  });

  it("uses the authenticated server and isolates another user's dated cache", async () => {
    const storage = installBrowser();
    storage.setItem(`fuelwell-body-log-user-v2:user-a:${date}`, JSON.stringify([{ date, mood: 1 }]));
    storage.setItem(`fuelwell-body-log-user-v2:user-b:${date}`, JSON.stringify([{ date, mood: 2 }]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      signedIn: true,
      userId: "user-a",
      entries: [serverEntry],
    })));

    const store = await import("@/lib/use-body-log");
    await store.initializeBodyLog();

    expect(store.getBodyLogSnapshot()).toMatchObject({
      entries: [serverEntry],
      persistence: { mode: "authenticated", userId: "user-a" },
    });
    expect(JSON.parse(storage.getItem(`fuelwell-body-log-user-v2:user-b:${date}`)!)[0].mood).toBe(2);
  });

  it("posts a UUID key and rolls back an optimistic authenticated failure", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", entries: [serverEntry] }))
      .mockResolvedValueOnce(jsonResponse({ error: "database unavailable" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-body-log");
    await store.initializeBodyLog();
    const result = await store.addBodyLogEntry({ date, waterMl: 2000 });

    expect(result).toEqual({ ok: false, error: "database unavailable" });
    expect(store.getBodyLogSnapshot()).toMatchObject({
      entries: [serverEntry],
      persistence: { status: "error", error: "database unavailable" },
    });
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    const body = JSON.parse(request.body as string) as { idempotencyKey: string };
    expect(body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejects a response that switches authenticated users mid-mutation", async () => {
    installBrowser();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-a", entries: [serverEntry] }))
      .mockResolvedValueOnce(jsonResponse({ signedIn: true, userId: "user-b", entries: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const store = await import("@/lib/use-body-log");
    await store.initializeBodyLog();
    const result = await store.addBodyLogEntry({ date, mood: 5 });

    expect(result).toEqual({
      ok: false,
      error: "Authenticated body log response did not match the current user.",
    });
    expect(store.getBodyLogSnapshot().entries).toEqual([serverEntry]);
  });
});
