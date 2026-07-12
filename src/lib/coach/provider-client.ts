import Anthropic from "@anthropic-ai/sdk";

export type CoachProviderConfig = {
  provider: "vercel_ai_gateway" | "anthropic";
  credential: string;
  baseURL?: string;
};

function configured(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Prefer the deployment-scoped gateway so Coach is not tied to one vendor balance. */
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

  const anthropicCredential = configured(env.ANTHROPIC_API_KEY);
  return anthropicCredential
    ? { provider: "anthropic", credential: anthropicCredential }
    : null;
}

export function providerModelId(config: CoachProviderConfig, model: string) {
  if (config.provider !== "vercel_ai_gateway" || model.includes("/")) return model;
  return `anthropic/${model}`;
}

export function createCoachProviderClient(config: CoachProviderConfig) {
  return new Anthropic({
    apiKey: config.credential,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });
}
