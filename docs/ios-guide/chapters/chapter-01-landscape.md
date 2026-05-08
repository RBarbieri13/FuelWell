# Chapter 1: The 2026 iOS Landscape & Why This Stack

"The tools you choose in the first week determine the velocity of the next two years."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Understand the difference between Apple's frameworks (the SDK) and the production patterns the iOS community has converged on
2.  Distinguish between SDK level (what features you *can* call) and deployment target (who *can run* your app)
3.  See why the AI-first solo development workflow inverts traditional iOS architecture priorities
4.  Place each layer of the FuelWell stack on a mental map you can return to throughout the guide
5.  Have a working answer for *why* the stack is what it is — not just *what* it is

## Prerequisites

You've signed up for the Apple Developer Program. You have a Mac running macOS 15 or later. You know what Swift is, broadly. You don't need to know SwiftUI yet, and you don't need to be a Swift fluency expert — that's why you're here.

  

## The two iOS landscapes

When you start an iOS project in 2026, you're not picking a single tech stack. You're picking between two tech stacks that share a name.

  

The first is **Apple's iOS** — what comes out of WWDC. SwiftUI, the latest SDK, the Apple-blessed APIs, the Cupertino reference architecture. Apple ships these. Apple recommends these. Apple's documentation describes them. If you read the official guides, you walk away thinking *this* is iOS.

  

The second is **production iOS** — what real shipping apps actually use. This is the stack that has emerged from years of Apple-blessed APIs hitting real-world constraints. It includes third-party libraries Apple doesn't mention (TCA, swift-dependencies, SQLiteData), patterns Apple hasn't formalized (the Repository protocol, the actor-per-domain model), and explicit choices to *not* use APIs Apple recommends (Combine, Core Data, MVVM-the-name).

  

The five research reports synthesized in this guide all converge on production iOS, not Apple iOS. That convergence is the entire reason this guide exists. There is now a second consensus stack — the one Point-Free and the production-iOS community have built on top of Apple's frameworks — and it is *more* mature, *more* tested, and *more* AI-tractable than the official path.

  

This chapter explains why.

  

## SDK vs deployment target

Two numbers shape every iOS project. They are not the same number, and confusing them is the most common mistake new iOS developers make.

  

**The SDK** is the version of Apple's frameworks you build against. In 2026, that's the iOS 18 SDK shipped with Xcode 26. The SDK determines which APIs are *available* in your code. Newer SDK = more features.

  

**The deployment target** is the lowest iOS version your app can run on. Setting it to iOS 17 means anyone running iOS 17 or 18 can install your app. Setting it to iOS 18 cuts off iOS 17 users.

  

The deployment target is the harder decision. Lower it and you reach more users, but you can't use newer APIs without if \#available() checks. Raise it and you get to use everything, but you exclude users who haven't upgraded.

  

For FuelWell, we're using **iOS 17 as the deployment target with the iOS 18 SDK**. The math: iOS 17 was released September 2023, and by mid-2026 the iOS 17+ install base is north of 95% on actively-used devices. Going lower than 17 trades a measurable feature set (Observation framework, @Bindable, the .smooth animation curve, MeshGradient, foundation-level Swift Testing) for a sub-5% audience that is itself unlikely to be a paying customer. iOS 18-only features that are critical (very few in the FuelWell scope) get gated with if \#available(iOS 18, \*).

  

**Decision Point** — *iOS deployment target* — This is the only place in the guide where we encourage a different choice based on context. If your target audience skews older (healthcare professionals, education in less-developed markets, enterprise BYOD), drop to iOS 16. If your target audience is tech-forward (developer tools, productivity for power users), iOS 18-only is defensible. For consumer wellness in 2026, iOS 17 is right.

  

## Why solo + AI-first inverts the priorities

If you read iOS architecture guides written before 2024, they all share a hidden assumption: a team of three to fifteen iOS engineers, with a designer, a backend team, and a QA function. The architecture decisions in those guides optimize for *coordinating that team*. The MVVM pattern, the repository pattern, the strict separation of "view models" from "data models" — these are coordination patterns. They exist to make sure the iOS team can ship without stepping on each other.

  

You don't have a team. You have Claude Code, you have Claude Design, you have ChatGPT Images 2.0, and you have a goal. The coordination patterns are still useful — but they're useful for a *different reason now*. They're useful because they make the codebase *AI-tractable*: because they let an AI agent reason about a feature without holding the whole codebase in memory.

  

