import { describe, expect, it, vi } from "vitest";
import {
  combineHeightParts,
  normalizeAllergies,
  normalizeDisplayName,
  normalizeGoalTimeline,
  splitHeightInches,
  toggleAllergySelection,
  updateProfileAndVerify,
  type ProfileUpdateClient,
} from "@/lib/profile-preferences";

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
});
