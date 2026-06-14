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
});
