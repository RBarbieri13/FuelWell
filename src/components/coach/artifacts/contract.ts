import type { ArtifactSpec } from "@/lib/coach/types";

/**
 * Interaction contract between artifact cards and the chat shell.
 *
 * Cards never talk to stores or the API directly — they raise actions and the
 * chat page decides (send a message, fire a tool, confirm a destructive
 * action). Keeps every card pure/presentational and testable.
 */
export type CoachCardAction =
  | { kind: "send_message"; text: string }
  | { kind: "invoke_tool"; name: string; input: Record<string, unknown> }
  | { kind: "confirm_tool"; name: string; input: unknown }
  | { kind: "cancel_confirm" }
  | { kind: "open_route"; route: string };

export type ArtifactCardProps<A extends ArtifactSpec = ArtifactSpec> = {
  artifact: A;
  onAction: (action: CoachCardAction) => void;
};
