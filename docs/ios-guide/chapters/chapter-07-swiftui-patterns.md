# Chapter 7: SwiftUI Patterns & Component Gallery

"If a view depends on the whole store, the view is wrong."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Internalize five view-construction rules that keep the codebase AI-tractable
2.  Use Claude Design as the entry point for any new component, not as an afterthought
3.  Build the component gallery as the visual surface for design-system testing
4.  Write components that accept scoped state from the store, never the whole store
5.  Generate brand-consistent imagery and assets via ChatGPT Images 2.0 when SwiftUI alone won't cut it

## Prerequisites

Chapter 8 read or completed (DESIGN.md and the generated Theme struct in place). Chapter 4 complete (TCA installed, DailyLogFeature reducer working). The Packages/DesignSystem package exists and depends on Core.

  

## The five view-construction rules

These are the rules every SwiftUI view in FuelWell follows. They aren't style preferences — they're the rules that make a view AI-tractable. Claude Code will follow them when it knows them; without them it will silently produce code that works in isolation but fails at composition.

  

1.  **Views receive exactly the scoped state they need, not the whole store.** A MealRow view takes a MealEntry, not a StoreOf\<DailyLogFeature\>. The view doesn't care that there's a feature; it cares that there's a meal.
2.  **No** **@ObservedObject****, no** **@StateObject****.** The only state primitives a view should reach for are @Bindable var store: StoreOf\<X\> (when it needs to bind to TCA state), @State (for purely local UI state like an animation flag), and @Environment(\\.theme).
3.  **Every color, font, and spacing value goes through** **@Environment(\\.theme)****.** Never hardcoded. A view that hardcodes Color(red: 0.98, ...) is a bug. The CI check from Chapter 8 catches it.
4.  **Components live in** **Packages/DesignSystem****. Screens live in** **Features/\<Feature\>****.** A component is reusable across features. A screen knows about a specific feature. Don't blur the line — when in doubt, build it as a component, then wrap it in a screen.
5.  **Every component has a** **\#Preview** **and an entry in** **ComponentGallery****.** No exceptions. If you build a component that isn't in the gallery, the snapshot test in Chapter 14 won't catch regressions in it.

  

## The new entry point: Claude Design

Before April 2026, the workflow for a new component was: imagine it in your head, write the SwiftUI, render the preview, iterate on the spacing and colors until it feels right. The AI would help with the implementation, but the *design* — the proportions, the visual hierarchy, the color choices — lived in the developer's head.

  

After April 2026, that workflow is upside down. The new workflow is:

  

**1. Generate the component with Claude Design first.**

  

Open claude.ai/design, point it at your repo, and prompt:

  

Generate a MetricTile component for FuelWell. It shows a label,

  

a numeric value, an optional icon, and an optional trend indicator

  

(up/down/flat with a percentage). Three variations: compact, default,

  

and emphasized. Use the existing design system.

  

Claude Design reads docs/DESIGN.md from the repo and produces three variations on a canvas. Each variation uses your tokens — the cream background, the terracotta accent, the Geist typography. They're not generic.

  

**2. Pick the variation that fits.**

  

The "right" variation isn't the prettiest one. It's the one that fits the contexts where the component will live. The default MetricTile will appear on the dashboard alongside the macro ring; check that it doesn't compete visually. The emphasized variation will appear at the top of a detail view; check that it has enough weight to anchor the screen.

  

**3. Capture the chosen variation.**

  

In Claude Design, click "Share" → "Public URL" on the chosen variation. Save that URL — you'll hand it to Claude Code in the next step.

  

**4. Hand it to Claude Code.**

  

In a Claude Code session at the repo root:

  

Implement a MetricTile component from this Claude Design mockup:

  

\[paste URL\]

  

Place it at Packages/DesignSystem/Sources/DesignSystem/MetricTile.swift.

  

Read existing components in that folder for conventions. Use @Environment(\\.theme)

  

for all tokens. Follow the construction rules in CLAUDE.md. Add a \#Preview

  

showing all three variations (compact, default, emphasized) at multiple

  

states (with trend up, down, flat, and absent). Add an entry to ComponentGallery.swift.

  

Claude Code fetches the mockup, reads the existing component patterns, and produces the implementation. The result will not be pixel-perfect to the Claude Design output — it will be *semantically* perfect, using your tokens through the theme.

  

**5. Review the result against the mockup.**

  

