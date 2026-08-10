import type { GoalPlan, IntegrationDailySummary } from "@/lib/goal-context";
import type { PreferenceState } from "@/lib/use-preferences";
import type { UnitSystem } from "@/components/settings/use-units";

export type UserAppStateKey = "onboarding_draft" | "grocery_history";

export type OnboardingDraftDocument<TData = Record<string, unknown>> = {
  step: number;
  data: TData;
};

export type GroceryHistoryEntry<TItem = Record<string, unknown>> = {
  id: string;
  savedAt: string;
  itemCount: number;
  checkedCount: number;
  items: TItem[];
};

export type PreferenceApiDocument = {
  preferences: PreferenceState;
  units: UnitSystem;
};

export type GoalContextApiDocument = {
  goalPlan: GoalPlan;
  integrationSummary: IntegrationDailySummary;
};

export type StorageAuthorityMode = "preview" | "server" | "unavailable";

export function resolveStorageAuthorityMode(
  preview: boolean,
  supabaseConfigured: boolean,
): StorageAuthorityMode {
  if (preview) return "preview";
  return supabaseConfigured ? "server" : "unavailable";
}

export type IdentityRequestToken = {
  userId: string | null;
  generation: number;
};

export function createIdentityRequestGate(initialUserId: string | null = null) {
  let userId = initialUserId;
  let generation = 0;

  return {
    transition(nextUserId: string | null): IdentityRequestToken {
      userId = nextUserId;
      generation += 1;
      return { userId, generation };
    },
    isCurrent(token: IdentityRequestToken): boolean {
      return token.userId === userId && token.generation === generation;
    },
    currentUserId(): string | null {
      return userId;
    },
  };
}

export function assertAuthenticatedResponseOwner<T>(
  payload: T,
  expectedUserId: string,
): asserts payload is T & { userId: string } {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    (payload as { userId?: unknown }).userId !== expectedUserId
  ) {
    throw new Error("The response belongs to a different account. Refresh and try again.");
  }
}
