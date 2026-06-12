/**
 * Cost ledger + circuit breaker.
 *
 * Caps (locked Phase 0): $5/user/day soft, $10/user/day hard kill. The hard
 * cap is checked BEFORE any model call. Backed by the coach_usage Supabase
 * table for signed-in users; preview users fall back to an in-memory ledger
 * (per server instance — good enough for the demo sample user).
 */

export const SOFT_CAP_USD = Number(process.env.ANTHROPIC_DAILY_BUDGET_USD ?? 5);
export const HARD_CAP_USD = Number(process.env.ANTHROPIC_HARD_KILL_USD ?? 10);

/** USD per million tokens. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
};

export function costUsdCents(model: string, inputTokens: number, outputTokens: number): number {
  const key = Object.keys(PRICING).find((k) => model.startsWith(k));
  const p = key ? PRICING[key] : PRICING["claude-sonnet-4-6"];
  const usd = (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
  return Math.ceil(usd * 100);
}

type LedgerStore = {
  getDayCents(userId: string, day: string): Promise<number>;
  addUsage(row: {
    userId: string;
    day: string;
    inputTokens: number;
    outputTokens: number;
    costUsdCents: number;
    model: string;
  }): Promise<void>;
};

const memory = new Map<string, { cents: number }>();

const memoryStore: LedgerStore = {
  async getDayCents(userId, day) {
    return memory.get(`${userId}:${day}`)?.cents ?? 0;
  },
  async addUsage({ userId, day, costUsdCents: cents }) {
    const key = `${userId}:${day}`;
    memory.set(key, { cents: (memory.get(key)?.cents ?? 0) + cents });
  },
};

// Supabase-backed store is wired in Section D (coach_usage table). Until the
// table exists every caller uses the in-memory ledger.
let store: LedgerStore = memoryStore;
export function setLedgerStore(next: LedgerStore) {
  store = next;
}

export type BudgetCheck =
  | { allowed: true; softCapReached: boolean; spentCents: number }
  | { allowed: false; spentCents: number; message: string };

export async function checkBudget(userId: string, day: string): Promise<BudgetCheck> {
  const spentCents = await store.getDayCents(userId, day);
  if (spentCents >= HARD_CAP_USD * 100) {
    return {
      allowed: false,
      spentCents,
      message:
        "Coach needs to catch its breath — today's session budget is used up. Everything you logged is saved, and Coach is back tomorrow.",
    };
  }
  return { allowed: true, softCapReached: spentCents >= SOFT_CAP_USD * 100, spentCents };
}

export async function recordUsage(
  userId: string,
  day: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  const cents = costUsdCents(model, inputTokens, outputTokens);
  await store.addUsage({ userId, day, inputTokens, outputTokens, costUsdCents: cents, model });
  return cents;
}
