import { existsSync } from "fs";
import path from "path";
import { version } from "../../package.json";

export type PreflightState = "pass" | "warn" | "fail";

export type PreflightCheck = {
  id: string;
  label: string;
  detail: string;
  state: PreflightState;
  requiredForPreview: boolean;
  requiredForProduction: boolean;
};

export type LaunchPreflight = {
  generatedAt: string;
  version: string;
  previewReady: boolean;
  productionReady: boolean;
  checks: PreflightCheck[];
  routeChecks: Array<{ label: string; path: string; required: boolean }>;
};

function present(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

function migrationExists(fileName: string) {
  return existsSync(path.join(process.cwd(), "supabase", "migrations", fileName));
}

const routeChecks = [
  { label: "Preview hub", path: "/preview", required: true },
  { label: "Established dashboard", path: "/app/dashboard", required: true },
  { label: "New user intake preview", path: "/preview/new-user", required: true },
  { label: "Coach", path: "/app/coach", required: true },
  { label: "Coach attachments", path: "/app/coach/attachments", required: true },
  { label: "Coach artifact history", path: "/api/coach/artifacts", required: false },
  { label: "Menu review", path: "/app/coach/menu-review", required: true },
  { label: "Nutrition detail", path: "/app/nutrition", required: true },
  { label: "Activity detail", path: "/app/fitness", required: true },
  { label: "Daily review", path: "/app/daily-review", required: true },
  { label: "Workout database", path: "/app/workouts", required: true },
  { label: "Progress", path: "/app/progress", required: true },
  { label: "Settings", path: "/app/settings", required: true },
];

export function getLaunchPreflight(): LaunchPreflight {
  const hasCoachProvider =
    present(process.env.VERCEL_OIDC_TOKEN) ||
    present(process.env.AI_GATEWAY_API_KEY) ||
    (process.env.VERCEL_ENV !== "production" && present(process.env.ANTHROPIC_API_KEY));
  const hasSupabase =
    present(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const previewMode =
    present(process.env.FUELWELL_PREVIEW_MODE) ||
    present(process.env.NEXT_PUBLIC_FUELWELL_PREVIEW_MODE) ||
    process.env.VERCEL_ENV === "preview";
  const hasBaseRls = migrationExists("20260611180000_base_schema.sql");
  const hasProfilePreferences = migrationExists("20260612120000_profiles_preferences_jsonb.sql");
  const hasCoachRls = migrationExists("20260611180100_coach_tables.sql");
  const hasKnowledgeRls = migrationExists("20260620170000_coach_knowledge_bases.sql");
  const hasArtifactStorage = migrationExists("20260627042014_coach_uploaded_artifacts.sql");
  const hasGoalContext = migrationExists("20260612170000_goal_loop_integrations.sql");
  const hasFitnessGrocery = migrationExists("20260712200713_fitness_grocery_foundation.sql");
  const hasBodyLog = migrationExists("20260712213000_body_log_entries.sql");
  const hasServerAuthoritativeState = migrationExists("20260810040034_server_authoritative_user_app_state.sql");

  const checks: PreflightCheck[] = [
    {
      id: "coach-provider",
      label: "Vision-capable Coach AI",
      detail: hasCoachProvider
        ? "Coach has an approved AI Gateway or development provider credential for streamed tools, image, PDF, and text interpretation."
        : "Missing an approved Coach provider credential. Production requires Vercel deployment OIDC or an AI Gateway key.",
      state: hasCoachProvider ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "supabase",
      label: "Supabase auth and database",
      detail: hasSupabase
        ? "Supabase URL and anon key are present. Signed-in routes can use auth and database reads."
        : "Supabase public environment values are missing. Preview can use sample mode, but signed-in persistence is not ready.",
      state: hasSupabase ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "preview-mode",
      label: "Preview mode guard",
      detail: previewMode
        ? "Preview mode is enabled or the deployment is a Vercel preview."
        : "Preview mode flag is not explicit. Localhost still previews, but hosted review should set preview mode deliberately.",
      state: previewMode ? "pass" : "warn",
      requiredForPreview: true,
      requiredForProduction: false,
    },
    {
      id: "rls-base",
      label: "Nutrition and profile RLS migration",
      detail: hasBaseRls
        ? "Base schema migration with user-scoped nutrition/profile policies is present in the repo."
        : "Base schema migration was not found. User data isolation cannot be proven from this checkout.",
      state: hasBaseRls ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "profile-preferences-schema",
      label: "Profile preferences persistence",
      detail: hasProfilePreferences
        ? "The profile preference document used by onboarding and Settings is defined in a tracked migration."
        : "The profile preferences migration is missing. Onboarding and Settings cannot be declared durable.",
      state: hasProfilePreferences ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "rls-coach",
      label: "Coach conversation RLS migration",
      detail: hasCoachRls
        ? "Coach conversation, message, usage, and audit RLS migration is present."
        : "Coach RLS migration was not found. Per-user Coach history isolation is not proven.",
      state: hasCoachRls ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "rls-knowledge",
      label: "Coach memory isolation migration",
      detail: hasKnowledgeRls
        ? "Coach knowledge-base migration is present and scoped by user_id."
        : "Coach knowledge-base migration was not found. Durable Coach memory isolation is not proven.",
      state: hasKnowledgeRls ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "goal-context-schema",
      label: "Goal and daily context persistence",
      detail: hasGoalContext
        ? "Goal plans, events, daily decision context, and integration summaries are defined in a user-scoped migration."
        : "Goal-context persistence migration is missing.",
      state: hasGoalContext ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "fitness-grocery-schema",
      label: "Workout and grocery persistence",
      detail: hasFitnessGrocery
        ? "Workout sessions, exercise sets, activities, and grocery lists are defined with ownership policies."
        : "Fitness and grocery persistence migration is missing.",
      state: hasFitnessGrocery ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "body-log-schema",
      label: "Body check-in persistence",
      detail: hasBodyLog
        ? "Weight, mood, and water check-ins are defined with one user-owned entry per day."
        : "Body check-in persistence migration is missing.",
      state: hasBodyLog ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "server-authoritative-state-schema",
      label: "Server-authoritative user state",
      detail: hasServerAuthoritativeState
        ? "Authenticated app state is defined in a tracked, user-owned migration instead of relying on browser storage."
        : "The server-authoritative user state migration is missing. Signed-in state cannot be declared durable or isolated.",
      state: hasServerAuthoritativeState ? "pass" : "fail",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "file-storage",
      label: "Uploaded artifact storage",
      detail: hasArtifactStorage
        ? "Private coach-artifacts storage bucket and user-scoped uploaded artifact metadata migration are present."
        : "Current Coach attachments are passed into the turn request for interpretation, but durable per-user file history still needs object storage before production file archives.",
      state: hasArtifactStorage ? "pass" : "warn",
      requiredForPreview: false,
      requiredForProduction: true,
    },
    {
      id: "route-health",
      label: "Route health console",
      detail:
        "The review deck can check core routes from the browser and show recoverable failures before Max reviews the preview.",
      state: "pass",
      requiredForPreview: true,
      requiredForProduction: false,
    },
  ];

  const previewReady = checks.every(
    (check) => !check.requiredForPreview || check.state !== "fail"
  );
  const productionReady = checks.every(
    (check) => !check.requiredForProduction || check.state === "pass"
  );

  return {
    generatedAt: new Date().toISOString(),
    version,
    previewReady,
    productionReady,
    checks,
    routeChecks,
  };
}
