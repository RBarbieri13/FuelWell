import type { z } from "zod";
import type {
  MacroTargets,
  MacroTotals,
  MealRecord,
} from "@/lib/fuelwell-data";
import type {
  DailyGoalContext,
  GoalPlan,
  IntegrationDailySummary,
} from "@/lib/goal-context";

/**
 * Coach agentic core types.
 *
 * Tools run SERVER-SIDE inside /api/coach/turn against a snapshot of the
 * client's day state (sent with every request). Tools that write return a
 * `mutation` the client applies to the shared useDayLog/localStorage store —
 * the same store the Log page writes — so chat actions and the rest of the
 * app never disagree (D-gate). Signed-in users additionally dual-write to
 * Supabase via the client store.
 */

// ---------------------------------------------------------------------------
// Day-state snapshot sent by the client with every turn
// ---------------------------------------------------------------------------

export type WorkoutEntry = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  loggedAt: string;
  calories?: number;
  distanceMiles?: number;
  met?: number;
  source?: "coach" | "database" | "manual_activity" | "manual_edit";
  exercises?: Array<{ name: string; sets?: number; reps?: number; weightKg?: number }>;
  notes?: string;
};

export type GroceryItem = { id: string; name: string; checked: boolean };

export type BodyLogEntry = { date: string; weightKg?: number; mood?: number; waterMl?: number };

export type CoachDaySnapshot = {
  date: string;
  meals: MealRecord[];
  totals: MacroTotals;
  targets: MacroTargets;
  workouts: WorkoutEntry[];
  grocery: GroceryItem[];
  bodyLog: BodyLogEntry[];
  preferences: {
    diets: string[];
    allergies: string[];
    likes: string[];
    dislikes: string[];
    units?: "metric" | "imperial";
  };
  profile: {
    displayName?: string;
    goal?: string;
    activityLevel?: string;
    dietaryPreference?: string;
    weightKg?: number;
    heightCm?: number;
  };
  goalPlan?: GoalPlan;
  integration?: IntegrationDailySummary;
  goalContext?: DailyGoalContext;
};

// ---------------------------------------------------------------------------
// Mutations: how a server-side tool asks the client to change app state
// ---------------------------------------------------------------------------

export type CoachMutation =
  | { kind: "add_meal"; meal: MealRecord }
  | { kind: "update_meal"; mealId: string; meal: MealRecord }
  | { kind: "remove_meal"; mealId: string }
  | { kind: "add_workout"; workout: WorkoutEntry }
  | { kind: "remove_workout"; workoutId: string }
  | { kind: "set_grocery"; items: GroceryItem[] }
  | { kind: "add_body_log"; entry: BodyLogEntry }
  | { kind: "set_preferences"; patch: Partial<CoachDaySnapshot["preferences"]> }
  | { kind: "set_goal_plan"; plan: GoalPlan }
  | { kind: "set_integration_summary"; summary: IntegrationDailySummary };

// ---------------------------------------------------------------------------
// Artifacts: what the chat renders inline for a tool call
// ---------------------------------------------------------------------------

/** Every artifact gets a stable id so later turns can reference/revise it. */
export type ArtifactBase = { id: string; type: string };

// The concrete artifact union is assembled in artifacts.ts (Section B/C grow
// it). Keep the transport type open here; renderers narrow on `type`.
export type ArtifactSpec = ArtifactBase & Record<string, unknown>;

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export type ToolRunResult = {
  /** Compact JSON the model sees as the tool result. */
  modelResult: unknown;
  /** Inline card the chat renders. Omit for pure-context tools. */
  artifact?: ArtifactSpec;
  /** State change the client must apply. Omit for read-only tools. */
  mutations?: CoachMutation[];
  /** True once the action is committed to the store. */
  persisted: boolean;
};

export type ToolContext = {
  snapshot: CoachDaySnapshot;
  userId: string;
  isPreview: boolean;
  /** In-turn draft: later tools in the same turn see earlier tools' writes. */
  applyMutation: (m: CoachMutation) => void;
  newArtifactId: () => string;
};

export type CoachToolDef<S extends z.ZodTypeAny = z.ZodTypeAny> = {
  name: string;
  description: string;
  schema: S;
  /**
   * Destructive tools (delete_meal, clear lists) require an explicit user
   * "yes" turn before firing — enforced in the route, not by the model.
   */
  destructive?: boolean;
  run: (input: z.infer<S>, ctx: ToolContext) => Promise<ToolRunResult> | ToolRunResult;
};

// ---------------------------------------------------------------------------
// SSE protocol for /api/coach/turn
// ---------------------------------------------------------------------------

export type CoachSseEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_start"; name: string; toolUseId: string }
  | { type: "artifact"; artifact: ArtifactSpec; toolName: string }
  | { type: "mutation"; mutations: CoachMutation[] }
  | { type: "confirm_required"; toolName: string; input: unknown; prompt: string }
  | {
      type: "turn_done";
      usage: { inputTokens: number; outputTokens: number; costUsdCents: number; model: string };
      conversationId?: string;
    }
  | { type: "error"; message: string };

export type CoachTurnMessage = {
  role: "user" | "assistant";
  content: string;
  /** Assistant turns may carry the artifacts they produced (for replay). */
  artifacts?: ArtifactSpec[];
};

export type CoachTurnRequest = {
  conversationId?: string;
  messages: CoachTurnMessage[];
  snapshot: CoachDaySnapshot;
  /** Set when the user explicitly confirmed a pending destructive action. */
  confirmedTool?: { name: string; input: unknown };
};
