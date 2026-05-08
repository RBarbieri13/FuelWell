# Chapter 3: Toolchain Setup

"A development environment is a contract you sign with your future self."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Have a working Xcode 26 project configured for Swift 6 with strict concurrency
2.  Have Claude Code installed and configured against the project, with a working CLAUDE.md
3.  Have docs/DESIGN.md populated with the FuelWell design system contract that every AI agent in the loop will read
4.  Have Claude Design connected to the FuelWell repository
5.  Have ChatGPT Images 2.0 access configured for asset generation
6.  Have the relevant MCP servers installed (Sentry, Figma for Agents, optionally Wonder)
7.  Have an SPM skeleton with the four foundational packages (Core, DesignSystem, Networking, Persistence)
8.  Have a working test pipeline running against an empty test target

## Prerequisites

Chapter 1 complete (project created, deployment target set, docs/ folder populated). Chapter 2 read or skimmed. A Claude Pro / Max / Team / Enterprise subscription. A ChatGPT Plus / Pro / Business subscription. Node.js 20+ and npm installed.

  

## Xcode 26 project configuration

Open FuelWell.xcodeproj. Three settings need to change before you write any code.

  

**1. Swift language mode.** Project → FuelWell target → Build Settings → search "Swift Language Version" → set to "Swift 6". This enables Swift 6 mode in the app target. Package targets will set this independently in their Package.swift files.

  

**2. Strict Concurrency Checking.** Same target → Build Settings → search "Strict Concurrency Checking" → set to "Complete". This is the highest level. You may see warnings on existing code; that's the point. They are correctness warnings, not style warnings, and they should be addressed before they become errors when Swift 6 mode hits a real codebase.

  

**3. Other Swift Flags.** Add -enable-upcoming-feature ExistentialAny. This forces every protocol-typed value to be written as any Protocol rather than the bare protocol name. Better diagnostics, cleaner type checker behavior, future-proof against Swift 7.

  

Build the project (Cmd+B). It should succeed. If it doesn't, the diagnostics are telling you something real — read them, don't dismiss them.

  

## Claude Code installation

Claude Code is the agentic coding tool that runs against your codebase from the terminal. It's the primary developer tool in this stack.

  

**Install:**

  

npm install -g @anthropic-ai/claude-code

  

Verify:

  

claude --version

  

\# expect: 2.x or higher

  

**First run:** From the project root (cd FuelWell), run claude. It will prompt you to authenticate. Use the same Anthropic account that holds your Claude Pro / Max / Team / Enterprise subscription — Claude Code, Claude Design, and the API all share the subscription quota.

  

**Verify it sees the project:** ask Claude Code:

  

What's the deployment target of this project, and what's in docs/?

  

It should answer with iOS 17 and list the four files you created in Chapter 1. If it can't read the project, you're likely running it from the wrong directory.

  

## CLAUDE.md — the instruction set

CLAUDE.md is the file Claude Code reads first when it starts a session. It's the constant context — the "what stack are we, what conventions do we follow, what should you not do" preface that doesn't have to be re-explained every time.

  

Open docs/CLAUDE.md and write the following. Adjust as the project grows; this is the starting point, not the final form.

  

\# FuelWell — CLAUDE.md

  

You are Claude Code, working on FuelWell, a production iOS app for nutrition and

  

workout tracking. This file is your constant context. Read all of it before

  

acting on any non-trivial request.

  

\#\# Stack

  

\- Swift 6 with Strict Concurrency, ExistentialAny enabled package-wide

  

\- iOS 17 deployment target, iOS 18 SDK, Xcode 26

  

\- TCA (Composable Architecture) 1.17+ for state management

  

\- swift-dependencies for DI

  

\- TCACoordinators for navigation

  

\- SQLiteData for persistence (CloudKit sync via SQLiteData CK integration)

  

\- URLSession + custom LiveAPIClient (no Alamofire / Moya)

  

\- Supabase for backend (auth, edge functions, feature\_flags table)

  

\- Swift Testing + swift-snapshot-testing for tests

  

\#\# Architecture

  

