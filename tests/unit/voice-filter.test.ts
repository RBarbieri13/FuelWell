import { describe, expect, it } from "vitest";
import { enforceVoice, redactPii } from "@/lib/coach/voice-filter";

describe("enforceVoice", () => {
  const banned = [
    "You missed your protein target today.",
    "you've missed breakfast again",
    "You have missed your calorie goal.",
    "Looks like you skipped lunch.",
    "you went over your calories by 300.",
  ];

  for (const text of banned) {
    it(`catches banned phrasing: "${text}"`, () => {
      const result = enforceVoice(text);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.correctionNotice).toContain("Rephrasing");
      }
    });
  }

  const clean = [
    "You're 40g short of protein — here's the next useful move.",
    "Breakfast wasn't logged; want me to add one?",
    "Calories landed 300 above target. Tomorrow's plan: lighter dinner.",
    "Missed targets are just data — here's the next useful move.",
  ];

  for (const text of clean) {
    it(`passes clean text: "${text}"`, () => {
      expect(enforceVoice(text)).toEqual({ ok: true });
    });
  }
});

describe("redactPii", () => {
  it("scrubs email addresses", () => {
    expect(redactPii("Reach me at bob.smith+test@example.co.uk for the plan.")).toBe(
      "Reach me at [email hidden] for the plan.",
    );
  });

  it("scrubs US phone formats", () => {
    expect(redactPii("Call 555-123-4567 tonight.")).toBe("Call [number hidden] tonight.");
    expect(redactPii("Call (555) 123-4567 tonight.")).toBe("Call [number hidden] tonight.");
    expect(redactPii("Call +1 555 123 4567 tonight.")).toBe("Call [number hidden] tonight.");
    expect(redactPii("Call 555.123.4567 tonight.")).toBe("Call [number hidden] tonight.");
    expect(redactPii("Call 5551234567 tonight.")).toBe("Call [number hidden] tonight.");
  });

  it("scrubs both kinds in one message", () => {
    const out = redactPii("Email a@b.io or text 555-123-4567.");
    expect(out).toBe("Email [email hidden] or text [number hidden].");
  });

  it("leaves macros, targets, and times alone", () => {
    const samples = [
      "That snack adds 500 cal and 28g protein.",
      "You have 920 kcal left of your 2250 kcal target.",
      "Dinner at 7:30 works; aim for 175g protein / 240g carbs / 75g fat.",
    ];
    for (const text of samples) {
      expect(redactPii(text)).toBe(text);
    }
  });
});
