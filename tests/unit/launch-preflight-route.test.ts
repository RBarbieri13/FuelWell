import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getLaunchPreflight: vi.fn(),
  getLiveLaunchPreflight: vi.fn(),
  hasSupabaseConfig: vi.fn(),
  currentUser: null as { id: string } | null,
}));

vi.mock("@/lib/launch-preflight", () => ({
  getLaunchPreflight: mocks.getLaunchPreflight,
}));

vi.mock("@/lib/live-launch-preflight", () => ({
  getLiveLaunchPreflight: mocks.getLiveLaunchPreflight,
}));

vi.mock("@/lib/preview-session", () => ({
  hasSupabaseConfig: mocks.hasSupabaseConfig,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

beforeEach(() => {
  mocks.currentUser = null;
  mocks.getLaunchPreflight.mockReset();
  mocks.getLaunchPreflight.mockReturnValue({ previewReady: true, productionReady: false, checks: [] });
  mocks.getLiveLaunchPreflight.mockReset();
  mocks.getLiveLaunchPreflight.mockResolvedValue({ liveReady: true, liveChecks: [] });
  mocks.hasSupabaseConfig.mockReset();
  mocks.hasSupabaseConfig.mockReturnValue(true);
  mocks.createClient.mockReset();
  mocks.createClient.mockResolvedValue({
    auth: { getUser: vi.fn(async () => ({ data: { user: mocks.currentUser } })) },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("launch-preflight route", () => {
  it("keeps the safe preflight JSON public when live mode is not requested", async () => {
    const { GET } = await import("@/app/api/launch-preflight/route");
    const response = await GET(new Request("https://fuelwell.test/api/launch-preflight"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ previewReady: true, productionReady: false, checks: [] });
    expect(mocks.getLiveLaunchPreflight).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated live probes without an internal secret", async () => {
    const { GET } = await import("@/app/api/launch-preflight/route");
    const response = await GET(new Request("https://fuelwell.test/api/launch-preflight?live=1"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Live launch preflight requires authentication or an internal release secret.",
    });
    expect(mocks.getLiveLaunchPreflight).not.toHaveBeenCalled();
  });

  it("allows live probes with the internal release secret", async () => {
    vi.stubEnv("LAUNCH_PREFLIGHT_LIVE_SECRET", "top-secret");
    const { GET } = await import("@/app/api/launch-preflight/route");
    const response = await GET(new Request("https://fuelwell.test/api/launch-preflight?live=1", {
      headers: { "x-launch-preflight-secret": "top-secret" },
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      previewReady: true,
      productionReady: false,
      checks: [],
      liveReady: true,
      liveChecks: [],
    });
    expect(mocks.getLiveLaunchPreflight).toHaveBeenCalledOnce();
  });
});
