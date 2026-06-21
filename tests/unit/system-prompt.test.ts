import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/coach/system-prompt";
import { makeSnapshot } from "./helpers";

describe("buildSystemPrompt", () => {
  it("tells Coach to use supported rich chat formatting without raw HTML", () => {
    const prompt = buildSystemPrompt(makeSnapshot());

    expect(prompt).toContain("Rich chat formatting");
    expect(prompt).toContain("GitHub-style tables");
    expect(prompt).toContain("nested ordered/unordered lists");
    expect(prompt).toContain("LaTeX math syntax");
    expect(prompt).toContain("Markdown image syntax");
    expect(prompt).toContain("Do not output raw HTML.");
  });

  it("includes health-coach safety boundaries", () => {
    const prompt = buildSystemPrompt(makeSnapshot());

    expect(prompt).toContain("Health-coach boundaries");
    expect(prompt).toContain("Do not diagnose");
    expect(prompt).toContain("Do not provide emergency guidance");
    expect(prompt).toContain("recommend professional care");
    expect(prompt).toContain("avoid inventing medical facts");
  });

  it("handles partial defensive snapshots without throwing", () => {
    expect(() =>
      buildSystemPrompt({
        date: "2026-06-20",
      } as Parameters<typeof buildSystemPrompt>[0])
    ).not.toThrow();
  });
});
