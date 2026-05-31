import { parsePlan } from "./plan";
import { REPO_SLUG, REPO_URL, REPO_BRANCH } from "./config";
import type {
  Commit,
  Phase,
  PhaseProgress,
  Snapshot,
  ChangedFile,
  SessionDigest,
  StatusOverride,
} from "./types";
import type { RawCommit } from "./github";

const PHASE_TAG = /\bPhase\s+(\d+(?:\.\d+)?)\b/i;
const PR_TAG = /\(#(\d+)\)/;

/**
 * Turn raw commits into phase-mapped commits.
 *
 * - Explicit: subject literally says "Phase N" → that phase, high confidence.
 * - Inferred: the build was strictly sequential, so an untagged commit belongs
 *   to the phase of the most recent explicitly-tagged commit at or before it
 *   (chronological carry-forward). Commits before the first tag fall to "0"
 *   (the pre-build era).
 */
export function mapCommits(raw: RawCommit[]): Commit[] {
  // Oldest first for carry-forward.
  const asc = [...raw].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let currentPhase: string | null = null;
  const byShaAsc: Commit[] = asc.map((c) => {
    const tag = c.subject.match(PHASE_TAG);
    const pr = c.subject.match(PR_TAG);
    let phaseId: string | null;
    let mappedBy: Commit["mappedBy"];
    if (tag) {
      phaseId = tag[1];
      currentPhase = phaseId;
      mappedBy = "explicit";
    } else {
      phaseId = currentPhase ?? "0";
      mappedBy = "inferred";
    }
    return {
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      date: c.date,
      subject: c.subject,
      pr: pr ? Number.parseInt(pr[1], 10) : null,
      url: `${REPO_URL}/commit/${c.sha}`,
      phaseId,
      mappedBy,
    };
  });
  // Return newest first for display.
  return byShaAsc.reverse();
}

function checklistOf(phase: Phase): { done: number; total: number } | null {
  const checked = phase.deliverables.filter((d) => d.done !== null);
  if (checked.length === 0) return null;
  return {
    done: checked.filter((d) => d.done === true).length,
    total: checked.length,
  };
}

function inferStatus(
  phase: Phase,
  commits: Commit[],
  checklist: { done: number; total: number } | null,
  frontierOrder: number,
): { status: PhaseProgress["status"]; note: string | null } {
  const hasEvidence = commits.length > 0 || (checklist != null && checklist.done > 0);
  if (phase.order > frontierOrder) return { status: "not_started", note: null };
  if (phase.order === frontierOrder)
    return { status: "in_progress", note: "Current frontier — latest work lands here." };
  // A past phase.
  if (!hasEvidence) {
    return {
      status: "gap",
      note: "Later phases have shipped, but this phase shows no completion evidence in git. Likely done outside this repo or skipped — confirm.",
    };
  }
  if (checklist && checklist.done < checklist.total) {
    return {
      status: "complete",
      note: `${checklist.total - checklist.done} deferred item(s) remain in the plan checklist.`,
    };
  }
  return { status: "complete", note: null };
}

export interface ReconcileInput {
  planMd: string;
  rawCommits: RawCommit[];
  lastCommitFiles: ChangedFile[];
  lastCommitAdditions: number;
  lastCommitDeletions: number;
  sessionDigest: SessionDigest | null;
  overrides: Record<string, StatusOverride>;
  generatedAt: string;
}

export function buildSnapshot(input: ReconcileInput): Snapshot {
  const phases = parsePlan(input.planMd);
  const commits = mapCommits(input.rawCommits);

  const frontierOrder = commits.reduce((max, c) => {
    const o = c.phaseId ? Number.parseFloat(c.phaseId) : -1;
    return o > max ? o : max;
  }, -1);

  const prSet = new Set<number>();
  for (const c of commits) if (c.pr) prSet.add(c.pr);

  const progress: PhaseProgress[] = phases.map((phase) => {
    const mine = commits.filter((c) => c.phaseId === phase.id);
    const checklist = checklistOf(phase);
    const phasePRs = new Set<number>();
    for (const c of mine) if (c.pr) phasePRs.add(c.pr);

    const override = input.overrides[phase.id];
    let status: PhaseProgress["status"];
    let statusBy: PhaseProgress["statusBy"];
    let statusNote: string | null;
    if (override) {
      status = override.status;
      statusBy = "manual";
      statusNote = override.note;
    } else {
      const inferred = inferStatus(phase, mine, checklist, frontierOrder);
      status = inferred.status;
      statusBy = "inferred";
      statusNote = inferred.note;
    }

    const dates = mine.map((c) => c.date).sort();
    return {
      phase,
      status,
      statusBy,
      statusNote,
      commits: mine,
      prCount: phasePRs.size,
      checklist,
      firstDate: dates[0] ?? null,
      lastDate: dates[dates.length - 1] ?? null,
    };
  });

  const frontier = progress.find((p) => p.phase.order === frontierOrder) ?? null;
  const phasesComplete = progress.filter((p) => p.status === "complete").length;
  const phasesGap = progress.filter((p) => p.status === "gap").length;

  const lastCommit = commits[0] ?? null;

  return {
    generatedAt: input.generatedAt,
    repoSlug: REPO_SLUG,
    repoUrl: REPO_URL,
    branch: REPO_BRANCH,
    planStale: frontierOrder >= 1 && /currently mid.?Phase\s*0/i.test(input.planMd),
    phases: progress,
    overall: {
      phasesComplete,
      phasesTotal: progress.length,
      phasesGap,
      frontierId: frontier?.phase.id ?? null,
      frontierTitle: frontier?.phase.title ?? null,
    },
    lastWork: lastCommit
      ? {
          commit: lastCommit,
          changedFiles: input.lastCommitFiles,
          totalAdditions: input.lastCommitAdditions,
          totalDeletions: input.lastCommitDeletions,
          session: input.sessionDigest,
        }
      : null,
    totalCommits: commits.length,
    totalPRs: prSet.size,
    error: null,
  };
}
