import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildDefaultGoalPlan } from "@/lib/goal-context";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadUserAppState: vi.fn(),
  saveUserAppState: vi.fn(),
  deleteUserAppState: vi.fn(),
  loadProfilePreferenceDocument: vi.fn(),
  mergeOwnProfilePreferences: vi.fn(),
  persistGoalPlan: vi.fn(),
  persistIntegrationSummary: vi.fn(),
}));

vi.mock("@/lib/preview-session", () => ({ hasSupabaseConfig: () => true }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/authenticated-storage-repository", () => ({
  loadUserAppState: mocks.loadUserAppState,
  saveUserAppState: mocks.saveUserAppState,
  deleteUserAppState: mocks.deleteUserAppState,
  loadProfilePreferenceDocument: mocks.loadProfilePreferenceDocument,
  mergeOwnProfilePreferences: mocks.mergeOwnProfilePreferences,
}));
vi.mock("@/lib/coach/persistence", () => ({
  persistGoalPlan: mocks.persistGoalPlan,
  persistIntegrationSummary: mocks.persistIntegrationSummary,
}));

import {
  DELETE as deleteOnboarding,
  GET as getOnboarding,
  PUT as putOnboarding,
} from "@/app/api/user-state/onboarding-draft/route";
import {
  GET as getGroceryHistory,
  PUT as putGroceryHistory,
} from "@/app/api/user-state/grocery-history/route";
import {
  GET as getPreferences,
  PUT as putPreferences,
} from "@/app/api/user-state/preferences/route";
import { PUT as putGoalContext } from "@/app/api/user-state/goal-context/route";

function supabaseFor(userId: string | null) {
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: userId ? { id: userId } : null } })) },
  };
}

function jsonRequest(body: unknown, method = "PUT") {
  return new Request("https://fuelwell.test/api/user-state", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue(supabaseFor("session-user"));
  mocks.saveUserAppState.mockImplementation(
    async (_client, _userId, _key, state) => state,
  );
  mocks.loadUserAppState.mockResolvedValue(null);
  mocks.loadProfilePreferenceDocument.mockResolvedValue({});
  mocks.mergeOwnProfilePreferences.mockImplementation(async (_client, patch) => patch);
});

