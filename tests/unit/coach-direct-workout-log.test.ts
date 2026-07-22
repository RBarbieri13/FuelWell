import { describe, expect, it } from "vitest";
import { parseDirectWorkoutLog } from "@/lib/coach/direct-workout-log";

describe("parseDirectWorkoutLog", () => {
  it("parses 'I did 30 min upper body' into log_workout with strength category", () => {
    const parsed = parseDirectWorkoutLog("I did 30 min upper body");
    expect(parsed).not.toBeNull();
    expect(parsed!.tool).toBe("log_workout");
    expect(parsed!.input).toEqual({ name: "Upper body", duration_min: 30, category: "strength" });
    expect(parsed!.reply).toBe("Logged Upper body — 30 min strength.");
  });

  it("parses 'log a 45 minute run' as cardio", () => {
    const parsed = parseDirectWorkoutLog("log a 45 minute run");
    expect(parsed?.input).toEqual({ name: "Run", duration_min: 45, category: "cardio" });
  });

  it("parses 'I finished an hour of yoga' as 60 min mobility", () => {
    const parsed = parseDirectWorkoutLog("I finished an hour of yoga");
    expect(parsed?.input).toEqual({ name: "Yoga", duration_min: 60, category: "mobility" });
  });

  it("parses 'I just did half an hour of basketball' as sport", () => {
    const parsed = parseDirectWorkoutLog("I just did half an hour of basketball");
    expect(parsed?.input).toEqual({ name: "Basketball", duration_min: 30, category: "sport" });
  });

  it("canonicalizes a library workout title with a typo", () => {
    const parsed = parseDirectWorkoutLog("I did the zone 2 rdie for 40 min");
    expect(parsed?.input).toMatchObject({ name: "Zone 2 ride", category: "cardio", duration_min: 40 });
  });

  it("supports fractional hours", () => {
    const parsed = parseDirectWorkoutLog("logged 1.5 hours of climbing");
    expect(parsed?.input).toMatchObject({ duration_min: 90, category: "sport" });
  });

  it("returns null without an explicit duration", () => {
    expect(parseDirectWorkoutLog("I did an upper body workout")).toBeNull();
  });

  it("returns null for meal-shaped messages", () => {
    expect(parseDirectWorkoutLog("log oatmeal for breakfast")).toBeNull();
  });

  it("returns null for past-date phrasings so the model can explain", () => {
    expect(parseDirectWorkoutLog("I did 30 min upper body yesterday")).toBeNull();
    expect(parseDirectWorkoutLog("log the 45 minute run from last night")).toBeNull();
  });

  it("returns null for questions", () => {
    expect(parseDirectWorkoutLog("should I log a 30 min run?")).toBeNull();
  });

  it("returns null without a log verb", () => {
    expect(parseDirectWorkoutLog("a 30 min run sounds nice")).toBeNull();
  });

  it("returns null when nothing workout-shaped remains", () => {
    expect(parseDirectWorkoutLog("I did 30 min of stuff")).toBeNull();
  });
});
