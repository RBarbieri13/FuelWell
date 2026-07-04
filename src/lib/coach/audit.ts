/**
 * E6: tool-call audit log. Every tool execution is recorded. Signed-in users
 * write to the coach_audit Supabase table (sink wired in Section D); preview
 * users keep an in-memory ring buffer surfaced via getRecentAudit() for the
 * Settings "Coach activity" panel.
 */

export type AuditRow = {
  userId: string;
  tool: string;
  args: unknown;
  resultSummary: string;
  isPreview: boolean;
  ts?: string;
};

type AuditSink = (row: AuditRow) => Promise<void>;

const ring: AuditRow[] = [];
const RING_MAX = 200;

let sink: AuditSink = async (row) => {
  ring.push({ ...row, ts: new Date().toISOString() });
  if (ring.length > RING_MAX) ring.shift();
};

export function setAuditSink(next: AuditSink) {
  sink = next;
}

export async function writeAudit(row: AuditRow): Promise<void> {
  try {
    await sink(row);
  } catch (err) {
    // Audit must never break a turn, but losing audit rows is worth a log line.
    console.error("coach_audit write failed", err);
  }
}

export function getRecentAudit(userId: string): AuditRow[] {
  return ring.filter((r) => r.userId === userId).slice(-50);
}
