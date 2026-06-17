import type { MacroDay } from "./macro-stacked-bars";

/**
 * Deterministic, clearly-fabricated sample history for the progress chart.
 *
 * This is NOT real logged data. It exists so the chart has something to draw
 * before a user has built up a history. Every generated day is marked
 * `source: "sample"` so the UI can label it honestly. A small deterministic
 * wobble (seeded by day index) keeps bars from looking identical without
 * pretending to be measured intake.
 */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_REFERENCE_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Plausible daily macro center points (grams). Loosely consistent with the
// app's default targets; intentionally varied, never "on target" framed.
const BASE = { protein: 138, carbs: 215, fat: 68 };

function wobble(seed: number, spread: number) {
  // Cheap deterministic pseudo-random in [-1, 1].
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * spread;
}

function isoNDaysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function buildSampleHistory(windowDays: number): MacroDay[] {
  const days: MacroDay[] = [];

  for (let i = windowDays - 1; i >= 0; i -= 1) {
    const date = isoNDaysAgo(i);
    const seed = i + 1;

    days.push({
      date: date.toISOString().slice(0, 10),
      label:
        windowDays > 14
          ? `${date.getMonth() + 1}/${date.getDate()}`
          : windowDays === 7
            ? WEEK_REFERENCE_LABELS[days.length]
          : DAY_LABELS[date.getDay()],
      protein: Math.round(BASE.protein + wobble(seed, 26)),
      carbs: Math.round(BASE.carbs + wobble(seed * 1.7, 42)),
      fat: Math.round(BASE.fat + wobble(seed * 2.3, 14)),
      source: "sample",
    });
  }

  return days;
}
