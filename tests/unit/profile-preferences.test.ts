import { afterEach, describe, expect, it, vi } from "vitest";
import { coachChatStorageKey } from "@/lib/coach/chat-storage";
import { goalPlanStorageKey, integrationSummaryStorageKey } from "@/lib/use-goal-context";
import {
  clearUserScopedIdentityCaches,
  combineHeightParts,
  normalizeAllergies,
  normalizeDisplayName,
  onboardingDraftStorageKey,
  preferenceStorageKey,
  normalizeGoalTimeline,
  splitHeightInches,
  toggleAllergySelection,
  updateProfileAndVerify,
  type ProfileUpdateClient,
} from "@/lib/profile-preferences";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeProfileClient(result: {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  return { client: { from } as ProfileUpdateClient, update, eq, select };
}

describe("profile preference mappings", () => {
  it("retains Robby as the persisted display name", () => {
    expect(normalizeDisplayName("  Robby  ")).toBe("Robby");
  });

  it("round-trips normalized height through separate feet and inches", () => {
    expect(combineHeightParts(5, 11)).toBe(71);
    expect(splitHeightInches(71)).toEqual({ feet: 5, inches: 11 });
    expect(combineHeightParts(6, 12)).toBe(83);
  });

  it("treats None as an exclusive clear action and never stores it", () => {
    expect(toggleAllergySelection(["Dairy", "None"], "None")).toEqual([]);
    expect(toggleAllergySelection([], "Shellfish")).toEqual(["Shellfish"]);
    expect(normalizeAllergies(["None", " dairy ", "Dairy", ""])).toEqual(["dairy"]);
  });

  it("maps the legacy urgent value to the Aggressive timeline", () => {
    expect(normalizeGoalTimeline("urgent")).toBe("aggressive");
    expect(normalizeGoalTimeline("aggressive")).toBe("aggressive");
  });
});

describe("verified profile saves", () => {
  it("returns only after the affected row matches", async () => {
    const { client } = makeProfileClient({
      data: { id: "user-1", display_name: "Robby" },
      error: null,
    });
    await expect(
      updateProfileAndVerify(client, "user-1", { display_name: "Robby" })
    ).resolves.toMatchObject({ display_name: "Robby" });
  });

  it("keeps a save failure actionable when the row is missing", async () => {
    const { client } = makeProfileClient({ data: null, error: null });
    await expect(
      updateProfileAndVerify(client, "user-1", { display_name: "Robby" })
    ).rejects.toThrow("could not be verified");
  });

  it("surfaces database save failures", async () => {
    const { client } = makeProfileClient({ data: null, error: { message: "Write denied" } });
    await expect(
      updateProfileAndVerify(client, "user-1", { display_name: "Robby" })
    ).rejects.toThrow("Write denied");
  });

  it("clears coach and goal caches alongside the identity-scoped profile caches", () => {
    const storage = new MemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    storage.setItem(onboardingDraftStorageKey("user-1"), "draft");
    storage.setItem(preferenceStorageKey("user-1"), "prefs");
    storage.setItem(coachChatStorageKey("user-1"), "chat");
    storage.setItem(goalPlanStorageKey("user-1"), "goal");
    storage.setItem(integrationSummaryStorageKey("user-1"), "integration");
    storage.setItem("fuelwell-meal-plan-user-v2:user-1:2026-08-10", "meal plan");

    clearUserScopedIdentityCaches("user-1");

    expect(storage.getItem(onboardingDraftStorageKey("user-1"))).toBeNull();
    expect(storage.getItem(preferenceStorageKey("user-1"))).toBeNull();
    expect(storage.getItem(coachChatStorageKey("user-1"))).toBeNull();
    expect(storage.getItem(goalPlanStorageKey("user-1"))).toBeNull();
    expect(storage.getItem(integrationSummaryStorageKey("user-1"))).toBeNull();
    expect(storage.getItem("fuelwell-meal-plan-user-v2:user-1:2026-08-10")).toBeNull();
  });
});