That inversion has consequences:

  

**Module boundaries become more important, not less.** A team can fix module-boundary mistakes through Slack and code review. An AI agent can't. If your Workouts feature directly imports Nutrition, Claude Code will silently let that pattern proliferate until your codebase is a graph instead of a tree. The boundaries have to be enforced by the compiler — which is why every feature in FuelWell is its own SPM package with explicit dependencies declared.

  

**Naming becomes more important, not less.** The AI's only context for a function is the function's name and its containing types. processData() is borderline criminal. loadDailyEntries(for: Date) -\> \[MealEntry\] writes its own documentation.

  

**Tests become more important, not less.** Tests are the only mechanism that lets an AI agent verify a change without human review. The test pyramid in Chapter 14 isn't there because we're disciplined — it's there because every test is a checkpoint that lets you say "Claude, refactor this; the tests will tell us if you broke something."

  

**Architecture rigidity becomes more important, not less.** TCA's exhaustive state-action-reducer model feels heavy for a solo project until you realize that *every* state transition is a thing the AI can read, replay, test, and reason about without the developer's mental model. The rigidity isn't bureaucracy. It's documentation that the compiler enforces.

  

This is the inversion: the patterns that look like overkill for a solo project are the patterns that make solo + AI development possible at all.

  

## The April 2026 AI design tooling shift

When the early drafts of this guide were written (March 2026), the AI design layer of an iOS project was a hand-rolled affair. You'd describe a screen to Claude Code, it would produce SwiftUI, you'd render it, you'd iterate. Visual prototyping was something you did in your head or in Figma if you had one.

  

Three weeks of April 2026 changed that. In a single month:

  

  - **Claude Design** (Anthropic Labs, April 17) shipped as a prompt-to-prototype tool that reads your codebase and outputs brand-consistent mockups, decks, and marketing visuals — included in the Claude subscription you already pay for.
  - **ChatGPT Images 2.0** (gpt-image-2, April 21) shipped with thinking mode, 2K resolution, and 99% multilingual text rendering — the first image model that produces App Store screenshots good enough to ship without rework.
  - **Google's DESIGN.md** open standard launched as the cross-tool design system contract — a single Markdown file that every AI agent (Claude Code, Claude Design, GPT-image, Cursor, Codex) reads to understand your design system.
  - **Figma for Agents** (April 14) opened the Figma canvas to MCP-based read/write from coding agents.

  

Before April, "design" for a solo developer with no designer meant guessing, copying from Apple's HIG, or paying for a contractor. After April, the loop is:

  

1.  Open docs/DESIGN.md — every agent now knows your tokens, components, and brand
2.  Generate a screen with Claude Design — three variations, all on-brand
3.  Pick one, hand it to Claude Code with the directive "implement this against the existing TCA structure"
4.  Generate App Store assets with ChatGPT Images 2.0 — empty states, onboarding heroes, screenshots in every supported language

  

The recommendation hierarchy this guide commits to:

  

**Claude Code writes the code. Claude Design creates the visuals. ChatGPT Images 2.0 generates assets. DESIGN.md is the contract between them.**

  

Chapter 3 covers installing each piece. Chapter 8 covers the design system as a generated artifact of DESIGN.md. The rest of the guide assumes this loop is in place.

  

The reason this matters in Chapter 1: every architecture decision in the rest of the guide assumes you have a *visual* loop, not just a code loop. If you're following along from before April 2026, retrofit Chapters 3 and 8 first, then continue.

  

## Mental map of the FuelWell stack

┌─────────────────────────────────────────────────────────────────┐

  

│                        AI Design Layer                           │

  

│  Claude Design  ←  DESIGN.md  →  ChatGPT Images 2.0             │

  

│         ↘             ↓              ↙                           │

  

│                  Claude Code                                     │

  

└─────────────────────────────────────────────────────────────────┘

  

                          ↓

  

┌─────────────────────────────────────────────────────────────────┐

  

│                       App Layer (SwiftUI)                        │

  

│  Features/Dashboard  Features/Nutrition  Features/Workouts       │

  

└─────────────────────────────────────────────────────────────────┘

  

                          ↓

  

┌─────────────────────────────────────────────────────────────────┐

  

│                    Architecture (TCA)                            │

  

│  Reducers  ↔  StackState  ↔  swift-dependencies                  │

  

