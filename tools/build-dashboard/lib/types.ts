export type PhaseStatus = "complete" | "in_progress" | "not_started" | "gap";
export type MapBy = "explicit" | "inferred" | "manual";

export interface Deliverable {
  text: string;
  // true = ✅ in plan, false = ⏳ in plan, null = plain bullet with no checkbox
  done: boolean | null;
}

export interface PhaseStep {
  title: string;
  bullets: string[];
}

export interface Phase {
  id: string; // "0", "0.5", "0.6", "1" ... "7"
  order: number; // numeric for sorting
  title: string;
  goal: string;
  guideRef: string | null; // e.g. "iOS Guide Chapters 1–3, 5"
  deliverables: Deliverable[];
  steps: PhaseStep[]; // sub-steps (Phase 0.5 only, in practice)
  gate: string;
}

export interface Commit {
  sha: string;
  shortSha: string;
  date: string; // ISO
  subject: string;
  pr: number | null;
  url: string;
  phaseId: string | null;
  mappedBy: MapBy;
}

export interface ChangedFile {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
}

export interface SessionDigest {
  sessionId: string;
  sessionFile: string;
  date: string;
  intent: string;
  workDone: string[];
  filesTouched: string[];
  narrative: string;
  generatedAt: string;
}

export interface PhaseProgress {
  phase: Phase;
  status: PhaseStatus;
  statusBy: "inferred" | "manual";
  statusNote: string | null;
  commits: Commit[];
  prCount: number;
  checklist: { done: number; total: number } | null;
  firstDate: string | null;
  lastDate: string | null;
}

export interface LastWork {
  commit: Commit;
  changedFiles: ChangedFile[];
  totalAdditions: number;
  totalDeletions: number;
  session: SessionDigest | null;
}

export interface Snapshot {
  generatedAt: string;
  repoSlug: string;
  repoUrl: string;
  branch: string;
  planStale: boolean; // plan prose "where we are" disagrees with git frontier
  phases: PhaseProgress[];
  overall: {
    phasesComplete: number;
    phasesTotal: number;
    phasesGap: number;
    frontierId: string | null;
    frontierTitle: string | null;
  };
  lastWork: LastWork | null;
  totalCommits: number;
  totalPRs: number;
  error: string | null;
}

export interface StatusOverride {
  status: PhaseStatus;
  note: string;
}
