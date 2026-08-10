import { afterEach, describe, expect, it, vi } from "vitest";
import { buildDefaultGoalPlan } from "@/lib/goal-context";

class MemoryStorage {
  private values = new Map<string, string>();
  readonly getItem = vi.fn((key: string) => this.values.get(key) ?? null);
  readonly setItem = vi.fn((key: string, value: string) => this.values.set(key, value));
  readonly removeItem = vi.fn((key: string) => this.values.delete(key));
  readonly clear = vi.fn(() => this.values.clear());
  readonly key = vi.fn((index: number) => [...this.values.keys()][index] ?? null);
  get length() { return this.values.size; }
}

function installBrowser(host = "app.fuelwell.test") {
  const localStorage = new MemoryStorage();
  vi.stubGlobal("window", { location: { host }, localStorage });
  return localStorage;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.FUELWELL_PREVIEW_MODE;
  delete process.env.NEXT_PUBLIC_FUELWELL_PREVIEW_MODE;
});

describe("authenticated cross-store authority contract", () => {
  it("fails closed when Supabase is unavailable outside explicit preview mode", async () => {
    const { resolveStorageAuthorityMode } = await import("@/lib/authenticated-storage-types");

    expect(resolveStorageAuthorityMode(false, false)).toBe("unavailable");
    expect(resolveStorageAuthorityMode(false, true)).toBe("server");
    expect(resolveStorageAuthorityMode(true, false)).toBe("preview");
  });

  it("rejects stale hydration generations and responses owned by another account", async () => {
    const {
      assertAuthenticatedResponseOwner,
      createIdentityRequestGate,
    } = await import("@/lib/authenticated-storage-types");
    const gate = createIdentityRequestGate();
    const userARequest = gate.transition("user-a");
    const userBRequest = gate.transition("user-b");

    expect(gate.isCurrent(userARequest)).toBe(false);
    expect(gate.isCurrent(userBRequest)).toBe(true);
    expect(() => assertAuthenticatedResponseOwner({ userId: "user-a" }, "user-b"))
      .toThrow("different account");
    expect(() => assertAuthenticatedResponseOwner({ userId: "user-b" }, "user-b"))
      .not.toThrow();
  });

  it("requires a server acknowledgment for preferences and rolls back a rejected change", async () => {
    const localStorage = installBrowser();
    const request = deferred<{
      likes: string[];
      dislikes: string[];
      diets: [];
      allergies: string[];
    }>();
    const store = await import("@/lib/use-preferences");
    store.configurePreferencesPersistence("user-a", () => request.promise);
    store.hydratePreferencesFromServer({ likes: [], dislikes: [], diets: [], allergies: [] });

    const saved = store.toggleLike("salmon");
    expect(store.getPreferences().likes).toEqual(["salmon"]);
    request.reject(new Error("Server unavailable."));

    await expect(saved).resolves.toBe(false);
    expect(store.getPreferences().likes).toEqual([]);
    expect(store.getPreferencesStoreSnapshot().persistenceError).toContain("rolled back");
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("requires a server acknowledgment for units and resets state at an account boundary", async () => {
    const localStorage = installBrowser();
    const first = await import("@/components/settings/use-units");
    first.configureUnitsPersistence("user-a", async (units) => units);
    first.hydrateUnitsFromServer("imperial");

    first.configureUnitsPersistence("user-b", async () => {
      throw new Error("Units were not saved.");
    });
    const saved = first.setUnits("imperial");
    expect(first.getUnitsSnapshot().units).toBe("imperial");
    await expect(saved).resolves.toBe(false);

    expect(first.getUnitsSnapshot()).toMatchObject({
      units: "metric",
      persistenceError: expect.stringContaining("rolled back"),
    });
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("requires a server acknowledgment for goal changes and never carries a prior user's goal forward", async () => {
    const localStorage = installBrowser();
    const store = await import("@/lib/use-goal-context");
    const priorUserPlan = { ...buildDefaultGoalPlan({ goal: "gain" }), id: "user-a-goal" };
    store.configureGoalContextPersistence("user-a", {
      saveGoalPlan: async (plan) => plan,
      saveIntegrationSummary: async (summary) => summary,
    });
    store.hydrateGoalContextFromServer({
      goalPlan: priorUserPlan,
      integrationSummary: store.getGoalContextSnapshot().integrationSummary,
    });
    expect(store.getGoalContextSnapshot().goalPlan.id).toBe("user-a-goal");

    store.configureGoalContextPersistence("user-b", {
      saveGoalPlan: async () => { throw new Error("Goal was not saved."); },
      saveIntegrationSummary: async (summary) => summary,
    });
    expect(store.getGoalContextSnapshot().goalPlan.id).not.toBe("user-a-goal");
    const candidate = { ...buildDefaultGoalPlan({ goal: "maintain" }), id: "user-b-goal" };
    const saved = store.setGoalPlan(candidate);
    expect(store.getGoalContextSnapshot().goalPlan.id).toBe("user-b-goal");

    await expect(saved).resolves.toBe(false);
    expect(store.getGoalContextSnapshot().goalPlan.id).not.toBe("user-b-goal");
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("keeps browser persistence limited to explicitly separate preview scopes", async () => {
    const localStorage = installBrowser("localhost:3000");
    const preferences = await import("@/lib/use-preferences");
    const units = await import("@/components/settings/use-units");
    const goals = await import("@/lib/use-goal-context");
    preferences.configurePreviewPreferences();
    units.configurePreviewUnits();
    goals.configurePreviewGoalContext();

    await preferences.toggleLike("salmon");
    await units.setUnits("imperial");
    await goals.setGoalPlan({ ...buildDefaultGoalPlan({ goal: "maintain" }), id: "preview-goal" });

    const keys = localStorage.setItem.mock.calls.map(([key]) => key);
    expect(keys.length).toBeGreaterThanOrEqual(3);
    expect(keys.every((key) => key.includes("preview"))).toBe(true);
    expect(keys.some((key) => key.includes("user-a"))).toBe(false);
  });

  it("does not substitute browser Coach history for an authenticated server read failure", async () => {
    installBrowser();
    const { resolveCoachHistoryHydration } = await import("@/lib/coach/client-store");
    const hydration = resolveCoachHistoryHydration(
      null,
      {
        date: "2026-08-09",
        items: [{ id: "stale", role: "assistant", text: "Stale local answer", artifacts: [] }],
      },
      "user-a",
    );

    expect(hydration.source).toBe("error");
    expect(hydration.scope).toBe("user-a");
    expect(hydration.items.map((item) => item.text)).not.toContain("Stale local answer");
  });

  it("applies Coach mutations only after the server acknowledges the turn", async () => {
    installBrowser();
    const { createCoachMutationAckBuffer } = await import("@/lib/coach/client-store");
    const applied: string[] = [];
    const buffer = createCoachMutationAckBuffer((mutation) => applied.push(mutation.kind));
    const mutation = {
      kind: "set_preferences" as const,
      patch: { likes: ["salmon"] },
    };

    buffer.stage([mutation]);
    expect(buffer.size()).toBe(1);
    expect(applied).toEqual([]);
    buffer.discard();
    expect(applied).toEqual([]);

    buffer.stage([mutation]);
    buffer.acknowledge();
    expect(applied).toEqual(["set_preferences"]);
    expect(buffer.size()).toBe(0);
  });

  it("ignores a late preference acknowledgment from the previous account without dropping the new queue", async () => {
    installBrowser();
    const store = await import("@/lib/use-preferences");
    const userAWrite = deferred<{ likes: string[]; dislikes: string[]; diets: []; allergies: string[] }>();
    const userBWrite = deferred<{ likes: string[]; dislikes: string[]; diets: []; allergies: string[] }>();
    store.configurePreferencesPersistence("user-a", () => userAWrite.promise);
    store.hydratePreferencesFromServer({ likes: [], dislikes: [], diets: [], allergies: [] }, "user-a");
    const userASaved = store.toggleLike("user-a-food");

    store.configurePreferencesPersistence("user-b", () => userBWrite.promise);
    store.hydratePreferencesFromServer({ likes: ["user-b-food"], dislikes: [], diets: [], allergies: [] }, "user-b");
    const userBSaved = store.toggleLike("shared-food");
    userAWrite.resolve({ likes: ["user-a-food"], dislikes: [], diets: [], allergies: [] });
    await Promise.resolve();
    await Promise.resolve();

    expect(store.getPreferences().likes).toEqual(["user-b-food", "shared-food"]);
    userBWrite.resolve({ likes: ["user-b-food", "shared-food"], dislikes: [], diets: [], allergies: [] });
    await expect(userASaved).resolves.toBe(false);
    await expect(userBSaved).resolves.toBe(true);
    expect(store.getPreferences().likes).toEqual(["user-b-food", "shared-food"]);
  });

  it("ignores a late unit acknowledgment from the previous account", async () => {
    installBrowser();
    const store = await import("@/components/settings/use-units");
    const userAWrite = deferred<"imperial">();
    const userBWrite = deferred<"metric">();
    store.configureUnitsPersistence("user-a", () => userAWrite.promise);
    store.hydrateUnitsFromServer("metric", "user-a");
    const userASaved = store.setUnits("imperial");

    store.configureUnitsPersistence("user-b", () => userBWrite.promise);
    store.hydrateUnitsFromServer("imperial", "user-b");
    const userBSaved = store.setUnits("metric");
    userAWrite.resolve("imperial");
    await Promise.resolve();
    await Promise.resolve();

    expect(store.getUnitsSnapshot().units).toBe("metric");
    userBWrite.resolve("metric");
    await expect(userASaved).resolves.toBe(false);
    await expect(userBSaved).resolves.toBe(true);
    expect(store.getUnitsSnapshot().units).toBe("metric");
  });

  it("ignores a late goal acknowledgment from the previous account", async () => {
    installBrowser();
    const store = await import("@/lib/use-goal-context");
    const userAWrite = deferred<ReturnType<typeof buildDefaultGoalPlan>>();
    const userBWrite = deferred<ReturnType<typeof buildDefaultGoalPlan>>();
    const integrationWriter = async (summary: Parameters<typeof store.setIntegrationSummary>[0]) => summary;
    store.configureGoalContextPersistence("user-a", {
      saveGoalPlan: () => userAWrite.promise,
      saveIntegrationSummary: integrationWriter,
    });
    const userASaved = store.setGoalPlan({ ...buildDefaultGoalPlan({ goal: "gain" }), id: "user-a-goal" });

    store.configureGoalContextPersistence("user-b", {
      saveGoalPlan: () => userBWrite.promise,
      saveIntegrationSummary: integrationWriter,
    });
    const userBPlan = { ...buildDefaultGoalPlan({ goal: "maintain" }), id: "user-b-goal" };
    const userBSaved = store.setGoalPlan(userBPlan);
    userAWrite.resolve({ ...buildDefaultGoalPlan({ goal: "gain" }), id: "user-a-goal" });
    await Promise.resolve();
    await Promise.resolve();

    expect(store.getGoalContextSnapshot().goalPlan.id).toBe("user-b-goal");
    userBWrite.resolve(userBPlan);
    await expect(userASaved).resolves.toBe(false);
    await expect(userBSaved).resolves.toBe(true);
    expect(store.getGoalContextSnapshot().goalPlan.id).toBe("user-b-goal");
  });

  it("uses auth events as the current identity and ignores a stale initial getUser result", async () => {
    const initial = deferred<{ data: { user: { id: string } | null } }>();
    const authListener: {
      current?: (event: string, session: { user: { id: string } } | null) => void;
    } = {};
    const unsubscribe = vi.fn();
    const { subscribeAuthenticatedUserIds } = await import("@/lib/preferences-sync");
    const seen: Array<string | null> = [];
    const stop = subscribeAuthenticatedUserIds({
      auth: {
        getUser: () => initial.promise,
        onAuthStateChange: (listener) => {
          authListener.current = listener;
          return { data: { subscription: { unsubscribe } } };
        },
      },
    }, (userId) => seen.push(userId));

    authListener.current?.("SIGNED_IN", { user: { id: "user-b" } });
    initial.resolve({ data: { user: { id: "user-a" } } });
    await Promise.resolve();
    expect(seen).toEqual(["user-b"]);
    authListener.current?.("TOKEN_REFRESHED", { user: { id: "user-b" } });
    expect(seen).toEqual(["user-b"]);

    stop();
    authListener.current?.("SIGNED_IN", { user: { id: "user-c" } });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(seen).toEqual(["user-b"]);
  });

  it("aborts and discards a Coach turn when the authenticated identity changes", async () => {
    const { createCoachMutationAckBuffer, createCoachTurnIdentityGuard } =
      await import("@/lib/coach/client-store");
    const applied: string[] = [];
    const buffer = createCoachMutationAckBuffer((mutation) => applied.push(mutation.kind));
    const guard = createCoachTurnIdentityGuard("user-a");
    const userATurn = guard.capture();
    const userAController = new AbortController();
    expect(guard.attach(userATurn, userAController)).toBe(true);
    buffer.stage([{ kind: "set_preferences", patch: { likes: ["user-a-food"] } }]);

    expect(guard.changeScope("user-b")).toBe(true);
    expect(userAController.signal.aborted).toBe(true);
    if (guard.isCurrent(userATurn)) buffer.acknowledge();
    else buffer.discard();
    expect(applied).toEqual([]);

    const userBTurn = guard.capture();
    buffer.stage([{ kind: "set_preferences", patch: { likes: ["user-b-food"] } }]);
    if (guard.isCurrent(userBTurn)) buffer.acknowledge();
    expect(applied).toEqual(["set_preferences"]);
  });
});