└─────────────────────────────────────────────────────────────────┘

  

                          ↓

  

┌─────────────────────────────────────────────────────────────────┐

  

│                      Data & Effects                              │

  

│  SQLiteData  HealthKit actor  URLSession  Supabase               │

  

└─────────────────────────────────────────────────────────────────┘

  

                          ↓

  

┌─────────────────────────────────────────────────────────────────┐

  

│                      Quality & Ship                              │

  

│  Swift Testing  Snapshots  GitHub Actions  Fastlane  Sentry      │

  

└─────────────────────────────────────────────────────────────────┘

  

Each layer is a chapter or a small group of chapters. The arrows are dependencies — a higher layer can call into a lower one, never the reverse. The AI Design Layer at the top is new in 2026 and is the entry point for any new feature: a screen begins as a Claude Design prototype, gets translated to TCA + SwiftUI by Claude Code, persists through SQLiteData, and ships through GitHub Actions.

  

If at any point in this guide you lose track of where you are, return to this map.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Treating the SDK and deployment target as the same | Apple's docs blur them | Set deployment target to iOS 17 in the project file; check API availability against the iOS 18 SDK |
| Picking architecture before picking AI tooling | "Architecture is the foundation" thinking | The AI tooling \*is\* part of the architecture in 2026. DESIGN.md and the prototyping loop change what the rest of the stack needs to do |
| Skipping DESIGN.md because "I'll add it later" | Setup feels low-priority compared to writing code | Every screen written before DESIGN.md exists has to be reconciled when DESIGN.md arrives. Cheaper to do it on day one |
| Adopting Claude Design without DESIGN.md | "I'll let it figure out the design system from the codebase" | Claude Design \*can\* infer from the codebase, but it produces three new variations rather than three on-brand variations. DESIGN.md narrows the search space |
| Lowering the deployment target to iOS 16 "just in case" | Risk aversion | The features you give up (Observation, @Bindable, MeshGradient) are features Claude Code \*will\* try to use. Fighting them costs more than the missing audience |

  

## Hands-On Exercise

**Goal:** Set up the project skeleton and the AI design tooling contract before writing any code.

  

**Time budget:** 45 minutes.

  

**Steps:**

  

1.  **Create a new Xcode project.** File → New Project → App. Product Name: FuelWell. Interface: SwiftUI. Language: Swift. Set the deployment target to iOS 17. Save somewhere you'll find it.
2.  **Initialize git.** From terminal: cd FuelWell && git init && git add . && git commit -m "Initial Xcode project".
3.  **Create the docs folder and the four core docs.** From the project root:

  

mkdir docs

  

touch docs/CLAUDE.md docs/DESIGN.md docs/decisions.md docs/runbook.md

  

1.  **Copy the three reference documents from the guide into** **docs/****:** consensus-stack.md, reconciliation-matrix.md, contested-choices.md. These travel with the project; they're the durable record of why the stack is what it is.
2.  **Open** **docs/decisions.md** **and add your first entry:**

  

\# Decisions Log

  

\#\# 2026-04-29 — Initial stack commitment

  

Adopting the FuelWell production stack: TCA + SwiftUI + SQLiteData + Supabase, with Claude Code, Claude Design, and ChatGPT Images 2.0 as the AI tooling layer. Deployment target iOS 17, SDK iOS 18.

  

References: docs/consensus-stack.md, docs/reconciliation-matrix.md.

  

1.  **Commit.** git add docs && git commit -m "Chapter 1: project skeleton and stack commitment".

  

You haven't written any Swift yet. That's correct. The reference documents and the decisions log are the foundation; the code is the consequence.

  

## What's Next

Chapter 2 covers Swift 6 fundamentals — the language features, the Approachable Concurrency model, and the small set of patterns you'll use constantly. If you're already Swift-fluent, you can skim Chapter 2 and pick up at Chapter 3, where the actual toolchain setup begins (Xcode 26, the MCP servers, Claude Code, Claude Design, and the DESIGN.md template).

  

If you want to feel the AI design loop *now* before continuing, open Claude Design at claude.ai/design, point it at your empty FuelWell repo, and ask: "Show me three approaches for the dashboard of a nutrition tracking app." You'll get three on-brand variations, even with an empty repo, even before DESIGN.md exists. The point of the rest of this guide is to make those variations *consistent* with the codebase you're about to write.

  