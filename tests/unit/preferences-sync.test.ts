import { describe, expect, it } from "vitest";
import {
  mergePreferenceStateIntoDocument,
  preferenceStateFromDocument,
} from "@/lib/preferences-sync";

describe("preference document synchronization", () => {
  it("extracts only the food-preference namespace", () => {
    expect(preferenceStateFromDocument({
      likes: ["salmon", 42],
      dislikes: ["olives"],
      diets: ["high-protein"],
      allergies: ["Peanuts"],
      onboarding: { goal: "build_muscle" },
    })).toEqual({
      likes: ["salmon"],
      dislikes: ["olives"],
      diets: ["high-protein"],
      allergies: ["Peanuts"],
    });
  });

  it("preserves unrelated profile namespaces while replacing preferences", () => {
    const current = {
      onboarding: { goal: "build_muscle", intensity: "steady" },
      units: { weight: "lb", height: "in" },
      coachingTone: "direct",
      likes: ["old"],
    };

    expect(mergePreferenceStateIntoDocument(current, {
      likes: ["salmon"],
      dislikes: ["olives"],
      diets: ["high-protein"],
      allergies: ["Peanuts"],
    })).toEqual({
      onboarding: current.onboarding,
      units: current.units,
      coachingTone: "direct",
      likes: ["salmon"],
      dislikes: ["olives"],
      diets: ["high-protein"],
      allergies: ["Peanuts"],
    });
  });
});
