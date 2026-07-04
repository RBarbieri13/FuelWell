import { z } from "zod";
import { registerTools } from "../registry";
import { newEntityId } from "../ids";
import { recordAction } from "../last-action";
import type { CoachToolDef, WorkoutEntry } from "../types";

/** Preserve per-tool schema inference inside the heterogeneous registerTools array. */
function tool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

/**
 * Workout tools: log completed workouts, plan sessions from a static
 * exercise library, run a live set-by-set session, and suggest what to
 * train next.
 */

type Focus =
  | "upper"
  | "lower"
  | "push"
  | "pull"
  | "legs"
  | "core"
  | "full_body"
  | "cardio";

type Equipment = "none" | "dumbbell" | "barbell" | "machine";

type LibraryExercise = {
  name: string;
  focus: Focus;
  equipment: Equipment;
  defaultSets: number;
  defaultReps: number;
  restSec: number;
};

const EXERCISE_LIBRARY: LibraryExercise[] = [
  { name: "Push-Up", focus: "push", equipment: "none", defaultSets: 3, defaultReps: 12, restSec: 60 },
  { name: "Dumbbell Bench Press", focus: "push", equipment: "dumbbell", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Overhead Press", focus: "push", equipment: "barbell", defaultSets: 3, defaultReps: 8, restSec: 120 },
  { name: "Pull-Up", focus: "pull", equipment: "none", defaultSets: 3, defaultReps: 8, restSec: 90 },
  { name: "Dumbbell Row", focus: "pull", equipment: "dumbbell", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Lat Pulldown", focus: "pull", equipment: "machine", defaultSets: 3, defaultReps: 12, restSec: 90 },
  { name: "Dumbbell Shoulder Press", focus: "upper", equipment: "dumbbell", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Barbell Bench Press", focus: "upper", equipment: "barbell", defaultSets: 3, defaultReps: 8, restSec: 120 },
  { name: "Dips", focus: "upper", equipment: "none", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Bodyweight Squat", focus: "legs", equipment: "none", defaultSets: 3, defaultReps: 15, restSec: 60 },
  { name: "Barbell Back Squat", focus: "legs", equipment: "barbell", defaultSets: 4, defaultReps: 6, restSec: 150 },
  { name: "Leg Press", focus: "legs", equipment: "machine", defaultSets: 3, defaultReps: 12, restSec: 90 },
  { name: "Romanian Deadlift", focus: "lower", equipment: "barbell", defaultSets: 3, defaultReps: 8, restSec: 120 },
  { name: "Dumbbell Lunge", focus: "lower", equipment: "dumbbell", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Glute Bridge", focus: "lower", equipment: "none", defaultSets: 3, defaultReps: 15, restSec: 60 },
  { name: "Plank", focus: "core", equipment: "none", defaultSets: 3, defaultReps: 1, restSec: 60 },
  { name: "Hanging Leg Raise", focus: "core", equipment: "none", defaultSets: 3, defaultReps: 10, restSec: 60 },
  { name: "Cable Crunch", focus: "core", equipment: "machine", defaultSets: 3, defaultReps: 15, restSec: 60 },
  { name: "Burpee", focus: "full_body", equipment: "none", defaultSets: 3, defaultReps: 12, restSec: 60 },
  { name: "Dumbbell Thruster", focus: "full_body", equipment: "dumbbell", defaultSets: 3, defaultReps: 10, restSec: 90 },
  { name: "Barbell Deadlift", focus: "full_body", equipment: "barbell", defaultSets: 3, defaultReps: 5, restSec: 150 },
  { name: "Jump Rope", focus: "cardio", equipment: "none", defaultSets: 3, defaultReps: 100, restSec: 60 },
  { name: "Rowing Machine Intervals", focus: "cardio", equipment: "machine", defaultSets: 4, defaultReps: 1, restSec: 90 },
  { name: "Mountain Climbers", focus: "cardio", equipment: "none", defaultSets: 3, defaultReps: 30, restSec: 45 },
];

type PlanExercise = { name: string; sets: number; reps: number; restSec: number };

type WorkoutPlan = {
  planId: string;
  focus: Focus;
  durationMin: number;
  exercises: PlanExercise[];
};

const plansById = new Map<string, WorkoutPlan>();

type LoggedSet = { exercise: string; weightKg: number; reps: number };

type WorkoutSession = {
  sessionId: string;
  planId: string;
  startedAt: string;
  loggedSets: LoggedSet[];
};

const sessionsByUser = new Map<string, WorkoutSession>();

const EQUIPMENT_ALLOWED: Record<string, Equipment[]> = {
  none: ["none"],
  dumbbell: ["none", "dumbbell"],
  barbell: ["none", "dumbbell", "barbell"],
  full_gym: ["none", "dumbbell", "barbell", "machine"],
};

function buildPlan(focus: Focus, durationMin: number, equipment: string): WorkoutPlan {
  const allowed = EQUIPMENT_ALLOWED[equipment] ?? EQUIPMENT_ALLOWED.full_gym;
  let pool = EXERCISE_LIBRARY.filter(
    (e) => e.focus === focus && allowed.includes(e.equipment),
  );
  if (pool.length < 4) {
    const extras = EXERCISE_LIBRARY.filter(
      (e) => e.focus !== focus && allowed.includes(e.equipment) && !pool.includes(e),
    );
    pool = [...pool, ...extras];
  }
  const count = Math.min(pool.length, durationMin >= 50 ? 6 : durationMin >= 30 ? 5 : 4);
  const picked = pool.slice(0, count);
  // ~2.25 min per set (work + rest); spread the budget evenly, 2-5 sets each.
  const setsPerExercise = Math.max(2, Math.min(5, Math.round(durationMin / 2.25 / count)));
  return {
    planId: newEntityId("coach-plan"),
    focus,
    durationMin,
    exercises: picked.map((e) => ({
      name: e.name,
      sets: setsPerExercise,
      reps: e.defaultReps,
      restSec: e.restSec,
    })),
  };
}

registerTools([
  tool({
    name: "log_workout",
    description:
      "Log a completed workout for today. Use when the user says they finished a workout. Duration in minutes; users usually speak in lb, but exercise weights must be converted to kg for storage.",
    schema: z.object({
      name: z.string().describe("Short workout name, e.g. 'Morning run' or 'Push day'"),
      duration_min: z.number().min(1).max(600).describe("Total workout duration in minutes (1-600)"),
      category: z
        .enum(["strength", "cardio", "mobility", "sport", "other"])
        .describe("Workout category"),
      exercises: z
        .array(
          z.object({
            name: z.string().describe("Exercise name"),
            sets: z.number().int().min(1).max(50).optional().describe("Number of sets performed"),
            reps: z.number().int().min(1).max(200).optional().describe("Reps per set"),
            weight_kg: z.number().min(0).max(500).optional().describe("Weight used, converted to kg for storage. If the user says lb, convert lb to kg before calling."),
          }),
        )
        .optional()
        .describe("Exercises performed, if the user gave details"),
      notes: z.string().optional().describe("Free-text notes about the workout"),
    }),
    run: (input, ctx) => {
      const workout: WorkoutEntry = {
        id: newEntityId("coach-workout"),
        name: input.name,
        category: input.category,
        durationMin: input.duration_min,
        loggedAt: new Date().toISOString(),
        exercises: input.exercises?.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weightKg: e.weight_kg,
        })),
        notes: input.notes,
      };
      const mutation = { kind: "add_workout" as const, workout };
      ctx.applyMutation(mutation);
      recordAction(ctx.userId, `Logged workout "${workout.name}"`, [
        { kind: "remove_workout", workoutId: workout.id },
      ]);
      return {
        persisted: true,
        mutations: [mutation],
        modelResult: {
          logged: true,
          id: workout.id,
          name: workout.name,
          durationMin: workout.durationMin,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_logged",
          workout,
          undoable: true,
        },
      };
    },
  }),
  tool({
    name: "plan_workout",
    description:
      "Build a workout plan (4-6 exercises with sets/reps/rest) for a focus area, duration in minutes, and available equipment. Returns a planId that start_workout_session can use.",
    schema: z.object({
      focus: z
        .enum(["upper", "lower", "push", "pull", "legs", "core", "full_body", "cardio"])
        .describe("Training focus for the session"),
      duration_min: z.number().min(1).max(600).describe("Target session length in minutes (1-600)"),
      equipment: z
        .enum(["none", "dumbbell", "barbell", "full_gym"])
        .optional()
        .describe("Equipment available; defaults to full_gym"),
    }),
    run: (input, ctx) => {
      const plan = buildPlan(input.focus, input.duration_min, input.equipment ?? "full_gym");
      plansById.set(plan.planId, plan);
      return {
        persisted: false,
        modelResult: {
          planId: plan.planId,
          focus: plan.focus,
          durationMin: plan.durationMin,
          exercises: plan.exercises.map((e) => `${e.name} ${e.sets}x${e.reps}`),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_plan",
          planId: plan.planId,
          focus: plan.focus,
          durationMin: plan.durationMin,
          exercises: plan.exercises,
        },
      };
    },
  }),
  tool({
    name: "start_workout_session",
    description:
      "Start a live workout session from a plan created by plan_workout. Use when the user wants to begin the workout and log sets as they go.",
    schema: z.object({
      plan_id: z.string().describe("planId returned by plan_workout"),
    }),
    run: (input, ctx) => {
      const plan = plansById.get(input.plan_id);
      if (!plan) {
        return {
          persisted: false,
          modelResult: { error: `Unknown plan id: ${input.plan_id}. Call plan_workout first.` },
        };
      }
      const session: WorkoutSession = {
        sessionId: newEntityId("coach-session"),
        planId: plan.planId,
        startedAt: new Date().toISOString(),
        loggedSets: [],
      };
      sessionsByUser.set(ctx.userId, session);
      return {
        persisted: false,
        modelResult: { sessionId: session.sessionId, started: true, focus: plan.focus },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_session",
          sessionId: session.sessionId,
          plan,
          loggedSets: [],
          status: "active",
        },
      };
    },
  }),
  tool({
    name: "log_set",
    description:
      "Log one completed set in the active workout session. Users usually speak in lb; convert to kg for storage (use 0 for bodyweight). Requires start_workout_session to be active.",
    schema: z.object({
      exercise: z.string().describe("Exercise name for this set"),
      weight_kg: z.number().min(0).max(500).describe("Weight used, converted to kg for storage; 0 for bodyweight."),
      reps: z.number().int().min(1).max(200).describe("Reps completed in this set"),
    }),
    run: (input, ctx) => {
      const session = sessionsByUser.get(ctx.userId);
      if (!session) {
        return {
          persisted: false,
          modelResult: { error: "No active workout session. Call start_workout_session first." },
        };
      }
      session.loggedSets.push({
        exercise: input.exercise,
        weightKg: input.weight_kg,
        reps: input.reps,
      });
      return {
        persisted: false,
        modelResult: {
          setLogged: true,
          exercise: input.exercise,
          totalSets: session.loggedSets.length,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_session",
          sessionId: session.sessionId,
          plan: plansById.get(session.planId),
          loggedSets: session.loggedSets,
          status: "active",
        },
      };
    },
  }),
  tool({
    name: "end_workout_session",
    description:
      "Finish the active workout session and log it as a completed workout. Use when the user is done training.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const session = sessionsByUser.get(ctx.userId);
      if (!session) {
        return {
          persisted: false,
          modelResult: { error: "No active workout session to end." },
        };
      }
      sessionsByUser.delete(ctx.userId);
      const now = new Date();
      const durationMin = Math.max(
        1,
        Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 60000),
      );
      const plan = plansById.get(session.planId);
      const byExercise = new Map<string, { sets: number; reps: number; weightKg: number }>();
      for (const set of session.loggedSets) {
        const agg = byExercise.get(set.exercise);
        if (agg) {
          agg.sets += 1;
          agg.reps = Math.max(agg.reps, set.reps);
          agg.weightKg = Math.max(agg.weightKg, set.weightKg);
        } else {
          byExercise.set(set.exercise, { sets: 1, reps: set.reps, weightKg: set.weightKg });
        }
      }
      const workout: WorkoutEntry = {
        id: newEntityId("coach-workout"),
        name: plan ? `${plan.focus.replace("_", " ")} workout` : "Workout session",
        category: "strength",
        durationMin,
        loggedAt: now.toISOString(),
        exercises: [...byExercise.entries()].map(([name, agg]) => ({
          name,
          sets: agg.sets,
          reps: agg.reps,
          weightKg: agg.weightKg > 0 ? agg.weightKg : undefined,
        })),
      };
      const mutation = { kind: "add_workout" as const, workout };
      ctx.applyMutation(mutation);
      recordAction(ctx.userId, `Logged workout "${workout.name}"`, [
        { kind: "remove_workout", workoutId: workout.id },
      ]);
      return {
        persisted: true,
        mutations: [mutation],
        modelResult: {
          logged: true,
          id: workout.id,
          durationMin,
          exerciseCount: workout.exercises?.length ?? 0,
          totalSets: session.loggedSets.length,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_logged",
          workout,
          fromSession: true,
          undoable: true,
        },
      };
    },
  }),
  tool({
    name: "suggest_workout",
    description:
      "Suggest 3 workout options for today based on the user's recent workout history, avoiding a repeat of the most recent focus. Use when the user asks what to train.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const history = ctx.snapshot.workouts;
      const lastWorkout = history[history.length - 1];
      const lastFocus = lastWorkout?.name.toLowerCase() ?? "";
      const lastCategory = lastWorkout?.category;
      const candidates: Array<{ focus: Focus; durationMin: number; why: string }> = history.length
        ? (
            [
              { focus: "push", durationMin: 40, why: "Upper-body pressing strength" },
              { focus: "pull", durationMin: 40, why: "Back and pulling balance" },
              { focus: "legs", durationMin: 45, why: "Lower-body strength" },
              { focus: "cardio", durationMin: 30, why: "Conditioning and recovery" },
              { focus: "core", durationMin: 25, why: "Trunk stability, quick session" },
              { focus: "full_body", durationMin: 45, why: "Efficient full-body stimulus" },
            ] as Array<{ focus: Focus; durationMin: number; why: string }>
          ).filter((c) => {
            if (lastCategory === "cardio" && c.focus === "cardio") return false;
            if (lastFocus.includes(c.focus.replace("_", " "))) return false;
            return true;
          })
        : [
            { focus: "full_body", durationMin: 40, why: "Best starting point with no recent history" },
            { focus: "cardio", durationMin: 30, why: "Build an aerobic base" },
            { focus: "core", durationMin: 25, why: "Low-barrier session to get moving" },
          ];
      const suggestions = candidates.slice(0, 3).map((c) => ({
        focus: c.focus,
        durationMin: c.durationMin,
        why: c.why,
        planPreview: EXERCISE_LIBRARY.filter((e) => e.focus === c.focus)
          .slice(0, 3)
          .map((e) => e.name),
      }));
      return {
        persisted: false,
        modelResult: {
          suggestions: suggestions.map((s) => ({
            focus: s.focus,
            durationMin: s.durationMin,
            why: s.why,
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "workout_suggestions",
          suggestions,
        },
      };
    },
  }),
]);
