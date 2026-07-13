import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSnapshot } from "./helpers";

const mocks = vi.hoisted(() => ({
  anthropicConstructor: vi.fn(),
  createClient: vi.fn(),
  providerStream: vi.fn(),
  currentUser: null as { id: string } | null,
  insertedAudits: [] as unknown[],
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class AnthropicMock {
    messages = { stream: mocks.providerStream };

    constructor() {
      mocks.anthropicConstructor();
    }
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ host: "localhost:3000" })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/coach/persistence", () => ({
  ensureConversation: vi.fn(async () => "conversation-1"),
  getSupabaseDayCents: vi.fn(async () => 0),
  insertSupabaseAudit: vi.fn(async (_supabase, row) => {
    mocks.insertedAudits.push(row);
  }),
  insertSupabaseUsage: vi.fn(async () => undefined),
  loadCoachKnowledge: vi.fn(async () => null),
  mergeProfilePreferences: vi.fn(async () => undefined),
  persistCoachKnowledge: vi.fn(async () => undefined),
  persistCoachMutations: vi.fn(async () => undefined),
  saveCoachUploadedArtifacts: vi.fn(async () => undefined),
  saveMessages: vi.fn(async () => undefined),
}));

describe("Coach paid-provider access", () => {
  beforeEach(() => {
    mocks.anthropicConstructor.mockClear();
    mocks.createClient.mockReset();
    mocks.createClient.mockImplementation(async () => ({
      auth: { getUser: vi.fn(async () => ({ data: { user: mocks.currentUser } })) },
    }));
    mocks.providerStream.mockReset();
    mocks.currentUser = null;
    mocks.insertedAudits.length = 0;
    process.env.ANTHROPIC_API_KEY = "configured-for-test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fuelwell.test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("does not require Supabase configuration for an anonymous preview", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { POST } = await import("@/app/api/coach/turn/route");
    const response = await POST(
      new Request("http://localhost:3000/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What should I eat tonight?" }],
          snapshot: makeSnapshot(),
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("deterministic-provider-fallback");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("uses deterministic fallback for anonymous preview with zero provider calls", async () => {
    const { POST } = await import("@/app/api/coach/turn/route");
    const response = await POST(
      new Request("http://localhost:3000/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "What should I eat tonight?" }],
          snapshot: makeSnapshot(),
        }),
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("deterministic-provider-fallback");
    expect(body).not.toContain("configured-for-test");
    expect(mocks.anthropicConstructor).not.toHaveBeenCalled();
    expect(mocks.providerStream).not.toHaveBeenCalled();
  });

  it("sanitizes signed-in provider failures before fallback and incident persistence", async () => {
    const rawProviderPayload = {
      status: 402,
      error: {
        type: "billing_error",
        message: "raw provider JSON with account details",
        request_id: "secret-provider-request-id",
      },
    };
    mocks.currentUser = { id: "signed-in-user" };
    mocks.providerStream.mockReturnValue({
      on: vi.fn(),
      finalMessage: vi.fn(async () => {
        throw rawProviderPayload;
      }),
    });

    const { POST } = await import("@/app/api/coach/turn/route");
    const response = await POST(
      new Request("https://fuelwell.example/api/coach/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Help me plan dinner." }],
          snapshot: makeSnapshot(),
        }),
      }),
    );
    const body = await response.text();
    const persisted = JSON.stringify(mocks.insertedAudits);

    expect(mocks.anthropicConstructor).toHaveBeenCalledOnce();
    expect(mocks.providerStream).toHaveBeenCalledOnce();
    expect(body).toContain("deterministic-provider-fallback");
    expect(body).not.toContain("raw provider JSON");
    expect(body).not.toContain("secret-provider-request-id");
    expect(persisted).toContain('"failureClass":"billing_credit"');
    expect(persisted).not.toContain("raw provider JSON");
    expect(persisted).not.toContain("secret-provider-request-id");
  });
});