\- Features live in \`Features/\<Name\>\` as SPM packages

  

\- Infrastructure lives in \`Packages/\<Name\>\` as SPM packages

  

\- Features import Packages. Features never import Features. Packages never

  

  import Features. The CI script \`scripts/check-feature-imports.sh\` enforces this.

  

\- Every feature has a \`\<Name\>Feature\` reducer that is \`@MainActor\`

  

\- Every dependency has a \`liveValue\`, a \`testValue\`, and a \`previewValue\`

  

\- \`liveValue\` defaults to \`unimplemented(...)\` until the live impl is registered

  

  at app launch via \`prepareDependencies\`

  

\#\# AI design loop

  

\- \`docs/DESIGN.md\` is the canonical source of truth for design tokens, components,

  

  and brand. The Swift \`Theme\` struct in \`Packages/DesignSystem\` is generated

  

  from it.

  

\- When the user describes a new screen, ask whether they have a Claude Design

  

  mockup. If yes, implement against the mockup. If no, suggest generating one

  

  with Claude Design first.

  

\- For non-UI assets (empty states, onboarding heroes, App Store images),

  

  defer to ChatGPT Images 2.0 — don't try to draw them in SwiftUI.

  

\#\# Conventions

  

\- All public types have explicit \`public init\`

  

\- All \`@Reducer\` types have a \`public init() {}\`

  

\- Views never own data — they receive a scoped store

  

\- No \`@ObservedObject\`, no \`@StateObject\` — \`@Bindable var store: StoreOf\<X\>\` only

  

\- Every color, font, and spacing value goes through \`@Environment(\\.theme)\`,

  

  never hardcoded

  

\- Test files use Swift Testing (\`@Test\`), not XCTest, except for XCUITests

  

\#\# Forbidden

  

\- Adding any networking library other than URLSession

  

\- Adding any persistence library other than SQLiteData

  

\- Mutating state outside a reducer

  

\- Direct Feature → Feature imports

  

\- Hardcoded colors / fonts / spacing in view code

  

\- "Just for now" hacks without a TODO and a corresponding entry in docs/decisions.md

  

\#\# When unsure

  

\- The Reconciliation Matrix is \`docs/reconciliation-matrix.md\` — open it

  

\- The Consensus Stack is \`docs/consensus-stack.md\` — open it

  

\- The decisions log is \`docs/decisions.md\` — every deviation is written here

  

Commit: git add docs/CLAUDE.md && git commit -m "Chapter 3: CLAUDE.md instruction set".

  

## DESIGN.md — the design system contract

DESIGN.md is Google Labs' open-source format (Apache 2.0, April 2026) for describing a visual identity to coding agents. The format is YAML front matter for machine-readable tokens, Markdown body for human-readable rationale.

  

Every AI agent in your loop reads this file:

  

  - **Claude Code** reads it when generating SwiftUI to know what colors, fonts, and spacing to use
  - **Claude Design** reads it when generating prototypes so they match the brand
  - **ChatGPT Images 2.0** reads it (when you paste it in the prompt) so generated assets match
  - **Figma for Agents** reads it for design token sync between code and Figma variables

  

Open docs/DESIGN.md and write the FuelWell starter template:

  

\---

  

name: FuelWell

  

version: 1.0.0

  

last\_updated: 2026-04-29

  

brand:

  

  voice: warm, direct, science-honest

  

  personality: \[trustworthy, energizing, calm\]

  

  audience: adults building sustainable health habits

  

colors:

  

  light:

  

    background: "\#FAF7F0"

  

    surface\_primary: "\#FFFFFF"

  

    surface\_secondary: "\#F5EFE5"

  

    text\_primary: "\#1A1612"

  

    text\_secondary: "\#4A423A"

  

    text\_tertiary: "\#7A6E60"

  

    accent: "\#C25A3A"

  

    accent\_muted: "rgba(194,90,58,0.12)"

  

    success: "\#3D7873"

  

    danger: "\#C84B33"

  

  dark:

  

    background: "\#0E0D0B"

  

    surface\_primary: "\#1C1A17"

  

    surface\_secondary: "\#252220"

  

    text\_primary: "\#FAFAF5"

  

    text\_secondary: "\#C8C2B6"

  

    text\_tertiary: "\#857D72"

  

    accent: "\#E8845F"

  

    accent\_muted: "rgba(232,132,95,0.18)"

  

    success: "\#7BB0AA"

  

    danger: "\#E8695A"

  

typography:

  

  display:

  

    family: "Geist"

  

    weights: \[400, 500, 600, 700\]

  

    sizes:

  

      large\_title: { px: 34, weight: 600, line\_height: 1.1 }

  

      title: { px: 22, weight: 600, line\_height: 1.2 }

  

      headline: { px: 17, weight: 600, line\_height: 1.3 }

  

  body:

  

    family: "Newsreader"

  

    weights: \[400, 500\]

  

    sizes:

  

      body: { px: 17, weight: 400, line\_height: 1.55 }

  

      caption: { px: 13, weight: 400, line\_height: 1.4 }

  

  mono:

  

    family: "Geist Mono"

  

    weights: \[400, 500\]

  

    sizes:

  

      code: { px: 14, weight: 400, line\_height: 1.5 }

  

spacing:

  

  xs: 4

  

  sm: 8

  

  md: 12

  

  lg: 16

  

  xl: 24

  

  xxl: 32

  

radius:

  

  sm: 6

  

  md: 10

  

  lg: 16

  

motion:

  

  default\_duration\_ms: 350

  

  default\_curve: smooth

  

  reduce\_motion\_disables: true

  

accessibility:

  

  contrast\_target: WCAG\_AA

  

  min\_tap\_target\_pt: 44

  

  dynamic\_type\_max: accessibility5

  

  reduced\_motion\_supported: true

  

\---

  

\# FuelWell Design System

  

\#\# Voice

  

FuelWell is a wellness app for adults who are tired of being shouted at by other

  

wellness apps. It does not say "Crush your goals\!" It does not use emojis as

  

decoration. It treats the user as someone capable of making their own decisions,

  

and it provides accurate, science-honest information.

  

The voice in copy is warm and direct. We use the second person. We avoid

  

exclamation marks. We don't apologize for limitations — we explain them.

  

\#\# Color rationale

  

The light palette is built around a warm cream background (\`\#FAF7F0\`) and a deep

  

brown ink (\`\#1A1612\`) — high-contrast, calm, optimized for long reading sessions

  

on the dashboard. The accent (\`\#C25A3A\`) is a clay-fired terracotta orange, used

  

sparingly for primary actions and key data points. We avoid red as a danger

  

color because it reads "alarm" too strongly for a wellness app; our danger

  

(\`\#C84B33\`) is a muted brick.

  

The dark palette inverts the cream-to-deep-brown structure: a near-black warm

  

background (\`\#0E0D0B\`) and warm off-white text (\`\#FAFAF5\`). The accent shifts

  

slightly brighter to \`\#E8845F\` to maintain perceived contrast on the dark

  

background.

  

Both palettes are tested at WCAG AA for text and AAA for primary surfaces.

  

\#\# Typography rationale

  

\`Geist\` for display and UI is a contemporary sans-serif with a slight humanist

  

warmth — it doesn't read as cold or corporate the way \`Inter\` can.

  

\`Newsreader\` for body copy gives long-form reading (recipe descriptions, article

  

content, decision-point reasoning) an editorial feel that distinguishes content

  

from chrome. This is intentional and sets FuelWell apart from competitor apps

  

that use the same sans-serif everywhere.

  

\`Geist Mono\` for code, numbers in data tables, and for the small all-caps

  

labels in the design system (\`section position\`, \`read time\`, \`decision point\`,

  

etc.) — gives those moments a specificity and structure that signals "this is

  

data, not decoration."

  

\#\# Spacing scale rationale

  

The 4-8-12-16-24-32 scale is geometric without being too aggressive. Most layout

  

problems in the app can be solved with \`lg\` (16) for default padding, \`md\` (12)

  

for comfortable internal spacing, and \`xl\` (24) for sectional separation. \`xxl\`

  

(32) is reserved for top-level chapter / view boundaries.

  

\#\# Components

  

The starter component set lives in \`Packages/DesignSystem\`. Every component

  

in this list has a \`\#Preview\` and an entry in \`ComponentGallery\`.

  

\- \`MacroRingView\` — circular progress for the daily calorie target

  

\- \`MetricTile\` — labeled metric with optional trend indicator

  

\- \`PrimaryButton\` / \`SecondaryButton\` — action buttons

  

\- \`EmptyState\` — illustrated empty-state container (illustration via ChatGPT Images 2.0)

  

\- \`Section\` — labeled section container

  

\#\# Motion

  

The default animation curve is \`.smooth(duration: 0.35)\` from SwiftUI's iOS 17

  

animation API. Custom durations are documented per-component. The

  

\`@Environment(\\.accessibilityReduceMotion)\` flag disables all non-essential

  

animation when set.

  

\#\# Accessibility

  

\- WCAG AA contrast across all text/background combinations in both palettes

  

\- Minimum tap target of 44pt for any interactive element

  

\- Dynamic Type supported up to \`accessibility5\`

  

\- Reduce Motion respected on every animated transition

  

\- VoiceOver labels on every interactive element

  

\#\# How AI agents should use this file

  

When asked to implement a new screen, view, or asset:

  

1\. Read the YAML front matter for tokens (colors, fonts, spacing, radius, motion)

  

2\. Read the relevant Markdown sections for rationale and constraints

  

3\. Use semantic tokens (\`accent\`, \`surface\_primary\`) — never raw hex values in code

  

4\. For Swift code, reference the generated \`Theme\` struct in

  

   \`Packages/DesignSystem\`. Do not hardcode tokens.

  

5\. For new assets generated via ChatGPT Images 2.0, paste the relevant section

  

   of this file into the prompt to ensure brand consistency

  

6\. If the request requires a token or component that doesn't exist here, propose

  

   an addition to this file before writing code that introduces a new value

  

That's the starter DESIGN.md. It will grow as the design system grows. Two principles to maintain it:

  

  - The YAML front matter is the source. The Markdown body explains the source. Never let them drift.
  - New tokens or components are added to DESIGN.md *before* they're added to code, not after.

  

Commit: git add docs/DESIGN.md && git commit -m "Chapter 3: DESIGN.md design system contract".

  

## Connecting Claude Design to the repository

Claude Design (Anthropic Labs, research preview) lives at claude.ai/design. It runs in the browser, but it can read your repository through the GitHub integration.

  

**Connect:**

  

1.  Push the FuelWell project to a private GitHub repository if you haven't already
2.  Open claude.ai/design in your browser
3.  Click "Connect repository" and authorize the GitHub app on your FuelWell repository
4.  In the Claude Design interface, the project should appear in the sidebar under "Repositories"

  

**Verify it reads DESIGN.md:**

  

In Claude Design, prompt:

  

Generate a dashboard mockup for FuelWell. Three variations.

  

The output should be three on-brand mockups using the cream/brown light palette, the Geist + Newsreader type pairing, and the terracotta accent. If it's not on-brand, the most likely cause is that DESIGN.md isn't yet pushed to the default branch.

  

**Export options:**

  

Claude Design exports to PDF, public URL, PPTX, or directly to Canva. For FuelWell, the workflow is:

  

1.  Generate three variations
2.  Copy the URL of the chosen variation
3.  Paste it into a Claude Code session: "Implement this Claude Design mockup against the FuelWell TCA structure: \[URL\]. Read the existing DailyLogFeature for the pattern."

  

Claude Code will fetch the mockup, read it, and produce TCA + SwiftUI that matches.

  

## ChatGPT Images 2.0 access

ChatGPT Images 2.0 (gpt-image-2, OpenAI, April 21 2026) is the asset generator. You access it through ChatGPT (Plus / Pro / Business) or through the OpenAI API. For solo development, the ChatGPT interface is sufficient.

  

**The thinking-mode workflow:**

  

For App Store assets and other high-stakes images, enable thinking mode (available on ChatGPT Plus, Pro, and Business). The thinking-mode generation takes longer (60-90 seconds per image) but the model self-reviews its output and corrects composition, text rendering, and visual coherence.

  

**The DESIGN.md prompt pattern:**

  

When generating any FuelWell asset, prepend the relevant DESIGN.md sections to the prompt. A working template:

  

Reference design system:

  

\[paste the colors, typography, and brand voice sections from docs/DESIGN.md\]

  

Generate: an empty-state illustration for the FuelWell meal log when the user

  

hasn't logged any meals today. Style: minimal, warm, line-illustration with

  

a single accent color from the palette. 2K resolution. Thinking mode on.

  

The 99% multilingual text rendering is the differentiator for App Store submissions in non-English markets — covered in Chapter 19.

  

## MCP server installation

Model Context Protocol (MCP) servers extend Claude Code with external capabilities. The April 2026 cohort added two relevant ones to the FuelWell toolchain.

  

**Sentry MCP** (covered in detail in Chapter 18 — install now, configure later):

  

claude mcp add sentry \\

  

  -s user \\

  

  -e SENTRY\_AUTH\_TOKEN=\<placeholder-for-now\> \\

  

  -e SENTRY\_ORG=\<your-org\> \\

  

  -- npx -y @sentry/mcp-server@latest

  

You don't have a Sentry org yet. The MCP install will succeed; the placeholder token will be replaced in Chapter 18.

  

**Figma for Agents MCP** (April 14 2026, free during beta — install only if Figma is in your loop):

  

If you don't use Figma, skip this. For solo developers without a designer, Figma typically enters the loop only for App Store screenshots in Chapter 19. You can install the MCP at that point. The instruction is in Chapter 19.

  

If Figma *is* in your loop now (you're working with a contracted designer, or you have an existing FuelWell Figma file from earlier exploration):

  

claude mcp add figma \\

  

  -s user \\

  

  -e FIGMA\_API\_TOKEN=\<your-figma-token\> \\

  

  -- npx -y @figma/mcp-server@latest

  

Verify both are installed:

  

claude mcp list

  

\# expect:

  

\# sentry  (running)

  

\# figma   (running)  ← if installed

  

## SPM skeleton

Now the Swift code structure. From the project root, create the package directories:

  

mkdir -p Packages/{Core,DesignSystem,Networking,Persistence}/Sources/{Core,DesignSystem,Networking,Persistence}

  

mkdir -p Packages/{Core,DesignSystem,Networking,Persistence}/Tests/{CoreTests,DesignSystemTests,NetworkingTests,PersistenceTests}

  

mkdir -p Features

  

For each of the four packages, create a Package.swift. Use the Core package as the template:

  

Packages/Core/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "Core",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "Core", targets: \["Core"\]),

  

    \],

  

    targets: \[

  

        .target(name: "Core", swiftSettings: swiftSettings),

  

        .testTarget(name: "CoreTests", dependencies: \["Core"\], swiftSettings: swiftSettings),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

Repeat for DesignSystem, Networking, Persistence. The DesignSystem package depends on Core; Networking and Persistence each depend on Core. Add the dependencies in the dependencies: array and the target.dependencies: array.

  

In Xcode: File → Add Package Dependencies → Add Local → select each of the four package folders. The packages now appear in the Xcode sidebar as sibling targets to the FuelWell app.

  

In the FuelWell target's "Frameworks, Libraries, and Embedded Content" section, link Core, DesignSystem, Networking, and Persistence.

  

Build (Cmd+B). Should succeed.

  

## Test pipeline

From the project root:

  

xcodebuild -scheme FuelWell -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test

  

Expect: a successful build, the iPhone 17 Pro simulator launching, and the empty test suites passing. If you see "no destination matching", install the simulator from Xcode → Settings → Platforms.

  

This is your verification that the toolchain is working end-to-end. Every chapter from here forward assumes xcodebuild test (or claude /test) is the ground truth for "does it work."

  

Commit: git add . && git commit -m "Chapter 3: SPM skeleton and test pipeline".

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Skipping DESIGN.md to "get to the code" | DESIGN.md doesn't feel like code | Without DESIGN.md, every prompt to Claude Code includes design context inline, and outputs drift across sessions. Five minutes on DESIGN.md saves hours of drift |
| Putting CLAUDE.md at the project root instead of docs/ | Older Claude Code versions looked at root | Modern Claude Code reads docs/CLAUDE.md first. Both work; docs/ is the convention |
| Hardcoding colors/fonts in DESIGN.md but not in the Theme struct | Treating them as separate sources of truth | Chapter 8 wires DESIGN.md → generated Theme struct. Until then, write the YAML; don't write Swift Theme values yet |
| Installing every MCP server from the registry | "More tools = more capability" | Each MCP server adds context Claude Code reads on every session. Install only what's actively used |
| Setting Strict Concurrency to "Minimal" or "Targeted" because warnings are scary | Avoidance | The warnings \*are\* the tool. Address them or document why you're suppressing each one |

  

## Hands-On Exercise

**Goal:** Take an empty Xcode project from Chapter 1 to a fully configured Swift 6 + AI design loop.

  

**Time budget:** 90 minutes.

  

**Steps:**

  

1.  Configure Xcode (Swift 6, Strict Concurrency Complete, ExistentialAny). Build clean.
2.  Install Claude Code. Run claude from the project root. Authenticate.
3.  Write docs/CLAUDE.md from the template above. Commit.
4.  Write docs/DESIGN.md from the template above. Commit. Push to GitHub.
5.  Connect Claude Design to the repository at claude.ai/design.
6.  Verify Claude Design reads DESIGN.md by generating a dashboard mockup. Confirm the output uses the cream + terracotta palette.
7.  Generate one test asset with ChatGPT Images 2.0 using the DESIGN.md prompt pattern. Save it to Resources/empty-states/no-meals-logged.png (don't add to Xcode yet — that's Chapter 7).
8.  Install the Sentry MCP server with a placeholder token.
9.  Create the four foundational SPM packages (Core, DesignSystem, Networking, Persistence) with the Package.swift template.
10. Link the four packages in the FuelWell app target.
11. Run xcodebuild test. Confirm green.
12. Commit each step as a separate commit. The final history should read as a clean tour of the chapter.

  

When the test pipeline runs green, you have the toolchain. The next chapter starts writing the architecture.

  

## What's Next

Chapter 4 is where TCA enters the codebase. We'll install the Composable Architecture, write the first feature reducer (DailyLogFeature), and wire it through the dependency injection system. By the end of Chapter 4, you'll have a real, working iOS feature with a state machine, effects, and tests — the smallest possible end-to-end vertical slice of the production stack.

  