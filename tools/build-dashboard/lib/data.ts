import overridesJson from "@/data/status-overrides.json";
import sessionJson from "@/data/session-digest.json";
import { fetchRawFile, fetchCommits, fetchCommitFiles } from "./github";
import { buildSnapshot } from "./reconcile";
import { PLAN_PATH } from "./config";
import type { Snapshot, SessionDigest, StatusOverride } from "./types";

function sessionFromJson(): SessionDigest | null {
  const s = sessionJson as SessionDigest;
  return s && s.sessionId ? s : null;
}

export async function getSnapshot(): Promise<Snapshot> {
  const generatedAt = new Date().toISOString();
  const overrides = overridesJson as Record<string, StatusOverride>;
  const session = sessionFromJson();

  const planMd = await fetchRawFile(PLAN_PATH);
  if (!planMd) {
    return {
      generatedAt,
      repoSlug: "",
      repoUrl: "",
      branch: "",
      planStale: false,
      phases: [],
      overall: { phasesComplete: 0, phasesTotal: 0, phasesGap: 0, frontierId: null, frontierTitle: null },
      lastWork: null,
      totalCommits: 0,
      totalPRs: 0,
      error: `Could not load ${PLAN_PATH} from the repo. Check FW_REPO_* env vars and that the file exists on the watched branch.`,
    };
  }

  try {
    const rawCommits = await fetchCommits(150);
    const newest = [...rawCommits].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    const last = newest
      ? await fetchCommitFiles(newest.sha)
      : { files: [], additions: 0, deletions: 0 };

    return buildSnapshot({
      planMd,
      rawCommits,
      lastCommitFiles: last.files,
      lastCommitAdditions: last.additions,
      lastCommitDeletions: last.deletions,
      sessionDigest: session,
      overrides,
      generatedAt,
    });
  } catch (e) {
    // Plan parsed fine but git data failed — show the structure with a loud banner.
    const snap = buildSnapshot({
      planMd,
      rawCommits: [],
      lastCommitFiles: [],
      lastCommitAdditions: 0,
      lastCommitDeletions: 0,
      sessionDigest: session,
      overrides,
      generatedAt,
    });
    snap.error =
      (e instanceof Error ? e.message : "Unknown error") +
      " — git progress is unavailable; phase structure shown from the plan only.";
    return snap;
  }
}
