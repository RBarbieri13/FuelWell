# Chapter 8: Design System & Theming

"A design system that exists in two places exists in zero places."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Understand why DESIGN.md is the canonical source of truth and the Swift Theme struct is a generated artifact
2.  Write the three-layer token model (primitives → semantic → component)
3.  Generate the Swift Theme struct from DESIGN.md with a single command
4.  Add a CI step that fails the build if DESIGN.md and Theme drift apart
5.  Use Claude Design to generate brand-consistent prototypes that the codebase implements without translation
6.  Use ChatGPT Images 2.0 to generate non-UI assets that match the design system

## Prerequisites

Chapter 3 complete (DESIGN.md exists, Claude Design connected, ChatGPT Images 2.0 access). Chapter 7 complete (SwiftUI patterns, Component Gallery scaffolded). The Packages/DesignSystem SPM package exists but is empty.

  

## The two ways to do this and why one is wrong

Before April 2026, the design system in an iOS project lived in Swift. A Theme struct, hand-maintained, with hex codes typed in directly. AI tools (Claude Code, AI image generators) had to be told the design system *every time* — pasted into the prompt, repeated in CLAUDE.md, sometimes inferred from the codebase.

  

The drift between the design system in the developer's head, the design system in the codebase, and the design system the AI tools see was unbounded. Three places, three sources of truth, three opportunities for inconsistency.

  

April 2026 collapsed those three places into one. **DESIGN.md** is now the canonical source. Every AI agent reads it. The Swift Theme struct is *generated* from it. There is no second source.

  

The shape of the system:

  

docs/DESIGN.md  ←  developer edits here

  

       │

  

       │  (codegen)

  

       ▼

  

Packages/DesignSystem/Sources/DesignSystem/Theme.swift  ← generated, not edited

  

       │

  

       ▼

  

Every SwiftUI view uses @Environment(\\.theme)

  

The CI rule: if the developer edits Theme.swift directly without editing DESIGN.md first, the build fails. The two sources are kept in sync by a generator and a checksum, not by discipline.

  

**Decision Point** — *Source of truth* — Swift Theme as canonical OR DESIGN.md as canonical. Recommendation: **DESIGN.md**. Confidence: **High**. Reasoning: every AI agent in the loop (Claude Code, Claude Design, ChatGPT Images 2.0, Figma for Agents, Cursor) speaks DESIGN.md natively. Making them speak Swift requires teaching each one to parse Swift. The codegen step is paid once and amortized over every prototype, every asset, every refactor.

  

## The three-layer token model

A design token is a named value (a color, a font size, a spacing increment). The three-layer model separates the value from its meaning from its application.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Layer\*\* | \*\*Example\*\* | \*\*Purpose\*\* |
| \*\*Primitives\*\* | \\\#FAF7F0, Geist Sans, 8pt | Raw values. Never used directly in views. |
| \*\*Semantic\*\* | colors.surface\\\_primary, typography.body, spacing.lg | Role-based names. The vocabulary the codebase speaks. |
| \*\*Component\*\* | CardStyle.default, ButtonStyle.primary | Combinations applied via SwiftUI view modifiers. |

  

DESIGN.md captures all three layers. The YAML front matter is mostly primitives and semantic. The Markdown body documents component conventions. The Swift Theme struct exposes all three.

  

The discipline: **a view is allowed to reference semantic and component tokens, never primitives.** A Color(red: 0.98, green: 0.97, blue: 0.94) in a view is a bug. A theme.colors.background is correct.

  

## DESIGN.md → Theme generator

The generator is a single Swift script that reads docs/DESIGN.md, parses the YAML front matter, and emits Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift. It runs as a build step in CI and as a local command.

  

Create scripts/generate-theme.swift:

  

\#\!/usr/bin/env swift

  

import Foundation

  

// Minimal YAML front matter extractor — keeps the script dependency-free.

  

// For more complex DESIGN.md files, switch to a real YAML parser.

  

let designMdPath = "docs/DESIGN.md"

  

let outputPath = "Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift"

  

guard let raw = try? String(contentsOfFile: designMdPath, encoding: .utf8) else {

  

    fputs("Could not read \\(designMdPath)\\n", stderr)

  

    exit(1)

  

}

  

// Extract YAML between the first two "---" markers

  