describe("authenticated user-state routes", () => {
  it("derives onboarding ownership from the session instead of request data", async () => {
    const draft = { step: 4, data: { displayName: "Robby" } };
    const response = await putOnboarding(jsonRequest({
      draft,
      userId: "attacker-chosen-user",
      expectedUserId: "session-user",
    }));

    expect(response.status).toBe(200);
    await expect(response.clone().json()).resolves.toMatchObject({ userId: "session-user" });
    expect(mocks.saveUserAppState).toHaveBeenCalledWith(
      expect.anything(),
      "session-user",
      "onboarding_draft",
      draft,
    );
  });

  it("derives grocery-history ownership from the session", async () => {
    const history = [{
      id: "history-1",
      savedAt: "2026-08-09T12:00:00.000Z",
      itemCount: 1,
      checkedCount: 0,
      items: [{ id: "banana", name: "Bananas" }],
    }];
    const response = await putGroceryHistory(jsonRequest({
      history,
      userId: "other-user",
      expectedUserId: "session-user",
    }));

    expect(response.status).toBe(200);
    await expect(response.clone().json()).resolves.toMatchObject({ userId: "session-user" });
    expect(mocks.saveUserAppState).toHaveBeenCalledWith(
      expect.anything(),
      "session-user",
      "grocery_history",
      history,
    );
  });

  it("rejects onboarding and grocery writes after an in-flight account change", async () => {
    const onboarding = await putOnboarding(jsonRequest({
      expectedUserId: "user-a",
      draft: { step: 1, data: {} },
    }));
    const grocery = await putGroceryHistory(jsonRequest({
      expectedUserId: "user-a",
      history: [],
    }));

    expect(onboarding.status).toBe(409);
    expect(grocery.status).toBe(409);
    expect(mocks.saveUserAppState).not.toHaveBeenCalled();
  });

  it("uses the atomic preferences RPC repository and returns the acknowledged document", async () => {
    const preferences = {
      likes: ["salmon"], dislikes: [], diets: ["high-protein"], allergies: [],
    };
    mocks.mergeOwnProfilePreferences.mockResolvedValue({ ...preferences, units: "imperial" });
    const response = await putPreferences(jsonRequest({
      preferences,
      units: "imperial",
      expectedUserId: "session-user",
    }));

    expect(response.status).toBe(200);
    expect(mocks.mergeOwnProfilePreferences).toHaveBeenCalledWith(
      expect.anything(),
      { ...preferences, units: "imperial" },
    );
    await expect(response.json()).resolves.toEqual({
      preferences,
      units: "imperial",
      userId: "session-user",
    });
  });

  it("rejects a preference write if the browser's expected identity no longer matches the session", async () => {
    const response = await putPreferences(jsonRequest({
      expectedUserId: "user-a",
      units: "imperial",
    }));

    expect(response.status).toBe(409);
    expect(mocks.mergeOwnProfilePreferences).not.toHaveBeenCalled();
  });

  it("persists a goal under the authenticated user before acknowledging it", async () => {
    const goalPlan = { ...buildDefaultGoalPlan({ goal: "maintain" }), id: "goal-1" };
    const response = await putGoalContext(jsonRequest({
      goalPlan,
      userId: "other-user",
      expectedUserId: "session-user",
    }));

    expect(response.status).toBe(200);
    await expect(response.clone().json()).resolves.toMatchObject({ userId: "session-user" });
    expect(mocks.persistGoalPlan).toHaveBeenCalledWith(
      expect.anything(),
      "session-user",
      goalPlan,
      "User goal context update",
    );
  });

  it("rejects a goal write if the authenticated account changed in flight", async () => {
    const goalPlan = { ...buildDefaultGoalPlan({ goal: "maintain" }), id: "goal-1" };
    const response = await putGoalContext(jsonRequest({
      expectedUserId: "user-a",
      goalPlan,
    }));

    expect(response.status).toBe(409);
    expect(mocks.persistGoalPlan).not.toHaveBeenCalled();
  });

  it("rejects every signed-out write before a repository mutation", async () => {
    mocks.createClient.mockResolvedValue(supabaseFor(null));
    const response = await putOnboarding(jsonRequest({ draft: { step: 1, data: {} } }));

    expect(response.status).toBe(401);
    expect(mocks.saveUserAppState).not.toHaveBeenCalled();
  });

  it("returns the authenticated owner on every user-state read", async () => {
    const responses = await Promise.all([
      getOnboarding(),
      getGroceryHistory(),
      getPreferences(),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
    await expect(Promise.all(responses.map((response) => response.json())))
      .resolves.toEqual(expect.arrayContaining([
        expect.objectContaining({ userId: "session-user" }),
        expect.objectContaining({ userId: "session-user" }),
        expect.objectContaining({ userId: "session-user" }),
      ]));
  });

  it("rejects every write or delete that omits expectedUserId", async () => {
    const goalPlan = { ...buildDefaultGoalPlan({ goal: "maintain" }), id: "goal-1" };
    const responses = await Promise.all([
      putOnboarding(jsonRequest({ draft: { step: 1, data: {} } })),
      putGroceryHistory(jsonRequest({ history: [] })),
      putPreferences(jsonRequest({ units: "imperial" })),
      putGoalContext(jsonRequest({ goalPlan })),
      deleteOnboarding(jsonRequest({}, "DELETE")),
    ]);

    expect(responses.map((response) => response.status)).toEqual([400, 400, 400, 400, 400]);
    expect(mocks.saveUserAppState).not.toHaveBeenCalled();
    expect(mocks.mergeOwnProfilePreferences).not.toHaveBeenCalled();
    expect(mocks.persistGoalPlan).not.toHaveBeenCalled();
    expect(mocks.deleteUserAppState).not.toHaveBeenCalled();
  });

  it("rejects delete when the expected account no longer matches the session", async () => {
    const response = await deleteOnboarding(jsonRequest(
      { expectedUserId: "user-a" },
      "DELETE",
    ));

    expect(response.status).toBe(409);
    expect(mocks.deleteUserAppState).not.toHaveBeenCalled();
  });

  it("returns the owner after an acknowledged delete", async () => {
    const response = await deleteOnboarding(jsonRequest(
      { expectedUserId: "session-user" },
      "DELETE",
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ cleared: true, userId: "session-user" });
  });
});
