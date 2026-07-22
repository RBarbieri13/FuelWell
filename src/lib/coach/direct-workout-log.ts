import { resolveWorkout } from "@/lib/workout-library";
import { isConfidentMatch } from "@/lib/search-utils";

/**
 * Deterministic workout-log fast path for /api/coach/turn, mirroring
 * direct-meal-log. Messages like "I did 30 min upper body" or "log a 45
 * minute run" execute log_workout without a model call. Requires a
 * log-shaped verb AND an explicit duration; anything vaguer flows through
 * the normal model path. Returns null when the message doesn't parse
 * confidently.
 */

export type DirectWorkoutLog = {
  tool: "log_workout";
  input: Record<string, unknown>;
  /** Deterministic assistant reply describing exactly what was logged. */
  reply: string;
};

const LOG_VERB = /\b(i (?:just )?did|i(?:'ve| have)? (?:just )?(?:finished|completed|done)|just (?:did|finished|completed)|log(?:ged)?|add)\b/i;

const CATEGORY_KEYWORDS: Array<{ category: string; re: RegExp }> = [
  {
    category: "cardio",
    re: /\b(run|running|jog|jogging|walk|walking|bike|biking|ride|riding|cycling|spin|swim|swimming|row|rowing|cardio|hiit|elliptical|treadmill|stairmaster|jump rope|conditioning|zone 2)\b/i,
  },
  {
    category: "mobility",
    re: /\b(yoga|stretch|stretching|mobility|pilates|foam roll(?:ing)?|recovery)\b/i,
  },
  {
    category: "sport",
    re: /\b(soccer|football|basketball|tennis|golf|climbing|bouldering|volleyball|hockey|pickleball|badminton|squash|skating|skiing|surfing)\b/i,
  },
  {
    category: "strength",
    re: /\b(lift|lifting|weights|strength|upper|lower|push|pull|legs?|chest|back|arms?|shoulders?|glutes?|core|abs|full[- ]body|gym|deadlift|squat|bench|kettlebell|dumbbell|barbell|crossfit)\b/i,
  },
];

/** Library WorkoutType -> log_workout category. */
const LIBRARY_CATEGORY: Record<string, string> = {
  Strength: "strength",
  Cardio: "cardio",
  Conditioning: "cardio",
  Mobility: "mobility",
  Recovery: "mobility",
};

function parseDurationMin(text: string): { minutes: number; matched: string } | null {
  const hourAndHalf = text.match(/\b(?:an?|one)\s+hour\s+and\s+a\s+half\b|\b1\.5\s*(?:hours?|hrs?|h)\b/i);
  if (hourAndHalf) return { minutes: 90, matched: hourAndHalf[0] };
  const halfHour = text.match(/\bhalf\s+an?\s+hour\b/i);
  if (halfHour) return { minutes: 30, matched: halfHour[0] };
  const numericHours = text.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr)\b/i);
  if (numericHours) {
    const minutes = Math.round(Number(numericHours[1]) * 60);
    return Number.isFinite(minutes) && minutes > 0 ? { minutes, matched: numericHours[0] } : null;
  }
  const anHour = text.match(/\b(?:an?|one)\s+hour\b/i);
  if (anHour) return { minutes: 60, matched: anHour[0] };
  const minutesMatch = text.match(/\b(\d{1,3})\s*(?:minutes?|mins?|min)\b/i);
  if (minutesMatch) {
    const minutes = Number(minutesMatch[1]);
    return minutes > 0 ? { minutes, matched: minutesMatch[0] } : null;
  }
  return null;
}

export function parseDirectWorkoutLog(text: string): DirectWorkoutLog | null {
  const normalized = text.trim();
  // Questions ("should I do a 30 min run?") are for the model, not a logger.
  if (/\?\s*$/.test(normalized)) return null;
  // Past-date phrasings need the model to explain that logs land on today.
  if (/\b(yesterday|last\s+(night|week|month)|on\s+(mon|tues|wednes|thurs|fri|satur|sun)day)\b/i.test(normalized)) return null;
  if (!LOG_VERB.test(normalized)) return null;

  const duration = parseDurationMin(normalized);
  if (!duration || duration.minutes < 1 || duration.minutes > 600) return null;

  const rest = normalized
    .replace(LOG_VERB, " ")
    .replace(duration.matched, " ")
    .replace(/\b(workout|session|training|exercise)\b/gi, " ")
    .replace(/\b(a|an|the|of|for|at|in|with|on|my|this|that|some|today|yesterday|tonight|morning|afternoon|evening)\b/gi, " ")
    .replace(/[,.;:!]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (rest.length < 3 || rest.length > 60) return null;

  const category =
    CATEGORY_KEYWORDS.find(({ re }) => re.test(rest))?.category ?? null;

  // A confident library match can both canonicalize the name and supply the
  // category ("zone 2 ride" -> Cardio). Only adopt the library title when it
  // also covers the user's phrasing, so "upper body" stays as said.
  const library = resolveWorkout(rest);
  const libraryCategory = library ? LIBRARY_CATEGORY[library.workoutType] : undefined;
  if (!category && !libraryCategory) return null;

  const name =
    library && isConfidentMatch(library.title, [rest])
      ? library.title
      : rest.charAt(0).toUpperCase() + rest.slice(1);
  const resolvedCategory = category ?? libraryCategory ?? "other";

  return {
    tool: "log_workout",
    input: { name, duration_min: duration.minutes, category: resolvedCategory },
    reply: `Logged ${name} — ${duration.minutes} min ${resolvedCategory}.`,
  };
}
