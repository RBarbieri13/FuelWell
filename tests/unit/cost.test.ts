import { describe, expect, it } from "vitest";
import {
  BUDGET_EXCEEDED_MESSAGE,
  HARD_CAP_USD,
  SOFT_CAP_USD,
  costUsdCents,
  evaluateBudget,
  evaluatePaidProviderAccess,
  memoryAddCents,
  memoryGetDayCents,
} from "@/lib/coach/cost";

describe("evaluatePaidProviderAccess", () => {
  it("blocks anonymous preview from paid inference", () => {
    expect(
      evaluatePaidProviderAccess({ authenticated: false, anonymousPreview: true }),
    ).toEqual({ allowed: false, reason: "anonymous_preview" });
  });

  it("allows authenticated requests", () => {
    expect(
      evaluatePaidProviderAccess({ authenticated: true, anonymousPreview: false }),
    ).toEqual({ allowed: true });
  });
});

describe("costUsdCents", () => {
  it("prices haiku at $1/M input + $5/M output, rounded up to whole cents", () => {
    expect(costUsdCents("claude-haiku-4-5", 1_000_000, 1_000_000)).toBe(600);
    // 100k in + 50k out = $0.10 + $0.25 = $0.35
    expect(costUsdCents("claude-haiku-4-5", 100_000, 50_000)).toBe(35);
  });

  it("prices sonnet at $3/M input + $15/M output", () => {
    expect(costUsdCents("claude-sonnet-4-6", 1_000_000, 1_000_000)).toBe(1800);
    // 250k in + 250k out = $0.75 + $3.75 = $4.50 (binary-exact fractions)
    expect(costUsdCents("claude-sonnet-4-6", 250_000, 250_000)).toBe(450);
  });

  it("matches dated model snapshots via prefix", () => {
    expect(costUsdCents("claude-haiku-4-5-20251001", 1_000_000, 1_000_000)).toBe(600);
  });

  it("falls back to sonnet pricing for unknown models", () => {
    expect(costUsdCents("claude-mystery-9", 1_000_000, 1_000_000)).toBe(1800);
  });

  it("rounds tiny non-zero costs up to 1 cent, and zero tokens cost 0", () => {
    expect(costUsdCents("claude-haiku-4-5", 100, 100)).toBe(1);
    expect(costUsdCents("claude-haiku-4-5", 0, 0)).toBe(0);
  });
});

describe("evaluateBudget", () => {
  it("uses the locked Phase 0 caps ($5 soft, $10 hard)", () => {
    expect(SOFT_CAP_USD).toBe(5);
    expect(HARD_CAP_USD).toBe(10);
  });

  it("allows spend under the soft cap with no flag", () => {
    const check = evaluateBudget(499);
    expect(check).toEqual({ allowed: true, softCapReached: false, spentCents: 499 });
  });

  it("flags the soft cap at exactly 500 cents but still allows", () => {
    const check = evaluateBudget(500);
    expect(check).toEqual({ allowed: true, softCapReached: true, spentCents: 500 });
  });

  it("still allows at 999 cents (one cent under the hard cap)", () => {
    const check = evaluateBudget(999);
    expect(check).toEqual({ allowed: true, softCapReached: true, spentCents: 999 });
  });

  it("blocks at exactly 1000 cents with the budget-exceeded message", () => {
    const check = evaluateBudget(1000);
    expect(check).toEqual({
      allowed: false,
      spentCents: 1000,
      message: BUDGET_EXCEEDED_MESSAGE,
    });
  });

  it("blocks above the hard cap", () => {
    const check = evaluateBudget(5000);
    expect(check.allowed).toBe(false);
    if (!check.allowed) expect(check.message).toBe(BUDGET_EXCEEDED_MESSAGE);
  });
});

describe("memory ledger", () => {
  it("starts at 0 for an unseen user/day", () => {
    expect(memoryGetDayCents("ledger-user-a", "2026-06-11")).toBe(0);
  });

  it("accumulates cents across additions for the same user/day", () => {
    memoryAddCents("ledger-user-b", "2026-06-11", 30);
    memoryAddCents("ledger-user-b", "2026-06-11", 12);
    expect(memoryGetDayCents("ledger-user-b", "2026-06-11")).toBe(42);
  });

  it("keeps days and users separate", () => {
    memoryAddCents("ledger-user-c", "2026-06-10", 100);
    memoryAddCents("ledger-user-c", "2026-06-11", 7);
    expect(memoryGetDayCents("ledger-user-c", "2026-06-10")).toBe(100);
    expect(memoryGetDayCents("ledger-user-c", "2026-06-11")).toBe(7);
    expect(memoryGetDayCents("ledger-user-d", "2026-06-10")).toBe(0);
  });

  it("feeds evaluateBudget: accumulated spend crossing the hard cap blocks", () => {
    memoryAddCents("ledger-user-e", "2026-06-11", 990);
    expect(evaluateBudget(memoryGetDayCents("ledger-user-e", "2026-06-11")).allowed).toBe(true);
    memoryAddCents("ledger-user-e", "2026-06-11", 10);
    const check = evaluateBudget(memoryGetDayCents("ledger-user-e", "2026-06-11"));
    expect(check.allowed).toBe(false);
    if (!check.allowed) expect(check.message).toBe(BUDGET_EXCEEDED_MESSAGE);
  });
});
