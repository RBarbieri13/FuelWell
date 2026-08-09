import {
  createCoachProviderClient,
  providerModelId,
  resolveCoachProviderConfig,
} from "@/lib/coach/provider-client";
import { classifyProviderError } from "@/lib/coach/provider-health";

export type LivePreflightCheck = {
  id: string;
  label: string;
  state: "pass" | "fail";
  detail: string;
};

export type LiveLaunchPreflight = {
  liveReady: boolean;
  liveChecks: LivePreflightCheck[];
};

const REQUIRED_TABLES = [
  "profiles",
  "meals",
  "workout_sessions",
  "grocery_lists",
  "body_log_entries",
  "goal_plans",
  "integration_daily_summaries",
  "daily_goal_contexts",
  "coach_conversations",
  "coach_messages",
  "coach_usage",
  "coach_audit",
  "coach_knowledge_bases",
] as const;

type Dependencies = {
  fetcher?: typeof fetch;
  probeProvider?: () => Promise<void>;
  env?: Record<string, string | undefined>;
};

async function defaultProviderProbe(env: Record<string, string | undefined>) {
  const config = resolveCoachProviderConfig(env);
  if (!config) throw new Error("missing_provider_config");

  const client = createCoachProviderClient(config);
  await client.messages.create(
    {
      model: providerModelId(config, "claude-haiku-4-5"),
      max_tokens: 16,
      messages: [{ role: "user", content: "Reply OK" }],
    },
    { timeout: 15_000 },
  );
}

export async function getLiveLaunchPreflight(
  dependencies: Dependencies = {},
): Promise<LiveLaunchPreflight> {
  const env = dependencies.env ?? process.env;
  const fetcher = dependencies.fetcher ?? fetch;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const schemaChecks = await Promise.all(REQUIRED_TABLES.map(async (table) => {
    if (!supabaseUrl || !anonKey) {
      return {
        id: `live-table-${table}`,
        label: `${table} table`,
        state: "fail" as const,
        detail: "Supabase runtime configuration is missing.",
      };
    }

    try {
      const response = await fetcher(
        `${supabaseUrl}/rest/v1/${table}?select=id&limit=0`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            Accept: "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        },
      );
      return {
        id: `live-table-${table}`,
        label: `${table} table`,
        state: response.ok ? "pass" as const : "fail" as const,
        detail: response.ok
          ? "The live Data API exposes this RLS-protected table."
          : `The live Data API returned HTTP ${response.status}.`,
      };
    } catch {
      return {
        id: `live-table-${table}`,
        label: `${table} table`,
        state: "fail" as const,
        detail: "The live Data API could not be reached.",
      };
    }
  }));

  let providerCheck: LivePreflightCheck;
  try {
    await (dependencies.probeProvider ?? (() => defaultProviderProbe(env)))();
    providerCheck = {
      id: "live-coach-provider",
      label: "Live Coach provider",
      state: "pass",
      detail: "The configured Coach provider completed a real minimal inference request.",
    };
  } catch (error) {
    providerCheck = {
      id: "live-coach-provider",
      label: "Live Coach provider",
      state: "fail",
      detail: `The provider probe failed (${classifyProviderError(error)}).`,
    };
  }

  const liveChecks = [...schemaChecks, providerCheck];
  return {
    liveReady: liveChecks.every((check) => check.state === "pass"),
    liveChecks,
  };
}
