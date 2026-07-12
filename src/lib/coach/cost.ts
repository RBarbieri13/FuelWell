/**
 * Cost ledger + circuit breaker.
 *
 * Caps (locked Phase 0): $5/user/day soft, $10/user/day hard kill. The hard
 * cap is checked BEFORE any model call. Signed-in users are metered against
 * the coach_usage Supabase table (see persistence.ts); preview users use the
 * in-memory ledger here (per server instance — fine for the demo sample user).
 */

export const SOFT_CAP_USD = Number(process.env.ANTHROPIC_DAILY_BUDGET_USD ?? 5);
export const HARD_CAP_USD = Number(process.env.ANTHROPIC_HARD_KILL_USD ?? 10);

export const BUDGET_EXCEEDED_MESSAGE =
  "Coach needs to catch its breath — today's session budget is used up. Everything you logged is saved, and Coach is back tomorrow.";

/** USD per million tokens. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "anthropic/claude-haiku-4.5": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "anthropic/claude-sonnet-4.6": { input: 3, output: 15 },
  "google/gemini-3-flash": { input: 0.5, output: 3 },
  "openai/gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "openai/gpt-5.4": { input: 2.5, output: 15 },
};

export function costUsdCents(model: string, inputTokens: number, outputTokens: number): number {
  const key = Object.keys(PRICING).find((k) => model.startsWith(k));
  const p = key ? PRICING[key] : PRICING["claude-sonnet-4-6"];
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
  return Math.ceil(usd * 100);
}

export type BudgetCheck =
  | { allowed: true; softCapReached: boolean; spentCents: number }
  | { allowed: false; spentCents: number; message: string };

export type PaidProviderAccess =
  | { allowed: true }
  | { allowed: false; reason: "anonymous_preview" | "unauthenticated" };

/** Paid Coach inference is reserved for authenticated requests. */
export function evaluatePaidProviderAccess(input: {
  authenticated: boolean;
  anonymousPreview: boolean;
}): PaidProviderAccess {
  if (input.anonymousPreview) return { allowed: false, reason: "anonymous_preview" };
  if (!input.authenticated) return { allowed: false, reason: "unauthenticated" };
  return { allowed: true };
}

/** Pure threshold check — caller supplies today's spend from the right ledger. */
export function evaluateBudget(spentCents: number): BudgetCheck {
  if (spentCents >= HARD_CAP_USD * 100) {
    return { allowed: false, spentCents, message: BUDGET_EXCEEDED_MESSAGE };
  }
  return { allowed: true, softCapReached: spentCents >= SOFT_CAP_USD * 100, spentCents };
}

// In-memory ledger for preview users.
const memory = new Map<string, number>();

export function memoryGetDayCents(userId: string, day: string): number {
  return memory.get(`${userId}:${day}`) ?? 0;
}

export function memoryAddCents(userId: string, day: string, cents: number): void {
  const key = `${userId}:${day}`;
  memory.set(key, (memory.get(key) ?? 0) + cents);
}
