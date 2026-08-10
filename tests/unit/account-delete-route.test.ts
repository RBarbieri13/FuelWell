import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasSupabaseConfig: true,
  user: null as null | { id: string; email: string },
  rpc: vi.fn(),
}));

vi.mock("@/lib/preview-session", () => ({
  hasSupabaseConfig: () => mocks.hasSupabaseConfig,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mocks.user } })),
    },
    rpc: mocks.rpc,
  })),
}));

describe("/api/account/delete", () => {
  beforeEach(() => {
    mocks.hasSupabaseConfig = true;
    mocks.user = { id: "user-1", email: "Member@FuelWell.test" };
    mocks.rpc.mockReset();
    mocks.rpc.mockResolvedValue({ error: null });
    process.env.ACCOUNT_DELETE_CONFIRMATION_SECRET = "test-delete-confirmation-secret";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.ACCOUNT_DELETE_CONFIRMATION_SECRET;
  });

  it("issues a fresh destructive confirmation phrase and cookie", async () => {
    const { POST } = await import("@/app/api/account/delete/route");
    const response = await POST();
    const body = (await response.json()) as {
      confirmationPhrase: string;
      expiresAt: string;
    };

    expect(response.status).toBe(200);
    expect(body.confirmationPhrase).toBe("DELETE member@fuelwell.test");
    expect(body.expiresAt).toBe("2026-08-09T12:10:00.000Z");
    expect(response.headers.get("set-cookie")).toContain("fuelwell-delete-confirmation=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("deletes the authenticated account only after a matching fresh confirmation", async () => {
    const route = await import("@/app/api/account/delete/route");
    const challenge = await route.POST();
    const cookie = challenge.headers.get("set-cookie");

    const response = await route.DELETE(
      new Request("http://fuelwell.test/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          cookie: cookie ?? "",
        },
        body: JSON.stringify({ confirmation: "DELETE member@fuelwell.test" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("delete_own_account");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    await expect(response.json()).resolves.toEqual({ signedIn: true, deleted: true });
  });

  it("rejects mismatched confirmation text without calling the delete RPC", async () => {
    const route = await import("@/app/api/account/delete/route");
    const challenge = await route.POST();
    const cookie = challenge.headers.get("set-cookie");

    const response = await route.DELETE(
      new Request("http://fuelwell.test/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          cookie: cookie ?? "",
        },
        body: JSON.stringify({ confirmation: "DELETE something-else" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Type the exact confirmation phrase to delete this account.",
    });
  });

  it("rejects a tampered delete confirmation cookie", async () => {
    const route = await import("@/app/api/account/delete/route");
    const challenge = await route.POST();
    const cookie = challenge.headers.get("set-cookie") ?? "";
    const tampered = cookie.replace(
      /(fuelwell-delete-confirmation=[^.;]+)(\.[^;]+)/,
      "$1.invalid-signature",
    );

    const response = await route.DELETE(
      new Request("http://fuelwell.test/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", cookie: tampered },
        body: JSON.stringify({ confirmation: "DELETE member@fuelwell.test" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Start a fresh account deletion confirmation first.",
    });
  });

  it("requires Supabase configuration and a signed-in session", async () => {
    const route = await import("@/app/api/account/delete/route");

    mocks.hasSupabaseConfig = false;
    const missingConfig = await route.POST();
    expect(missingConfig.status).toBe(503);

    mocks.hasSupabaseConfig = true;
    mocks.user = null;
    const signedOut = await route.DELETE(
      new Request("http://fuelwell.test/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE member@fuelwell.test" }),
      }),
    );
    expect(signedOut.status).toBe(401);
  });
});
