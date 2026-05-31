# AI Outline — Tool & Skill Atlas

Canonical, version-controlled source of truth for the AI tool/skill catalog. Each tool is one row. The `*` prefix + `Source` note marks where an entry came from. `Date Added` is the date the tool was entered into the Atlas and is sortable.

**Legend (in Description):** ✅ used and worked · ⚠️ used with a gotcha · ❌ attempted, failed, abandoned · 📋 configured/available but deferred

**Status:** This file is the canonical, version-controlled source of truth for the AI outline. Edit here, then sync into Claude Design when you want the visual view. A few tools (e.g. shadcn, Base UI) appear twice with different `Source` tags — that's intentional; each row preserves where it came from.

---

## Tools

| Category | Tool / Skill Name | Type | Date Added | Description | Source |
|---|---|---|---|---|---|
| Methodology | *Goal Mode (`/goal`, `/super-goal`, `/goal-draft`) | Workflow Framework | 2026-05-31 | ✅ 6-step protocol (restate→survey→plan→confirm→execute→report) with a measurable definition-of-done. The backbone of the build. | Claude Code Stepping Stone Website |
| Methodology | *The Four Principles (Karpathy) | Coding Philosophy | 2026-05-31 | ✅ Think-before-coding · simplicity-first · surgical-changes · goal-driven. Kept diffs small. | Claude Code Stepping Stone Website |
| Methodology | *`/effort ultracode` | Reasoning Mode | 2026-05-31 | ✅ xhigh reasoning + dynamic workflow orchestration. Enabled the multi-agent build phase. | Claude Code Stepping Stone Website |
| Methodology | *Dynamic Workflow Orchestration (Workflow tool) | Multi-Agent Harness | 2026-05-31 | ✅ JS harness spawning parallel subagents; pipeline build→verify. Built 5 components as 5 agents, each adversarially verified. ~450k subagent tokens, ~2 min wall-clock. | Claude Code Stepping Stone Website |
| Methodology | *Adversarial Verification Pattern | QA Pattern | 2026-05-31 | ✅ A second agent refutes/audits each artifact (tokens + a11y + RSC + integrity) and fixes in place. Caught a missing caption autonomously. | Claude Code Stepping Stone Website |
| Methodology | *The Alignment Loop | Pre-Merge Gate | 2026-05-31 | ⚠️ 5-stop gate: shadcn audit · web-design-guidelines · react-best-practices · AccessLint hard gate · pr-review. The bar for feature work. | Claude Code Stepping Stone Website |
| Methodology | *Grounding / Integrity Constraint | Credibility Rule | 2026-05-31 | ✅ Every metric traces to real copy; relative charts carry "Illustrative" captions; no AI portraits of real people. | Claude Code Stepping Stone Website |
| Methodology | *Verify-Don't-Trust | Verification Discipline | 2026-05-31 | ✅ `tsc --noEmit` + curl smoke + live a11y audit + real-browser screenshot. Prove the deploy, don't assert it. | Claude Code Stepping Stone Website |
| Claude Code Core | *Workflow | Built-in Tool | 2026-05-31 | ✅ Multi-agent component build/verify pipeline. | Claude Code Stepping Stone Website |
| Claude Code Core | *Agent (subagents) | Built-in Tool | 2026-05-31 | ✅ Plan / Explore / code-reviewer / general-purpose, spawned via Workflow. | Claude Code Stepping Stone Website |
| Claude Code Core | *Bash | Built-in Tool | 2026-05-31 | ✅ vercel deploy, tsc, curl smoke tests, grep HTML markers, process hygiene. | Claude Code Stepping Stone Website |
| Claude Code Core | *Read / Edit / Write | Built-in Tool | 2026-05-31 | ✅ Read before editing; surgical Edit for wiring; Write for new files. | Claude Code Stepping Stone Website |
| Claude Code Core | *ToolSearch | Built-in Tool | 2026-05-31 | ✅ Loaded deferred MCP schemas on demand (AccessLint, Playwright). | Claude Code Stepping Stone Website |
| Claude Code Core | *TaskCreate / TaskUpdate / ScheduleWakeup | Built-in Tool | 2026-05-31 | 📋 Available; lightly relevant this build. | Claude Code Stepping Stone Website |
| Deploy & QA | *Vercel CLI | CLI (not MCP) | 2026-05-31 | ✅ The deploy path. `vercel link` / `--prod --yes` / env vars / prod alias. Build ~19–26s. Drop `--scope` for personal accounts. | Claude Code Stepping Stone Website |
| Deploy & QA | *AccessLint MCP (`audit_live`) | MCP / a11y Gate | 2026-05-31 | ✅ Live WCAG 2.2 AA audit via headless Chrome. 0 violations on all changed pages. Gotcha: drop `wait_for` for SSG pages or run sequentially. | Claude Code Stepping Stone Website |
| Deploy & QA | *Playwright MCP | MCP / Browser QA | 2026-05-31 | ⚠️ Real-browser render + full-page screenshots. Gotcha: stale Chrome holds `SingletonLock` → `pkill -f mcp-chrome-<id>` to free. | Claude Code Stepping Stone Website |
| Docs | *Context7 MCP | MCP / Live Docs | 2026-05-31 | 📋 Version-specific docs (Next 16 / React 19 / Tailwind v4 / AI SDK v6 are post-cutoff). Mandatory before framework-specific code. | Claude Code Stepping Stone Website |
| Backend (deferred) | *Supabase MCP | MCP / Backend | 2026-05-31 | 📋 Schema, RLS, auth, typegen. Deferred — v1 forms log to console; RLS non-optional when the backend lands. | Claude Code Stepping Stone Website |
| Monitoring (deferred) | *Sentry MCP | MCP / Errors | 2026-05-31 | 📋 Production error triage. Post-launch only. | Claude Code Stepping Stone Website |
| Image gen (failed) | *Hugging Face MCP (Z-Image Turbo) | MCP / Image Gen | 2026-05-31 | ❌ ZeroGPU quota exceeded anonymously; needs `HF_TOKEN`. Pivoted to SVG. | Claude Code Stepping Stone Website |
| Design tools (skipped) | *Figma / Canva MCPs | MCP / Design-to-Code | 2026-05-31 | ❌ Not used — hand-built SVG-as-code beat round-tripping through a design tool for a restrained brand. | Claude Code Stepping Stone Website |
| Stack | *Next.js 16 (App Router) | Framework | 2026-05-31 | ✅ Turbopack default; `export const dynamic = "force-static"` for SSG; route groups. Read `node_modules/next/dist/docs/` for breaking changes. | Claude Code Stepping Stone Website |
| Stack | *React 19 | UI Runtime | 2026-05-31 | ✅ Server Components by default; `"use client"` only for state/effects/handlers. All visuals are RSCs (zero client JS). | Claude Code Stepping Stone Website |
| Stack | *TypeScript 5 strict | Language | 2026-05-31 | ✅ Verify with `tsc --noEmit`; never `any`; `import type` for type-only. | Claude Code Stepping Stone Website |
| Stack | *Tailwind CSS v4 | Styling | 2026-05-31 | ✅ `@theme inline` token mapping in `globals.css`. | Claude Code Stepping Stone Website |
| Stack | *shadcn (base-nova / Base UI) | Component Library | 2026-05-31 | ✅ Neutral, CSS variables. Gotchas: no `asChild` → `ButtonLink` helper; Accordion uses `defaultValue` + `multiple`. | Claude Code Stepping Stone Website |
| Stack | *OKLCH Semantic Tokens | Color System | 2026-05-31 | ✅ `--primary` / `--accent` / `--chart-1..5`, full dark-mode parity. Hardcoded colors forbidden — tints via token + opacity. | Claude Code Stepping Stone Website |
| Stack | *pnpm 10 | Package Manager | 2026-05-31 | ✅ `packageManager` field authoritative; don't introduce npm/yarn. | Claude Code Stepping Stone Website |
| Stack | *react-hook-form + zod | Forms | 2026-05-31 | ✅ Schema next to the form. | Claude Code Stepping Stone Website |
| Stack | *Vercel AI SDK 6 | AI SDK (deferred) | 2026-05-31 | 📋 `ai` + `@ai-sdk/anthropic` + `zod`, gateway-aware. Verify v6 imports via Context7 first. | Claude Code Stepping Stone Website |
| Visual Method | *Token-Driven SVG Infographics as RSCs | Design Technique | 2026-05-31 | ✅ THE winning visual method. Hand-built, weightless, themeable, accessible by construction (`role="img"` + `aria-label`). Beat every AI-image/design-tool option. 16-component library produced. | Claude Code Stepping Stone Website |
| Skills | *`vercel:` plugin | Skill Pack | 2026-05-31 | ✅ deploy / nextjs / react-best-practices / shadcn / turbopack / verification / env / ai-sdk / auth / cli / bootstrap. First stop for stack-specific guidance. | Claude Code Stepping Stone Website |
| Skills | *`accesslint:audit` | Skill | 2026-05-31 | ✅ a11y audit skill, pairs with the AccessLint MCP. | Claude Code Stepping Stone Website |
| Skills | *`pr-review-toolkit:review-pr` | Skill + Subagents | 2026-05-31 | 📋 code-reviewer · silent-failure-hunter · type-design-analyzer · pr-test-analyzer · comment-analyzer · code-simplifier. | Claude Code Stepping Stone Website |
| Skills | *code-review / simplify / security-review / verify / run | Skills | 2026-05-31 | 📋 Core QA + execution skills (code-review incl. `ultra` cloud multi-agent). | Claude Code Stepping Stone Website |
| Skills | *`web-artifacts-builder` | Skill | 2026-05-31 | 📋 For standalone claude.ai React/Tailwind/shadcn artifacts (different target than a deployed Next app). | Claude Code Stepping Stone Website |
| Skills | *`fewer-permission-prompts` / `update-config` | Skill | 2026-05-31 | 📋 Harness ergonomics. | Claude Code Stepping Stone Website |
| AI Environment & Orchestration | *Claude Code | Core Developer CLI | 2026-05-31 | The terminal-based agentic coding tool hosting the project, workflows, and skills. | from Google AI query |
| UI Design | *Figma MCP Server | MCP Plugin / Integration | 2026-05-31 | Connects Claude directly to design files to extract spacing tokens, typography, and colors. | from Google AI query |
| Front-End Design | */frontend-design | Official Claude Skill | 2026-05-31 | Translates text prompts into polished, animated, responsive front-end code. | from Google AI query |
| UI Design | */skill-creator | Official Claude Skill | 2026-05-31 | Captures specific UI rules and design principles into a persistent project rule. | from Google AI query |
| User Experience | */webapp-testing | Playwright Integration | 2026-05-31 | Automates interface verification, testing layouts, responsive adjustments, and broken links. | from Google AI query |
| User Experience | */code-review | Official Claude Skill | 2026-05-31 | Scans pull requests against scoring frameworks to ensure pristine layout uniformity. | from Google AI query |
| Graphics & Assets | *Lucide / Heroicons | Vector Icon Libraries | 2026-05-31 | Clean, semantic icon packs imported directly by the AI to secure visual balance. | from Google AI query |
| Visual Consistency | *design-tokens.json | Configuration Architecture | 2026-05-31 | A custom structural file that forces Claude to use strict padding, margins, and hex codes. | from Google AI query |
| Front-End & UI Design | *shadcn/ui | Copy-and-Paste Architecture | 2026-05-31 | High-polish primitives on Radix + Tailwind that give 100% code ownership. | from Google AI query |
| Front-End Design | *HeroUI (formerly NextUI) | Copy/Package Hybrid | 2026-05-31 | Tailwind-native library with smooth micro-interactions and sleek dark-mode options. | from Google AI query |
| Front-End Design | *Park UI | Copy-and-Paste Component Library | 2026-05-31 | Uses Ark UI primitives for a clean, ultra-minimalist look for dense apps. | from Google AI query |
| Front-End Design | *Kibo UI | Specialized Component Library | 2026-05-31 | Purpose-built extensions targeting structural dashboard features like task feeds. | from Google AI query |
| Front-End Design | *Gluestack | Cross-Platform Architecture | 2026-05-31 | Type-safe library optimized for uniform scaling between web dashboards and mobile views. | from Google AI query |
| Graphics & Polish | *Aceternity UI | CSS/Tailwind Motion Effects | 2026-05-31 | Copy-paste code engineered for visual effects and modern animations. | from Google AI query |
| User Experience | *Tremor | Analytical Components | 2026-05-31 | Industry-standard Tailwind components for highly dense data charts and metrics. | from Google AI query |
| UI Design & Wireframing | *Relume Library | Sitemaps & Layout Engine | 2026-05-31 | Massive block ecosystem mapped to Figma for immediate application layout planning. | from Google AI query |
| Visual Consistency | *DaisyUI | Semantic Class Framework | 2026-05-31 | Speeds up styling through shortcut utility names (btn-primary) and themes. | from Google AI query |
| Front-End Design | *Preline UI | Responsive Utility Kit | 2026-05-31 | Large catalog of pre-built sidebar and form layouts using pure Tailwind. | from Google AI query |
| User Experience | *Radix UI Primitives | Unstyled Headless Core | 2026-05-31 | The low-level, fully accessible skeletal engine underpinning shadcn/ui layouts. | from Google AI query |
| User Experience | *Base UI | Unstyled Headless Core | 2026-05-31 | Modern accessible primitive layers serving as an unstyled replacement for custom CSS. | from Google AI query |