Open the SwiftUI preview in Xcode. Compare to the Claude Design mockup. The diff is now in two places: token drift (which is a DESIGN.md problem, not a component problem) or implementation drift (which is a Claude Code prompt problem). Both have specific fixes.

  

**6. Run snapshot tests.**

  

xcodebuild test. The Component Gallery snapshot will update with the new variation. Review the diff in the snapshot test results. If it looks right, commit the new snapshot.

  

## Worked example: MacroRingView

Let's walk the loop end-to-end with a real component. The MacroRingView shows daily calorie progress as a circular ring with the consumed / target value at the center.

### Claude Design prompt

Generate a MacroRingView component for FuelWell. Circular progress ring

  

showing today's calorie consumption against a daily target. Center text

  

shows consumed kcal in large display type, with "of \[target\] kcal" below

  

in smaller body type. Ring should be 14pt thick with a rounded cap.

  

Three states to render in the gallery:

  

\- 0 / 2000 kcal (just starting)

  

\- 1420 / 2000 kcal (mid-day, \~70% complete)

  

\- 2200 / 2000 kcal (over target — the ring should still cap at full,

  

  but the center text should communicate the over-target state)

  

Use the existing design system. Animate progress smoothly when value changes,

  

respecting accessibilityReduceMotion.

### Claude Design output

Three variations on a canvas. Variation 1 has a thin ring with bold center type. Variation 2 has a thicker ring (the requested 14pt) with hierarchy between the consumed value and the "of target" subtitle. Variation 3 has a multi-segment ring split into protein/carbs/fat (a future enhancement, not what we asked for, but useful to see).

  

Pick Variation 2.

### Claude Code prompt

Implement MacroRingView from this Claude Design mockup:

  

\[Variation 2 URL\]

  

Place at Packages/DesignSystem/Sources/DesignSystem/MacroRingView.swift.

  

Use @Environment(\\.theme) for all colors and fonts. Use @Environment(\\.accessibilityReduceMotion)

  

for animation gating. Include a \#Preview showing the three states from the

  

mockup. Add to ComponentGallery's "Progress" section.

  

Specific requirements from the construction rules:

  

\- public init

  

\- Equatable Sendable inputs

  

\- accessibilityElement(children: .combine), accessibilityLabel, accessibilityValue

### Claude Code result

import SwiftUI

  

public struct MacroRingView: View {

  

    let consumed: Int

  

    let target: Int

  

    @Environment(\\.theme) private var theme

  

    @Environment(\\.accessibilityReduceMotion) private var reduceMotion

  

    public init(consumed: Int, target: Int) {

  

        self.consumed = consumed

  

        self.target = target

  

    }

  

    private var progress: Double {

  

        guard target \> 0 else { return 0 }

  

        return min(1.0, Double(consumed) / Double(target))

  

    }

  

    private var isOverTarget: Bool {

  

        consumed \> target

  

    }

  

    public var body: some View {

  

        ZStack {

  

            Circle()

  

                .stroke(theme.colors.surfaceSecondary, lineWidth: 14)

  

            Circle()

  

                .trim(from: 0, to: progress)

  

                .stroke(

  

                    isOverTarget ? theme.colors.danger : theme.colors.accent,

  

                    style: StrokeStyle(lineWidth: 14, lineCap: .round)

  

                )

  

                .rotationEffect(.degrees(-90))

  

                .animation(reduceMotion ? nil : .smooth(duration: 0.6), value: progress)

  

            VStack(spacing: 2) {

  

                Text("\\(consumed)")

  

                    .font(theme.typography.largeTitle)

  

                    .foregroundStyle(theme.colors.textPrimary)

  

                Text("of \\(target) kcal")

  

                    .font(theme.typography.caption)

  

                    .foregroundStyle(theme.colors.textSecondary)

  

                if isOverTarget {

  

                    Text("over target")

  

                        .font(theme.typography.caption)

  

                        .foregroundStyle(theme.colors.danger)

  

                }

  

            }

  

        }

  

        .frame(width: 180, height: 180)

  

        .accessibilityElement(children: .combine)

  

        .accessibilityLabel("Daily calories")

  

        .accessibilityValue(accessibilityValueText)

  

    }

  

    private var accessibilityValueText: String {

  

        let percent = Int(progress \* 100)

  

        if isOverTarget {

  

            let over = consumed - target

  

            return "\\(consumed) of \\(target) kilocalories. \\(over) over target."

  

        }

  

        return "\\(consumed) of \\(target) kilocalories, \\(percent) percent of daily target."

  

    }

  

}

  

