import type { Phase, Deliverable, PhaseStep } from "./types";

const PHASE_HEADING = /^###\s+Phase\s+(\S+)\s+—\s+(.+?)\s*$/;
const STEP_HEADING = /^####\s+Step\s+\d+\s+—\s+(.+?)\s*$/;
const GOAL = /^\*\*Goal:\*\*\s*(.+)$/;
const GATE = /^\*\*Gate[^:]*:\*\*\s*(.+)$/;
const BULLET = /^[-*]\s+(.+)$/;
const GUIDE_REF = /\*\(([^)]+)\)\*\s*$/;

/** Strip a leading ✅ / ⏳ status emoji and report what it was. */
function readStatusEmoji(text: string): { done: boolean | null; text: string } {
  const t = text.trim();
  if (t.startsWith("✅")) return { done: true, text: t.replace(/^✅\s*/, "") };
  if (t.startsWith("⏳")) return { done: false, text: t.replace(/^⏳\s*/, "") };
  return { done: null, text: t };
}

/**
 * Parse MASTER-PLAN.md into structured phases. We only consider the canonical
 * "## The complete phase plan" section so the top-of-doc summary bullets don't
 * get double-counted.
 */
export function parsePlan(md: string): Phase[] {
  const lines = md.split("\n");

  // Narrow to the complete-phase-plan section.
  let start = lines.findIndex((l) => /^##\s+The complete phase plan/.test(l));
  if (start === -1) start = 0;
  let end = lines.findIndex(
    (l, i) => i > start && /^##\s+What's deliberately out of scope/.test(l),
  );
  if (end === -1) end = lines.length;
  const body = lines.slice(start, end);

  const phases: Phase[] = [];
  let cur: Phase | null = null;
  let curStep: PhaseStep | null = null;

  const pushBullet = (raw: string) => {
    if (!cur) return;
    const { done, text } = readStatusEmoji(raw);
    if (curStep) {
      curStep.bullets.push(text);
    } else {
      const d: Deliverable = { text, done };
      cur.deliverables.push(d);
    }
  };

  for (const line of body) {
    const ph = line.match(PHASE_HEADING);
    if (ph) {
      if (cur) phases.push(cur);
      const id = ph[1].replace(/[^\d.]/g, "");
      let title = ph[2];
      let guideRef: string | null = null;
      const gref = title.match(GUIDE_REF);
      if (gref) {
        guideRef = gref[1].trim();
        title = title.replace(GUIDE_REF, "").trim();
      }
      cur = {
        id,
        order: Number.parseFloat(id),
        title,
        goal: "",
        guideRef,
        deliverables: [],
        steps: [],
        gate: "",
      };
      curStep = null;
      continue;
    }
    if (!cur) continue;

    const step = line.match(STEP_HEADING);
    if (step) {
      curStep = { title: step[1], bullets: [] };
      cur.steps.push(curStep);
      continue;
    }

    const goal = line.match(GOAL);
    if (goal) {
      cur.goal = goal[1].trim();
      continue;
    }

    const gate = line.match(GATE);
    if (gate) {
      cur.gate = gate[1].trim();
      curStep = null; // gate marks the end of the phase body
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      pushBullet(bullet[1]);
      continue;
    }
  }
  if (cur) phases.push(cur);

  return phases.sort((a, b) => a.order - b.order);
}
