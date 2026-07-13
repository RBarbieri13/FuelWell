import Anthropic from "@anthropic-ai/sdk";

export type CoachProviderConfig = {
  provider: "vercel_ai_gateway" | "anthropic";
  credential: string;
  baseURL?: string;
};

const GATEWAY_MODELS: Record<string, string> = {
  "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
};

const GATEWAY_FALLBACKS: Record<string, string[]> = {
  "claude-haiku-4-5": ["google/gemini-3-flash", "openai/gpt-5.4-mini"],
  "claude-sonnet-4-6": ["openai/gpt-5.4", "google/gemini-3-flash"],
};

function configured(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Prefer an explicit Gateway key, then deployment OIDC, so operators can recover from OIDC account gates. */
export function resolveCoachProviderConfig(
  env: Record<string, string | undefined> = process.env,
): CoachProviderConfig | null {
  const gatewayCredential =
    configured(env.AI_GATEWAY_API_KEY) ?? configured(env.VERCEL_OIDC_TOKEN);
  if (gatewayCredential) {
    return {
      provider: "vercel_ai_gateway",
      credential: gatewayCredential,
      baseURL: "https://ai-gateway.vercel.sh",
    };
  }

  const allowDirect =
    env.VERCEL_ENV !== "production" || /^(1|true|yes)$/i.test(env.COACH_ALLOW_DIRECT_ANTHROPIC ?? "");
  const anthropicCredential = allowDirect ? configured(env.ANTHROPIC_API_KEY) : null;
  return anthropicCredential
    ? { provider: "anthropic", credential: anthropicCredential }
    : null;
}

export function providerModelId(config: CoachProviderConfig, model: string) {
  if (config.provider !== "vercel_ai_gateway" || model.includes("/")) return model;
  return GATEWAY_MODELS[model] ?? `anthropic/${model}`;
}

export function providerModelCandidates(config: CoachProviderConfig, model: string) {
  const primary = providerModelId(config, model);
  if (config.provider !== "vercel_ai_gateway") return [primary];
  const configuredFallbacks = process.env.COACH_GATEWAY_FALLBACK_MODELS
    ?.split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  return [primary, ...(configuredFallbacks?.length ? configuredFallbacks : (GATEWAY_FALLBACKS[model] ?? []))];
}

export function createCoachProviderClient(config: CoachProviderConfig) {
  return new Anthropic({
    apiKey: config.credential,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });
}
