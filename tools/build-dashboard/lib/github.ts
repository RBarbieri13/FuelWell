import {
  REPO_SLUG,
  REPO_BRANCH,
  COMMITS_REVALIDATE,
  PLAN_REVALIDATE,
} from "./config";
import type { ChangedFile } from "./types";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/** Fetch a file's raw contents from the CDN (no API rate limit). */
export async function fetchRawFile(
  path: string,
  revalidate = PLAN_REVALIDATE,
): Promise<string | null> {
  const url = `${RAW}/${REPO_SLUG}/${REPO_BRANCH}/${path}`;
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export interface RawCommit {
  sha: string;
  date: string;
  subject: string;
}

/** Fetch up to `max` recent commits on the watched branch. */
export async function fetchCommits(max = 150): Promise<RawCommit[]> {
  const perPage = 100;
  const pages = Math.ceil(max / perPage);
  const out: RawCommit[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = `${API}/repos/${REPO_SLUG}/commits?sha=${REPO_BRANCH}&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, {
      headers: ghHeaders(),
      next: { revalidate: COMMITS_REVALIDATE },
    });
    if (!res.ok) {
      // Surface a typed failure to the caller rather than swallowing it.
      throw new Error(`GitHub commits API ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 200));
    }
    const batch = (await res.json()) as Array<{
      sha: string;
      commit: { message: string; author: { date: string } };
    }>;
    for (const c of batch) {
      out.push({
        sha: c.sha,
        date: c.commit.author.date,
        subject: c.commit.message.split("\n")[0],
      });
    }
    if (batch.length < perPage) break;
  }
  return out.slice(0, max);
}

/** Fetch the file-level diff stats for a single commit. */
export async function fetchCommitFiles(sha: string): Promise<{
  files: ChangedFile[];
  additions: number;
  deletions: number;
}> {
  const url = `${API}/repos/${REPO_SLUG}/commits/${sha}`;
  const res = await fetch(url, {
    headers: ghHeaders(),
    next: { revalidate: COMMITS_REVALIDATE },
  });
  if (!res.ok) return { files: [], additions: 0, deletions: 0 };
  const data = (await res.json()) as {
    stats?: { additions: number; deletions: number };
    files?: Array<{
      filename: string;
      additions: number;
      deletions: number;
      status: string;
    }>;
  };
  const files: ChangedFile[] = (data.files ?? []).map((f) => ({
    filename: f.filename,
    additions: f.additions,
    deletions: f.deletions,
    status: f.status,
  }));
  return {
    files,
    additions: data.stats?.additions ?? 0,
    deletions: data.stats?.deletions ?? 0,
  };
}
