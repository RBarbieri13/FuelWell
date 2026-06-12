import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import type { CoachToolDef } from "./types";

/**
 * Central tool registry. Tool modules in ./tools/ self-register via
 * registerTools(); the route reads the assembled list. Import order is
 * resolved by ./tools/index.ts.
 */

const tools = new Map<string, CoachToolDef>();

export function registerTools(defs: CoachToolDef[]) {
  for (const def of defs) {
    if (tools.has(def.name)) {
      throw new Error(`Coach tool registered twice: ${def.name}`);
    }
    tools.set(def.name, def);
  }
}

export function getTool(name: string): CoachToolDef | undefined {
  return tools.get(name);
}

export function listTools(): CoachToolDef[] {
  return [...tools.values()];
}

/** Anthropic API tool blocks generated from the zod schemas. */
export function toAnthropicTools(): Anthropic.Tool[] {
  return listTools().map((def) => ({
    name: def.name,
    description: def.description,
    input_schema: z.toJSONSchema(def.schema) as Anthropic.Tool.InputSchema,
  }));
}
