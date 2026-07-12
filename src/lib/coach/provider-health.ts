export const PROVIDER_FAILURE_CLASSES = [
  "missing_config",
  "auth",
  "billing_credit",
  "permission_model",
  "rate_limit",
  "timeout",
  "unavailable",
] as const;

export type ProviderFailureClass = (typeof PROVIDER_FAILURE_CLASSES)[number];

export type SanitizedProviderIncident = {
  provider: "vercel_ai_gateway" | "anthropic";
  operation: "coach_turn";
  failureClass: ProviderFailureClass;
  occurredAt: string;
  retryable: boolean;
  statusCode?: number;
  model?: string;
};

type ErrorSignals = {
  status?: number;
  code: string;
  type: string;
  name: string;
  message: string;
};

let lastSuccessAt: string | null = null;
let lastIncident: SanitizedProviderIncident | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599) {
      return value;
    }
  }
  return undefined;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string") return value.toLowerCase().slice(0, 500);
  }
  return "";
}

function errorSignals(error: unknown): ErrorSignals {
  const outer = asRecord(error);
  const nested = asRecord(outer.error);
  return {
    status: firstNumber(outer.status, outer.statusCode, nested.status, nested.statusCode),
    code: firstString(outer.code, nested.code),
    type: firstString(outer.type, nested.type),
    name: firstString(outer.name, nested.name, error instanceof Error ? error.name : undefined),
    message: firstString(
      outer.message,
      nested.message,
      error instanceof Error ? error.message : undefined,
    ),
  };
}

export function classifyProviderError(error: unknown): ProviderFailureClass {
  const signal = errorSignals(error);
  const text = `${signal.code} ${signal.type} ${signal.name} ${signal.message}`;

  if (/missing.*(?:api[_ -]?key|config)|api[_ -]?key.*(?:missing|not configured)/i.test(text)) {
    return "missing_config";
  }
  if (signal.status === 401 || /authentication|invalid[_ -]?api[_ -]?key|unauthorized/i.test(text)) {
    return "auth";
  }
  if (
    signal.status === 402 ||
    /billing|credit balance|purchase credits|payment required|insufficient[_ -]?(?:quota|credit)|quota exceeded/i.test(text)
  ) {
    return "billing_credit";
  }
  if (
    signal.status === 403 ||
    /permission|forbidden|model.*(?:not found|unavailable|access)|not_found_error|access denied/i.test(text)
  ) {
    return "permission_model";
  }
  if (signal.status === 429 || /rate[_ -]?limit|too many requests|overloaded_error/i.test(text)) {
    return "rate_limit";
  }
  if (
    signal.status === 408 ||
    signal.status === 504 ||
    /timeout|timed out|etimedout|aborterror/i.test(text)
  ) {
    return "timeout";
  }
  return "unavailable";
}

function sanitizeModel(model: string | undefined): string | undefined {
  if (!model) return undefined;
  return /^[a-z0-9._:-]{1,80}$/i.test(model) ? model : undefined;
}

export function createSanitizedProviderIncident(input: {
  failureClass: ProviderFailureClass;
  provider?: SanitizedProviderIncident["provider"];
  model?: string;
  statusCode?: number;
  occurredAt?: string;
}): SanitizedProviderIncident {
  const statusCode = firstNumber(input.statusCode);
  return {
    provider: input.provider ?? "anthropic",
    operation: "coach_turn",
    failureClass: input.failureClass,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    retryable: ["rate_limit", "timeout", "unavailable"].includes(input.failureClass),
    ...(statusCode ? { statusCode } : {}),
    ...(sanitizeModel(input.model) ? { model: sanitizeModel(input.model) } : {}),
  };
}

export async function recordProviderIncident(
  incident: SanitizedProviderIncident,
  persist?: (incident: SanitizedProviderIncident) => Promise<void>,
): Promise<void> {
  lastIncident = incident;
  if (persist) {
    try {
      await persist(incident);
      return;
    } catch {
      // Fall through to a sanitized server log when persistence is unavailable.
    }
  }
  console.warn("coach provider incident", incident);
}

export function markProviderSuccess(at = new Date().toISOString()): void {
  lastSuccessAt = at;
}

export function getProviderHealth(
  apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.ANTHROPIC_API_KEY,
): {
  state: "missing_config" | "unverified" | "healthy" | "degraded";
  healthy: boolean;
  configured: boolean;
  lastSuccessAt: string | null;
  lastFailureClass: ProviderFailureClass | null;
} {
  const configured = Boolean(apiKey?.trim());
  if (!configured) {
    return {
      state: "missing_config",
      healthy: false,
      configured: false,
      lastSuccessAt,
      lastFailureClass: lastIncident?.failureClass ?? null,
    };
  }

  const incidentIsNewest = Boolean(
    lastIncident && (!lastSuccessAt || lastIncident.occurredAt >= lastSuccessAt),
  );
  const state = incidentIsNewest ? "degraded" : lastSuccessAt ? "healthy" : "unverified";
  return {
    state,
    healthy: state === "healthy",
    configured: true,
    lastSuccessAt,
    lastFailureClass: lastIncident?.failureClass ?? null,
  };
}

export function providerErrorStatus(error: unknown): number | undefined {
  return errorSignals(error).status;
}