---

## Bundles

A bundle is a complete, selectable stack — pick it to rebuild a project at the same precision/polish.

| Bundle Name | Date Added | What it is | Source |
|---|---|---|---|
| ★ *Stepping Stone Website Build Stack (complete) | 2026-05-31 | The entire proven recipe to rebuild a marketing site at the same precision, efficiency, and polish: **Next.js 16 + React 19 + TS strict + Tailwind v4 + shadcn (base-nova) + pnpm 10 + OKLCH semantic tokens**, built via **Goal Mode + Dynamic Workflow orchestration + adversarial verification**, visuals as **token-driven SVG RSCs**, deployed on **Vercel CLI**, gated by **AccessLint + Playwright + Verify-Don't-Trust**. The 8-step minimal recipe: (1) scaffold the stack; (2) OKLCH tokens first, ban hardcoded colors; (3) content as data in `src/content/copy/*.ts`; (4) visuals as token-driven SVG RSCs with `role="img"` + `aria-label`; (5) orchestrate the build with one agent per component → adversarial verify → fix in place; (6) verify with `tsc --noEmit` → curl smoke → `accesslint audit_live` → Playwright screenshot; (7) ship via `vercel link` (no `--scope`) → `vercel --prod --yes` → set `NEXT_PUBLIC_SITE_URL`; (8) don't run `next build` to verify, don't generate AI faces of real people, don't use AI image gen without a token. | Claude Code Stepping Stone Website |

---

*Source document for the bundle: `WEBSITEBUILDTOOLKIT.md` (SteppingStone marketing-site build).*