\#Preview("MacroRingView") {

  

    HStack(spacing: 24) {

  

        MacroRingView(consumed: 0,    target: 2000)

  

        MacroRingView(consumed: 1420, target: 2000)

  

        MacroRingView(consumed: 2200, target: 2000)

  

    }

  

    .padding()

  

    .theme(.light)

  

}

  

The implementation matches the chosen variation in semantic terms: the same ring structure, the same hierarchy in the center text, the over-target signaling. The colors come from the theme. The fonts come from the theme. The animation respects reduce-motion.

  

It also adds something the mockup didn't show: an accessibilityValue that announces the state to VoiceOver users. Claude Code knew to add it because CLAUDE.md includes the construction rule.

  

That's the loop in practice.

  

## The component gallery

The gallery is one SwiftUI view that renders every design-system component in multiple states. It's the visual contract for the design system and the surface that snapshot testing exercises. New components are added to the gallery as part of the same PR that adds the component.

  

public struct ComponentGallery: View {

  

    public init() {}

  

    public var body: some View {

  

        ScrollView {

  

            VStack(alignment: .leading, spacing: 32) {

  

                section("Progress") {

  

                    HStack(spacing: 24) {

  

                        MacroRingView(consumed: 0,    target: 2000)

  

                        MacroRingView(consumed: 1420, target: 2000)

  

                        MacroRingView(consumed: 2200, target: 2000)

  

                    }

  

                }

  

                section("Metric tiles") {

  

                    LazyVGrid(columns: \[GridItem(.flexible()), GridItem(.flexible())\], spacing: 12) {

  

                        MetricTile(label: "Steps",       value: "4,237", icon: "figure.walk", trend: .up("12%"))

  

                        MetricTile(label: "Active kcal", value: "412",   icon: "flame",       trend: .flat)

  

                        MetricTile(label: "Sleep",       value: "7h 22m", icon: "moon.fill",  trend: .down("5%"))

  

                        MetricTile(label: "Workouts",    value: "3",     icon: "dumbbell",    trend: nil)

  

                    }

  

                }

  

                section("Buttons") {

  

                    VStack(spacing: 8) {

  

                        PrimaryButton(title: "Save Meal") {}

  

                        SecondaryButton(title: "Cancel") {}

  

                        PrimaryButton(title: "Save Meal") {}.disabled(true)

  

                    }

  

                }

  

                section("Empty states") {

  

                    MealLogEmptyState()

  

                        .frame(height: 320)

  

                }

  

            }

  

            .padding()

  

        }

  

    }

  

    @ViewBuilder

  

    private func section\<Content: View\>(\_ title: String, @ViewBuilder content: () -\> Content) -\> some View {

  

        VStack(alignment: .leading, spacing: 12) {

  

            Text(title.uppercased())

  

                .font(.system(size: 11, weight: .semibold).monospaced())

  

                .tracking(0.18 \* 11)

  

                .foregroundStyle(.secondary)

  

            content()

  

        }

  

    }

  

}

  

\#Preview("Light") {

  

    ComponentGallery().theme(.light)

  

}

  

\#Preview("Dark") {

  

    ComponentGallery().theme(.dark).preferredColorScheme(.dark)

  

}

  

\#Preview("Accessibility 5") {

  

    ComponentGallery()

  

        .theme(.light)

  

        .environment(\\.dynamicTypeSize, .accessibility5)

  

}

  

The gallery is intentionally not a marketing page. It's a contract. Every component that ships in Packages/DesignSystem appears here in every state that matters. The snapshot tests in Chapter 14 take this gallery and render it to images for diff review.

  

## When a component needs an asset, not a view

Some "components" aren't really components — they're images dressed in SwiftUI chrome. An empty-state illustration. An onboarding hero. A celebration graphic. SwiftUI is the wrong tool for these; you'll spend hours fighting Path and Shape to produce something a 90-second image generation could nail.

  

For these, the workflow is:

  

**1. Generate the asset with ChatGPT Images 2.0.**

  

Use the DESIGN.md prompt pattern from Chapter 8. Generate light and dark variants by re-prompting with the dark palette swapped in.

  

**2. Add the asset to the Xcode catalog.**

  

