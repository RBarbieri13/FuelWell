export const PREVIEW_IDENTITY_SCOPE = "preview";

const ONBOARDING_DRAFT_PREFIX = "fuelwell:onboarding:v2";
const PREFERENCES_PREFIX = "fuelwell:preferences:v2";

export type HeightParts = {
  feet: number | "";
  inches: number | "";
};

export type ProfileUpdateClient = {
  from(table: "profiles"): {
    update(values: Record<string, unknown>): {
      eq(column: "id", value: string): {
        select(columns: string): {
          maybeSingle(): Promise<{
            data: Record<string, unknown> | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export function splitHeightInches(totalInches: number | "" | null | undefined): HeightParts {
  if (totalInches === "" || totalInches == null || !Number.isFinite(totalInches)) {
    return { feet: "", inches: "" };
  }

  const normalized = Math.max(0, Math.round(totalInches));
  return {
    feet: Math.floor(normalized / 12),
    inches: normalized % 12,
  };
}

export function combineHeightParts(feet: number | "", inches: number | ""): number | "" {
  if (feet === "") return "";
  const normalizedFeet = Math.max(0, Math.floor(feet));
  const normalizedInches = inches === "" ? 0 : Math.min(11, Math.max(0, Math.floor(inches)));
  return normalizedFeet * 12 + normalizedInches;
}

export function normalizeGoalTimeline(value: unknown): string {
  if (value === "urgent" || value === "aggressive") return "aggressive";
  if (value === "patient" || value === "steady") return value;
  return "steady";
}

export function normalizeAllergies(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  return values.flatMap((value) => {
    if (typeof value !== "string") return [];
    const allergy = value.trim();
    const key = allergy.toLocaleLowerCase();
    if (!allergy || key === "none" || seen.has(key)) return [];
    seen.add(key);
    return [allergy];
  });
}

export function toggleAllergySelection(current: string[], choice: string): string[] {
  if (choice.trim().toLocaleLowerCase() === "none") return [];
  const normalized = normalizeAllergies(current);
  const selected = normalized.some(
    (allergy) => allergy.toLocaleLowerCase() === choice.trim().toLocaleLowerCase()
  );
  return selected
    ? normalized.filter(
        (allergy) => allergy.toLocaleLowerCase() !== choice.trim().toLocaleLowerCase()
      )
    : normalizeAllergies([...normalized, choice]);
}

export function normalizeDisplayName(value: string): string | null {
  const name = value.trim();
  return name || null;
}

export function onboardingDraftStorageKey(scope: string): string {
  return `${ONBOARDING_DRAFT_PREFIX}:${scope}`;
}

export function preferenceStorageKey(scope: string): string {
  return `${PREFERENCES_PREFIX}:${scope}`;
}

export function clearUserScopedIdentityCaches(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(onboardingDraftStorageKey(userId));
    window.localStorage.removeItem(preferenceStorageKey(userId));
  } catch {
    // Cache cleanup must never prevent sign-out.
  }
}

function persistedValuesMatch(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected) || (expected !== null && typeof expected === "object")) {
    return JSON.stringify(sortObjectKeys(actual)) === JSON.stringify(sortObjectKeys(expected));
  }
  return Object.is(actual, expected);
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortObjectKeys(item)])
  );
}

export async function updateProfileAndVerify(
  client: ProfileUpdateClient,
  userId: string,
  values: Record<string, unknown>,
  verify: Record<string, unknown> = values
): Promise<Record<string, unknown>> {
  const columns = Array.from(new Set(["id", ...Object.keys(verify)])).join(", ");
  const { data, error } = await client
    .from("profiles")
    .update(values)
    .eq("id", userId)
    .select(columns)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Your profile could not be verified after saving.");

  const mismatch = Object.entries(verify).find(
    ([key, expected]) => !persistedValuesMatch(data[key], expected)
  );
  if (mismatch) {
    throw new Error(`Your saved ${mismatch[0].replaceAll("_", " ")} could not be verified.`);
  }

  return data;
}
