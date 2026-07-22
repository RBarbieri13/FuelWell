import { describe, expect, it } from "vitest";
import {
  buildCoachKnowledgeBase,
  formatKnowledgeForPrompt,
  mergeCoachKnowledge,
  retrieveCoachKnowledge,
} from "@/lib/coach/knowledge";
import { buildSystemPrompt } from "@/lib/coach/system-prompt";
import { makeSnapshot } from "./helpers";

describe("coach knowledge", () => {
  it("builds different retrieved context for meaningfully different users", () => {
    const enduranceUser = makeSnapshot({
      profile: {
        displayName: "Maya",
        goal: "perform",
        activityLevel: "high",
        dietaryPreference: "high-protein",
        weightKg: 62,
        heightCm: 165,
      },
      preferences: {
        diets: ["high-protein"],
        allergies: ["dairy"],
        likes: ["salmon-rice-plate"],
        dislikes: ["tofu"],
        units: "imperial",
      },
      workouts: [
        {
          id: "run-1",
          name: "Long run",
          category: "cardio",
          durationMin: 70,
          calories: 640,
          loggedAt: new Date().toISOString(),
        },
      ],
    });
    const strengthUser = makeSnapshot({
      profile: {
        displayName: "Jordan",
        goal: "gain",
        activityLevel: "moderate",
        dietaryPreference: "high-calorie",
        weightKg: 102,
        heightCm: 188,
      },
      preferences: {
        diets: [],
        allergies: ["shellfish"],
        likes: ["steak-sweet-potato"],
        dislikes: ["salad"],
        units: "imperial",
      },
      workouts: [
        {
          id: "lift-1",
          name: "Heavy hinge strength",
          category: "strength",
          durationMin: 45,
          calories: 310,
          loggedAt: new Date().toISOString(),
        },
      ],
    });

    const endurancePrompt = formatKnowledgeForPrompt(
      retrieveCoachKnowledge(buildCoachKnowledgeBase("user-a", enduranceUser), "What should I eat after my run?")
    );
    const strengthPrompt = formatKnowledgeForPrompt(
      retrieveCoachKnowledge(buildCoachKnowledgeBase("user-b", strengthUser), "What should I eat after lifting?")
    );

    expect(endurancePrompt).toContain("Maya");
    expect(endurancePrompt).toContain("Long run");
    expect(endurancePrompt).toContain("dairy");
    expect(strengthPrompt).toContain("Jordan");
    expect(strengthPrompt).toContain("Heavy hinge strength");
    expect(strengthPrompt).toContain("shellfish");
    expect(endurancePrompt).not.toEqual(strengthPrompt);
  });

  it("covers recipe and grocery domains in built and retrieved knowledge", () => {
    const snapshot = makeSnapshot({
      preferences: {
        diets: [],
        allergies: [],
        likes: ["greek-yogurt-power-bowl"],
        dislikes: [],
        units: "metric",
      },
    });
    const knowledge = buildCoachKnowledgeBase("user-1", snapshot);

    expect(knowledge.groceryFacts?.join(" ")).toContain("Grocery list has 3 items; 2 still needed.");
    expect(knowledge.groceryFacts?.join(" ")).toContain("Eggs");
    expect(knowledge.recipeFacts?.join(" ")).toContain("Greek yogurt power bowl");

    const prompt = formatKnowledgeForPrompt(
      retrieveCoachKnowledge(knowledge, "What groceries do I still need for a recipe?")
    );
    expect(prompt).toContain("Grocery list state");
    expect(prompt).toContain("Eggs");
    expect(prompt).toContain("Recipe engagement");
    expect(prompt).toContain("Greek yogurt power bowl");
  });

  it("retrieves recipe and grocery facts from legacy knowledge rows without those fields", () => {
    const legacy = buildCoachKnowledgeBase("user-1", makeSnapshot());
    delete legacy.recipeFacts;
    delete legacy.groceryFacts;

    const merged = mergeCoachKnowledge(legacy, buildCoachKnowledgeBase("user-1", makeSnapshot()));
    expect(merged.groceryFacts?.length).toBeGreaterThan(0);

    const retrieved = retrieveCoachKnowledge(legacy, "Plan my meals.");
    expect(retrieved.recipeFacts).toEqual([]);
    expect(retrieved.groceryFacts).toEqual([]);
  });

  it("does not merge knowledge across users", () => {
    const a = buildCoachKnowledgeBase("user-a", makeSnapshot({ profile: { displayName: "A", goal: "lose" } }));
    const b = buildCoachKnowledgeBase("user-b", makeSnapshot({ profile: { displayName: "B", goal: "gain" } }));
    const merged = mergeCoachKnowledge(a, b);

    expect(merged.userId).toBe("user-b");
    expect(merged.profileFacts.join(" ")).toContain("B");
    expect(merged.profileFacts.join(" ")).not.toContain("A");
  });

  it("injects retrieved knowledge and safety boundaries into the system prompt", () => {
    const snapshot = makeSnapshot();
    const knowledge = formatKnowledgeForPrompt(
      retrieveCoachKnowledge(buildCoachKnowledgeBase("user-1", snapshot), "Should I change dinner?")
    );
    const prompt = buildSystemPrompt(snapshot, knowledge);

    expect(prompt).toContain("Retrieved user-specific coach knowledge");
    expect(prompt).toContain("Personalization rules");
    expect(prompt).toContain("distinguish confirmed user facts");
    expect(prompt).toContain("diagnosis");
    expect(prompt).toContain("Do not identify private people");
  });
});
