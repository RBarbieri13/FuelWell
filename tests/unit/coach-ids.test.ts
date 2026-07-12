import { describe, expect, it } from "vitest";
import { newEntityId } from "@/lib/coach/ids";

describe("Coach entity ids", () => {
  it("generates UUIDs accepted by Supabase UUID primary keys", () => {
    expect(newEntityId("coach-meal")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("does not reuse an id", () => {
    expect(newEntityId("coach-workout")).not.toBe(newEntityId("coach-workout"));
  });
});