In Xcode, drag the PNGs into Resources/Assets.xcassets. Create an image set with light and dark appearances. Name it semantically (MealLogEmpty, not illustration\_v3).

  

**3. Wrap the asset in a SwiftUI component.**

  

public struct MealLogEmptyState: View {

  

    @Environment(\\.theme) private var theme

  

    public init() {}

  

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

  

        .accessibilityElement(children: .combine)

  

    }

  

}

  

**4. Add it to the gallery.**

  

The empty state goes in the gallery's "Empty states" section. The snapshot tests now cover it. If the asset ever gets regenerated, the snapshot diff will surface the change.

  

The wrapping component owns the *layout* (image + headline + body, padding, alignment); the asset owns the *illustration*. Each is changed in its own way. The asset is regenerated via ChatGPT Images 2.0 when the brand evolves; the layout is iterated in SwiftUI when the spacing or hierarchy needs adjustment.

  

## Component-by-feature versus component-as-package

A common question: when does a "component" graduate from being part of a feature to being part of DesignSystem?

  

The rule: **if more than one feature would use it, it's a component. If only one feature uses it, it's a screen detail.**

  

MetricTile is a component — Dashboard uses it for steps, Nutrition uses it for daily protein, Workouts uses it for weekly volume.

  

DailyLogRow is a screen detail — it's intrinsically about a meal entry, the shape of which is owned by the Nutrition feature. It belongs in Features/Nutrition/Sources/Nutrition/Views/DailyLogRow.swift.

  

When in doubt, start with the screen detail. Promotion to a component is cheap (move the file, update imports). Demotion is expensive (every place that uses the component now needs to be untangled).

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Building a component without a Claude Design pass first | "I know what it should look like" | The Claude Design pass takes 60 seconds and surfaces alternatives you wouldn't have considered. The cost of skipping it is reworking the component a week later when it doesn't fit |
| Skipping the Component Gallery entry | "I'll add it later" | Components not in the gallery aren't covered by snapshot tests. Regressions slip through. Add to the gallery as part of the component PR |
| Drawing illustrations in SwiftUI when an image would do | "It's more elegant in code" | Path / Shape gymnastics for an illustration that should take 90 seconds in ChatGPT Images 2.0 is a productivity sink. Use the right tool |
| Hardcoding spacing in components "just to make it work" | The CI hasn't caught it yet | Run scripts/check-design-violations.sh locally. The script catches \\\\.padding(\\\\d+), Color(red:, and \\\\.font(\\\\.system patterns |
| Putting screen-specific components in DesignSystem | "It might be reused later" | Keep it in the feature until two features use it. Premature abstraction creates a DesignSystem package full of components no one understands |

  

## Hands-On Exercise

**Goal:** Use the full Claude Design → Claude Code loop to add the MetricTile component end-to-end.

  

**Time budget:** 60 minutes.

  

**Steps:**

  

1.  Open Claude Design. Confirm it's connected to the repo and reads DESIGN.md (the dashboard prompt from Chapter 3 should still work).
2.  Prompt for MetricTile with three variations: compact, default, emphasized. Each renders a label, value, optional icon, optional trend indicator.
3.  Pick the default variation. Capture the public URL.
4.  In a Claude Code session, hand the URL to Claude Code with the prompt template from this chapter. Specify Packages/DesignSystem/Sources/DesignSystem/MetricTile.swift as the destination.
5.  Open the generated file. Verify it uses @Environment(\\.theme), has public init, includes a \#Preview, and uses accessibilityElement(children: .combine).
6.  Open ComponentGallery.swift. Add a "Metric tiles" section with four states (up trend, flat trend, down trend, no trend).
7.  Run xcodebuild test. The snapshot test will produce a new gallery snapshot covering the new component. Approve it via the snapshot test workflow (covered in Chapter 14).
8.  Run scripts/check-design-violations.sh. Confirm no violations.
9.  Commit with a message like Chapter 7: MetricTile component via Claude Design + Claude Code loop.

  

When the build is green and the gallery snapshot includes the new component without any hardcoded tokens, the loop is working.

  

## What's Next

Chapter 8 (which you've already read) covers the design system that this chapter builds on top of. Chapter 9 is where the form patterns enter the codebase: the AddMealFeature reducer and view, with validation, presentation state, and the cancel-with-unsaved-changes pattern. After Chapter 9 you'll have a real, end-to-end-tested vertical slice of the app: a list view, a form for adding entries, persistence, and tests that cover all of it.

  