guard let firstDelim = raw.range(of: "---"),

  

      let secondDelim = raw.range(of: "---", range: firstDelim.upperBound..\<raw.endIndex) else {

  

    fputs("DESIGN.md missing YAML front matter\\n", stderr)

  

    exit(1)

  

}

  

let yaml = String(raw\[firstDelim.upperBound..\<secondDelim.lowerBound\])

  

// Parse the relevant sections — this is a minimal, intentionally rigid parser.

  

// It expects the exact key structure from the Chapter 3 DESIGN.md template.

  

// Any deviation should be addressed by failing loudly, not by being lenient.

  

func extract(\_ key: String, indented: Int = 0, in source: String) -\> String? {

  

    let prefix = String(repeating: " ", count: indented) + "\\(key):"

  

    for line in source.split(separator: "\\n", omittingEmptySubsequences: false) {

  

        let s = String(line)

  

        if s.hasPrefix(prefix) {

  

            return s.replacingOccurrences(of: prefix, with: "")

  

                .trimmingCharacters(in: CharacterSet(charactersIn: " \\"'"))

  

        }

  

    }

  

    return nil

  

}

  

func extractBlock(\_ key: String, in source: String) -\> String? {

  

    let prefix = "\\(key):"

  

    var capture = false

  

    var captured: \[String\] = \[\]

  

    var captureIndent: Int? = nil

  

    for line in source.split(separator: "\\n", omittingEmptySubsequences: false) {

  

        let s = String(line)

  

        let trimmed = s.trimmingCharacters(in: .whitespaces)

  

        let leading = s.prefix { $0 == " " }.count

  

        if \!capture && s.hasPrefix(prefix) {

  

            capture = true

  

            continue

  

        }

  

        if capture {

  

            if trimmed.isEmpty { continue }

  

            if captureIndent == nil { captureIndent = leading }

  

            if leading \>= (captureIndent ?? 0) {

  

                captured.append(s)

  

            } else {

  

                break

  

            }

  

        }

  

    }

  

    return captured.isEmpty ? nil : captured.joined(separator: "\\n")

  

}

  

guard let lightBlock = extractBlock("  light", in: yaml),

  

      let darkBlock  = extractBlock("  dark",  in: yaml) else {

  

    fputs("DESIGN.md missing colors.light or colors.dark\\n", stderr)

  

    exit(1)

  

}

  

func parseColor(\_ block: String, \_ key: String) -\> String {

  

    for line in block.split(separator: "\\n") {

  

        let s = String(line).trimmingCharacters(in: .whitespaces)

  

        if s.hasPrefix("\\(key):") {

  

            return s.replacingOccurrences(of: "\\(key):", with: "")

  

                .trimmingCharacters(in: CharacterSet(charactersIn: " \\"'"))

  

        }

  

    }

  

    fputs("Missing color: \\(key)\\n", stderr)

  

    exit(1)

  

}

  

let lightColors = \[

  

    "background", "surface\_primary", "surface\_secondary",

  

    "text\_primary", "text\_secondary", "text\_tertiary",

  

    "accent", "accent\_muted", "success", "danger"

  

\].map { ($0, parseColor(lightBlock, $0)) }

  

let darkColors = lightColors.map { (key, \_) in

  

    (key, parseColor(darkBlock, key))

  

}

  

// Compute checksum of the input — used to verify drift in CI

  

let checksum = String(raw.hashValue, radix: 16)

  

let header = """

  

// THIS FILE IS GENERATED FROM docs/DESIGN.md

  

// Do not edit. Run \`swift scripts/generate-theme.swift\` to regenerate.

  

// Source checksum: \\(checksum)

  

import SwiftUI

  

"""

  

func swiftColor(\_ hex: String) -\> String {

  

    // Convert "\#RRGGBB" or "rgba(r,g,b,a)" to a SwiftUI Color initializer

  

    if hex.hasPrefix("\#") {

  

        let s = String(hex.dropFirst())

  

        guard s.count == 6,

  

              let r = Int(s.prefix(2), radix: 16),

  

              let g = Int(s.dropFirst(2).prefix(2), radix: 16),

  

              let b = Int(s.suffix(2), radix: 16) else {

  

            return "Color.black /\* parse error: \\(hex) \*/"

  

        }

  

        return "Color(red: \\(Double(r)/255), green: \\(Double(g)/255), blue: \\(Double(b)/255))"

  

    }

  

    if hex.hasPrefix("rgba(") {

  

        let body = hex.replacingOccurrences(of: "rgba(", with: "").replacingOccurrences(of: ")", with: "")

  

        let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }

  

        guard parts.count == 4,

  

              let r = Int(parts\[0\]),

  

              let g = Int(parts\[1\]),

  

              let b = Int(parts\[2\]),

  

              let a = Double(parts\[3\]) else {

  

            return "Color.black /\* parse error: \\(hex) \*/"

  

        }

  

        return "Color(red: \\(Double(r)/255), green: \\(Double(g)/255), blue: \\(Double(b)/255), opacity: \\(a))"

  

    }

  

    return "Color.black /\* unknown format: \\(hex) \*/"

  

}

  

func camelCase(\_ snake: String) -\> String {

  

    let parts = snake.split(separator: "\_").map { String($0) }

  

    return parts.first.map { $0.lowercased() }.flatMap { first in

  

        Optional(first + parts.dropFirst().map { $0.capitalized }.joined())

  

    } ?? snake

  

}

  

let body = """

  

public struct Theme: Sendable {

  

    public let colors: Colors

  

    public let typography: Typography

  

    public let spacing: Spacing

  

    public let radius: Radius

  

    public init(colors: Colors, typography: Typography, spacing: Spacing, radius: Radius) {

  

        self.colors = colors

  

        self.typography = typography

  

        self.spacing = spacing

  

        self.radius = radius

  

    }

  

}

  

public struct Colors: Sendable {

  

    public let background, surfacePrimary, surfaceSecondary: Color

  

    public let textPrimary, textSecondary, textTertiary: Color

  

    public let accent, accentMuted: Color

  

    public let success, danger: Color

  

}

  

public struct Typography: Sendable {

  

    public let largeTitle, title, headline, body, caption, code: Font

  

}

  

public struct Spacing: Sendable {

  

    public let xs: CGFloat = 4

  

    public let sm: CGFloat = 8

  

    public let md: CGFloat = 12

  

    public let lg: CGFloat = 16

  

    public let xl: CGFloat = 24

  

    public let xxl: CGFloat = 32

  

    public init() {}

  

}

  

public struct Radius: Sendable {

  

    public let sm: CGFloat = 6

  

    public let md: CGFloat = 10

  

    public let lg: CGFloat = 16

  

    public init() {}

  

}

  

public extension Theme {

  

    static let light = Theme(

  

        colors: Colors(

  

            background:       \\(swiftColor(lightColors\[0\].1)),

  

            surfacePrimary:   \\(swiftColor(lightColors\[1\].1)),

  

            surfaceSecondary: \\(swiftColor(lightColors\[2\].1)),

  

            textPrimary:      \\(swiftColor(lightColors\[3\].1)),

  

            textSecondary:    \\(swiftColor(lightColors\[4\].1)),

  

            textTertiary:     \\(swiftColor(lightColors\[5\].1)),

  

            accent:           \\(swiftColor(lightColors\[6\].1)),

  

            accentMuted:      \\(swiftColor(lightColors\[7\].1)),

  

            success:          \\(swiftColor(lightColors\[8\].1)),

  

            danger:           \\(swiftColor(lightColors\[9\].1))

  

        ),

  

        typography: Typography(

  

            largeTitle: .custom("Geist", size: 34).weight(.semibold),

  

            title:      .custom("Geist", size: 22).weight(.semibold),

  

            headline:   .custom("Geist", size: 17).weight(.semibold),

  

            body:       .custom("Newsreader", size: 17),

  

            caption:    .custom("Newsreader", size: 13),

  

            code:       .custom("Geist Mono", size: 14)

  

        ),

  

        spacing: Spacing(),

  

        radius: Radius()

  

    )

  

    static let dark = Theme(

  

        colors: Colors(

  

            background:       \\(swiftColor(darkColors\[0\].1)),

  

            surfacePrimary:   \\(swiftColor(darkColors\[1\].1)),

  

            surfaceSecondary: \\(swiftColor(darkColors\[2\].1)),

  

            textPrimary:      \\(swiftColor(darkColors\[3\].1)),

  

            textSecondary:    \\(swiftColor(darkColors\[4\].1)),

  

            textTertiary:     \\(swiftColor(darkColors\[5\].1)),

  

            accent:           \\(swiftColor(darkColors\[6\].1)),

  

            accentMuted:      \\(swiftColor(darkColors\[7\].1)),

  

            success:          \\(swiftColor(darkColors\[8\].1)),

  

            danger:           \\(swiftColor(darkColors\[9\].1))

  

        ),

  

        typography: Theme.light.typography,

  

        spacing: Spacing(),

  

        radius: Radius()

  

    )

  

}

  

private struct ThemeKey: EnvironmentKey {

  

    static let defaultValue = Theme.light

  

}

  

public extension EnvironmentValues {

  

    var theme: Theme {

  

        get { self\[ThemeKey.self\] }

  

        set { self\[ThemeKey.self\] = newValue }

  

    }

  

}

  

public extension View {

  

    func theme(\_ theme: Theme) -\> some View {

  

        environment(\\\\.theme, theme)

  

    }

  

}

  

"""

  

let output = header + body

  

do {

  

    try output.write(toFile: outputPath, atomically: true, encoding: .utf8)

  

    print("✓ Generated \\(outputPath)")

  

} catch {

  

    fputs("Could not write to \\(outputPath): \\(error)\\n", stderr)

  

    exit(1)

  

}

  

Make it executable:

  

chmod +x scripts/generate-theme.swift

  

Run it:

  

swift scripts/generate-theme.swift

  

Expected output: ✓ Generated Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift.

  

Open the generated file. Notice:

  

  - It's marked // THIS FILE IS GENERATED — do not edit
  - It includes a checksum of DESIGN.md so CI can detect drift
  - It exports Theme.light and Theme.dark with values from DESIGN.md
  - The Environment key wiring is included — views can immediately use @Environment(\\.theme)

  

## Drift detection in CI

The generator alone isn't enough. A developer can edit Theme.generated.swift directly to "just fix this one color." The CI must catch that.

  

Add scripts/check-theme-drift.sh:

  

\#\!/usr/bin/env bash

  

set -e

  

\# Regenerate the theme file to a temporary location

  

swift scripts/generate-theme.swift

  

\# Compare against the committed version

  

if \! git diff --exit-code Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift \> /dev/null; then

  

    echo "❌ Theme.generated.swift drifted from docs/DESIGN.md"

  

    echo "Run 'swift scripts/generate-theme.swift' and commit the result."

  

    git diff Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift

  

    exit 1

  

fi

  

echo "✓ Theme.generated.swift in sync with DESIGN.md"

  

Add to .github/workflows/pr.yml in the lint job:

  

\- run: ./scripts/check-theme-drift.sh

  

Now any PR that edits Theme.generated.swift without first editing DESIGN.md (and re-running the generator) fails the build. The two sources are kept in sync by tooling, not by discipline.

  

## Using the theme in views

Every view in the codebase consumes the theme via the environment:

  

struct DashboardHeaderView: View {

  

    let userName: String

  

    @Environment(\\.theme) private var theme

  

    var body: some View {

  

        VStack(alignment: .leading, spacing: theme.spacing.sm) {

  

            Text("Today")

  

                .font(theme.typography.caption)

  

                .foregroundStyle(theme.colors.textTertiary)

  

            Text("Welcome, \\(userName)")

  

                .font(theme.typography.largeTitle)

  

                .foregroundStyle(theme.colors.textPrimary)

  

        }

  

        .padding(theme.spacing.lg)

  

        .background(theme.colors.surfacePrimary)

  

        .clipShape(RoundedRectangle(cornerRadius: theme.radius.md))

  

    }

  

}

  

Two rules:

  

1.  **No raw hex.** Color(red: 0.98, ...) in a view is a bug. The CI grep step (next subsection) catches it.
2.  **No raw spacing.** .padding(16) is a bug. The CI grep step catches \\.padding\\(\\d+\\) patterns.

  

Add scripts/check-design-violations.sh:

  

\#\!/usr/bin/env bash

  

set -e

  

\# Scan Features/ for hardcoded colors and spacing

  

VIOLATIONS=0

  

if grep -rn "Color(red:" Features/ Packages/DesignSystem/Sources/ --include='\*.swift' \\

  

   | grep -v "Theme.generated.swift" 2\>/dev/null; then

  

    echo "❌ Hardcoded Color(red:...) found. Use theme.colors.\* instead."

  

    VIOLATIONS=$((VIOLATIONS + 1))

  

fi

  

if grep -rn '\\.padding(\[0-9\]\\+)' Features/ --include='\*.swift' 2\>/dev/null; then

  

    echo "❌ Hardcoded .padding(N) found. Use theme.spacing.\* instead."

  

    VIOLATIONS=$((VIOLATIONS + 1))

  

fi

  

if grep -rn '\\.font(\\.system' Features/ --include='\*.swift' 2\>/dev/null; then

  

    echo "❌ Hardcoded .font(.system(...)) found. Use theme.typography.\* instead."

  

    VIOLATIONS=$((VIOLATIONS + 1))

  

fi

  

if \[ $VIOLATIONS -gt 0 \]; then

  

    echo "Found $VIOLATIONS design violations."

  

    exit 1

  

fi

  

echo "✓ No design violations."

  

Add to CI alongside the drift check.

  

## The Claude Design loop in practice

With DESIGN.md committed, Claude Design connected to the repo, and the Theme struct generated, the loop for any new screen is:

  

**Step 1 — Generate three variations.**

  

In Claude Design:

  

Generate three variations of the FuelWell weekly summary screen. Show the

  

last 7 days of meals and workouts, weekly calorie average, and a single key

  

insight. Use the existing design system.

  

Claude Design reads DESIGN.md from the repo and produces three on-brand variations. They will use the cream-and-terracotta palette, the Geist + Newsreader pairing, and the spacing scale you committed.

  

**Step 2 — Choose and capture.**

  

Pick the variation you want. Click "Share" → "Public URL." You now have a URL that points to the chosen mockup.

  

**Step 3 — Hand to Claude Code.**

  

In a Claude Code session:

  

Implement the weekly summary screen from this Claude Design mockup:

  

\[paste URL\]

  

Read Features/Nutrition/Sources/Nutrition/DailyLogFeature.swift for the

  

TCA pattern. Create a new feature at Features/Nutrition/Sources/Nutrition/

  

WeeklySummaryFeature.swift. Use the theme via @Environment. Follow the

  

construction rules in CLAUDE.md.

  

Claude Code fetches the mockup, reads it, and produces a TCA reducer + view that matches both the visual design and the codebase patterns. The result is not pixel-perfect to the mockup — it's *semantically* perfect, using your tokens and components. That's the goal.

  

**Step 4 — Run.**

  

xcodebuild test. If green, the new feature is in. If a snapshot test fails, review the diff: did the implementation diverge from the design system, or did the design system intentionally change?

  

## Generating non-UI assets with ChatGPT Images 2.0

Some things in an iOS app aren't screens. Empty-state illustrations, onboarding heroes, App Store screenshots, marketing imagery. These are images, not views. ChatGPT Images 2.0 (gpt-image-2) is the right tool.

  

The pattern:

  

**Step 1 — Construct the prompt with DESIGN.md context.**

  

Open docs/DESIGN.md. Copy the colors, typography, and the brand voice section.

  

In ChatGPT (Plus / Pro / Business), paste:

  

Reference design system:

  

Colors (light palette):

  

  background: \#FAF7F0 (warm cream)

  

  accent: \#C25A3A (terracotta)

  

  text\_primary: \#1A1612 (deep brown)

  

  surface\_secondary: \#F5EFE5 (soft tan)

  

Typography:

  

  display: Geist sans-serif, semibold weights

  

  body: Newsreader serif

  

Brand voice: warm, direct, science-honest. Calm, not energetic.

  

Generate: an empty-state illustration for the FuelWell meal log when the user

  

hasn't logged any meals today. Style: minimal, warm, line-illustration with a

  

single accent of terracotta. The illustration should evoke "begin gently" not

  

"you're failing." Avoid cartoon styles. Avoid gradients. Single subject.

  

Resolution: 2K. Thinking mode on.

  

**Step 2 — Pick the best of the eight outputs.**

  

Thinking mode generates up to 8 coherent images per prompt. Pick the one that matches the brand voice — usually the most restrained one.

  

**Step 3 — Save with a structured filename.**

  

Resources/Assets/EmptyStates/

  

  meal-log-empty-light.png

  

  meal-log-empty-dark.png

  

Generate the dark variant by re-prompting with the dark palette colors swapped in. ChatGPT Images 2.0 produces a coherent matched pair.

  

**Step 4 — Add to Xcode.**

  

Drag the PNGs into the FuelWell asset catalog as a single MealLogEmpty image set with light and dark appearances. Reference from the empty state component:

  

public struct MealLogEmptyState: View {

  

    @Environment(\\.theme) private var theme

  

    @Environment(\\.colorScheme) private var colorScheme

  

    public var body: some View {

  

        VStack(spacing: theme.spacing.lg) {

  

            Image("MealLogEmpty")

  

                .resizable()

  

                .scaledToFit()

  

                .frame(maxWidth: 240)

  

            VStack(spacing: theme.spacing.sm) {

  

                Text("Begin gently")

  

                    .font(theme.typography.headline)

  

                    .foregroundStyle(theme.colors.textPrimary)

  

                Text("Log your first meal to see your daily summary.")

  

                    .font(theme.typography.body)

  

                    .foregroundStyle(theme.colors.textSecondary)

  

                    .multilineTextAlignment(.center)

  

            }

  

        }

  

        .padding(theme.spacing.xl)

  

    }

  

}

  

The asset is brand-consistent because both the image and the copy were generated from the same DESIGN.md context. Drift is limited to the gap between DESIGN.md and reality, which is small and CI-detected.

  

## Component gallery & snapshot tests

Every new component or design system change goes through the Component Gallery covered in Chapter 7. With DESIGN.md as the source of truth, the gallery becomes the verification surface for the design system itself.

  

The snapshot test pattern (covered in detail in Chapter 14):

  

  - Snapshot the gallery in light theme
  - Snapshot the gallery in dark theme
  - Snapshot the gallery at accessibility5 Dynamic Type
  - Snapshot the gallery with reduce-motion enabled

  

When DESIGN.md changes, the snapshots change. The diff is review-able. A color change shows up as a literal pixel change in the snapshot — you can see what you're committing.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Editing Theme.generated.swift directly | "Just for one quick test" | The CI catches it. If you need a different theme value, edit DESIGN.md, regenerate, commit |
| Hardcoding colors / spacing in views | Speed | Run scripts/check-design-violations.sh locally before every commit; the script catches all three common violations |
| Letting DESIGN.md and the gallery drift | The gallery is built incrementally | When you add a new component to the gallery, add the corresponding documentation to DESIGN.md. Pair the changes |
| Generating assets without DESIGN.md context | "It's just one icon" | The asset will look subtly wrong against the rest of the app. The cost of including DESIGN.md in the prompt is 30 seconds; the cost of regenerating later is hours |
| Using Claude Design without DESIGN.md committed | "Claude Design will infer it" | Inference is a best guess. DESIGN.md is the contract. If DESIGN.md is missing, Claude Design produces three "off-brand" variations that you then have to retrofit |

  

## Hands-On Exercise

**Goal:** Generate the FuelWell theme from DESIGN.md, wire CI drift detection, and produce a brand-consistent empty state.

  

**Time budget:** 90 minutes.

  

**Steps:**

  

1.  Confirm docs/DESIGN.md exists with the YAML front matter from Chapter 3. If not, copy it.
2.  Save scripts/generate-theme.swift with the generator code from this chapter. chmod +x it.
3.  Run swift scripts/generate-theme.swift. Verify Theme.generated.swift was created.
4.  Open the generated file. Confirm Theme.light and Theme.dark values match your DESIGN.md.
5.  Save scripts/check-theme-drift.sh and scripts/check-design-violations.sh. chmod +x both.
6.  Add both scripts to .github/workflows/pr.yml in the lint job (referenced in Chapter 17).
7.  Open Claude Design. Generate three variations of "the FuelWell daily summary card showing 1450 of 2000 calories, 80g of 120g protein, and a list of three meals."
8.  Pick a variation. Hand the URL to Claude Code with the implementation prompt from this chapter. Verify the resulting code uses theme.colors.\* and theme.spacing.\* consistently.
9.  Open ChatGPT Images 2.0. Generate the meal-log empty-state illustration using the prompt template. Save light and dark variants.
10. Wire the empty state into Xcode's asset catalog. Implement MealLogEmptyState view.
11. Run xcodebuild test. Confirm green.
12. Commit each step. The history should read as a clean tour: theme generator, drift check, design violation check, Claude Design output, ChatGPT Images output, empty state component.

  

When the build runs green and DESIGN.md, Theme, Claude Design output, and ChatGPT Images output all use the same tokens, the design system is in place.

  

## What's Next

Chapter 9 is where the AddMealFeature reducer enters — a real form flow with validation, presentation state, and the dismiss pattern. With the design system in place, the form UI implementation is a straight read of DESIGN.md and a TCA reducer. The chapter is intentionally code-heavy: by Chapter 9, the architecture decisions are made and the patterns are clear; what remains is craft.

  