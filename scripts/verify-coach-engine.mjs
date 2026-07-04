import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const includeSmoke = process.argv.includes("--smoke") || process.env.COACH_VERIFY_SMOKE === "1";

function staticInvariantCheck() {
  const migrationPath = "supabase/migrations/20260620170000_coach_knowledge_bases.sql";
  if (!existsSync(migrationPath)) {
    throw new Error("coach_knowledge_bases migration is missing");
  }

  const migration = readFileSync(migrationPath, "utf8");
  for (const required of [
    "CREATE TABLE IF NOT EXISTS public.coach_knowledge_bases",
    "PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE",
    "ENABLE ROW LEVEL SECURITY",
    "auth.uid() = user_id",
  ]) {
    if (!migration.includes(required)) {
      throw new Error(`coach knowledge migration missing invariant: ${required}`);
    }
  }

  const prompt = readFileSync("src/lib/coach/system-prompt.ts", "utf8");
  for (const required of [
    "Health-coach boundaries",
    "Do not diagnose",
    "Do not provide emergency guidance",
    "recommend professional care",
    "Never use or reveal another user's data",
  ]) {
    if (!prompt.includes(required)) {
      throw new Error(`coach prompt missing invariant: ${required}`);
    }
  }
}

const checks = [
  {
    name: "static migration, privacy, and health-boundary invariants",
    run: staticInvariantCheck,
  },
  {
    name: "full unit suite including coach knowledge, seed counts, autocomplete, isolation, prompt, persistence, and safe actions",
    command: "npx",
    args: ["vitest", "run", "--reporter=dot"],
  },
  { name: "lint", command: "npm", args: ["run", "lint"] },
  { name: "build/typecheck", command: "npm", args: ["run", "build"] },
];

if (includeSmoke) {
  checks.push({
    name: "browser smoke and live coach app wiring",
    command: "npm",
    args: ["run", "test:smoke"],
  });
}

const reasons = [];

for (const check of checks) {
  if ("run" in check) {
    try {
      check.run();
      continue;
    } catch (err) {
      reasons.push(`${check.name} failed: ${err instanceof Error ? err.message : "unknown error"}`);
      break;
    }
  }

  const result = spawnSync(check.command, check.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    reasons.push(`${check.name} failed with exit ${result.status ?? "unknown"}`);
    break;
  }
}

if (reasons.length) {
  console.log(JSON.stringify({ status: "FAIL", reasons }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      reasons: [
        [
          "Static privacy/migration/health invariants",
          "full unit suite",
          "seed counts",
          "autocomplete",
          "user isolation",
          "personalized context",
          "safe coach actions",
          "lint",
          "typecheck/build",
          includeSmoke ? "browser smoke/live coach wiring" : "browser smoke not requested; run with --smoke for the full UI gate",
        ].join(", ") + " passed.",
      ],
    },
    null,
    2,
  ),
);
