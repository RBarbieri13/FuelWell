# Chapter 15: Accessibility

"Accessibility is a property, not a feature."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Implement the core SwiftUI accessibility patterns that cover 90% of an app
2.  Run the DESIGN.md WCAG linter as part of CI so contrast violations are caught at PR time, not after launch
3.  Use Claude Design to generate accessibility-audited mockups before implementation
4.  Use ChatGPT Images 2.0 to generate VoiceOver-friendly empty-state imagery
5.  Maintain a per-screen accessibility audit checklist that scales as the app grows

## Prerequisites

Chapters 7 and 8 complete (component gallery exists, DESIGN.md is the canonical source, Theme is generated). The four key environment values (dynamicTypeSize, accessibilityReduceMotion, accessibilityReduceTransparency, voiceOver) are familiar concepts.

  

## The accessibility floor

Accessibility is not a feature you ship. It's a property the app either has or doesn't. There is no "accessible mode" toggle. There are no "accessibility users." There are users who happen to be using VoiceOver today, users who turned on Reduce Motion this morning, users who set Dynamic Type to accessibility5 because they're tired and want to read without squinting.

  

The floor for FuelWell:

  

  - **WCAG AA contrast** for all text. AAA where reasonable.
  - **44pt minimum tap targets** for any interactive element.
  - **Dynamic Type up to** **accessibility5** without text clipping or layout breaks.
  - **VoiceOver labels** on every interactive element, with accessibilityValue for stateful ones.
  - **Reduce Motion respected** on every animated transition.
  - **No information conveyed by color alone** — icons, text, or position must carry the meaning too.

  

This is the floor, not the ceiling. The ceiling is "every user gets a great experience." But the floor is what the CI must enforce, because the floor is testable.

  

## The DESIGN.md WCAG linter

Google Labs' DESIGN.md spec ships with a CLI linter that validates AI-generated design changes against WCAG AA contrast standards. For FuelWell, we adapt the linter into a CI step that runs against docs/DESIGN.md itself — because if the *source of truth* declares a non-compliant color pair, every screen built on top of it inherits the problem.

  

**Install the linter.** From the project root:

  

npm install -g @design-md/lint

  

Verify:

  

design-md lint --version

  

\# expect: 1.x or higher

  

**Run it against DESIGN.md:**

  

design-md lint docs/DESIGN.md --standard wcag-aa

  

Expected output, given the DESIGN.md from Chapter 3:

  

✓ light.text\_primary on light.background — contrast 14.8:1 (AAA)

  

✓ light.text\_secondary on light.background — contrast 7.4:1 (AAA)

  

✓ light.text\_tertiary on light.background — contrast 4.6:1 (AA)

  

✓ light.text\_primary on light.surface\_primary — contrast 16.2:1 (AAA)

  

✓ light.accent on light.background — contrast 5.1:1 (AA)

  

✓ dark.text\_primary on dark.background — contrast 15.3:1 (AAA)

  

✓ dark.text\_secondary on dark.background — contrast 7.9:1 (AAA)

  

✓ dark.text\_tertiary on dark.background — contrast 4.5:1 (AA)

  

✓ dark.accent on dark.background — contrast 5.4:1 (AA)

  

All 12 contrast pairs meet WCAG AA. 8 of 12 also meet AAA.

  

If a contrast pair fails, the output is loud:

  

✗ light.text\_tertiary on light.background — contrast 3.9:1 (FAIL — AA requires 4.5:1)

  

   Either: darken text\_tertiary to at least \#756B5E,

  

   or: use this token only at 18pt+ semibold (where AA threshold is 3:1)

  

**Wire into CI.** In .github/workflows/pr.yml, add to the lint job:

  

\- run: npm install -g @design-md/lint

  

\- run: design-md lint docs/DESIGN.md --standard wcag-aa

  

Now the contrast contract is enforced at PR time. A token change that breaks contrast fails CI before merge.

  

The linter also detects another class of issue: tokens that are *defined* but never *referenced* in the codebase, and tokens that are *used* in the codebase but not *defined* in DESIGN.md. Both are signs of drift.

  

design-md lint docs/DESIGN.md \\

  

  --standard wcag-aa \\

  

  --check-references Packages/DesignSystem/Sources/DesignSystem/Theme.generated.swift

  

## Core SwiftUI accessibility patterns

These are the patterns every component and screen uses. Memorize them.

  

// 1. Combine children — a tile or row speaks as one element to VoiceOver

  

.accessibilityElement(children: .combine)

  

.accessibilityLabel(label)

  

.accessibilityValue(value)

  

// 2. Hide decorative icons — VoiceOver shouldn't announce a chevron

  

Image(systemName: "chevron.right")

  

    .accessibilityHidden(true)

  

// 3. Custom action for swipe-only or long-press-only interactions

  

.accessibilityAction(named: "Delete meal") {

  

    store.send(.deleteSwiped(id: entry.id))

  

}

  

// 4. Adapt layout for accessibility Dynamic Type sizes

  

@Environment(\\.dynamicTypeSize) private var dynamicTypeSize

  

if dynamicTypeSize.isAccessibilitySize {

  

    VStack(alignment: .leading) { label; value }   // stack vertically when text is huge

  

} else {

  

    HStack { label; Spacer(); value }              // stack horizontally for normal sizes

  

}

  

// 5. Respect reduce motion

  

@Environment(\\.accessibilityReduceMotion) private var reduceMotion

  

.animation(reduceMotion ? nil : .smooth(duration: 0.4), value: progress)

  

// 6. Respect reduce transparency

  

@Environment(\\.accessibilityReduceTransparency) private var reduceTransparency

  

.background(.ultraThinMaterial)

  

.background(reduceTransparency ? theme.colors.surfacePrimary : Color.clear)

  

These six patterns cover the majority of FuelWell's accessibility needs. Components that follow them inherit accessibility correctness without per-component thinking.

  

## Generating audited mockups with Claude Design

Claude Design's research preview can audit a generated mockup against accessibility constraints in the same prompt. This catches problems before code is written.

  

The prompt pattern:

  

Generate a settings screen for FuelWell with toggles for:

  

\- Notifications

  

\- HealthKit sync

  

\- Daily reminder time

  

Constraints:

  

\- All tap targets minimum 44pt

  

\- Toggle labels readable at Dynamic Type accessibility5 without truncation

  

\- VoiceOver narration order top-to-bottom, left-to-right

  

\- WCAG AA contrast in both light and dark palettes

  

Use the existing design system. Three variations.

  

Claude Design produces three on-brand variations and includes a per-variation accessibility report alongside each. A typical report:

  

Variation 2 — accessibility audit

  

✓ All tap targets 48pt or larger

  

✓ Labels readable at accessibility5 (verified against generated Dynamic Type preview)

  

✓ Logical reading order top-to-bottom

  

✓ All text passes WCAG AA against surface\_primary

  

⚠ Toggle inactive state uses surface\_secondary on background — contrast 3.2:1

  

  (acceptable for non-text UI, but consider darker variant for visibility)

  

The warning isn't a fail — non-text UI has a lower contrast threshold (3:1 versus 4.5:1) — but it's a flag. The variation that ships is the one where the audit is clean or where the warnings are documented and accepted.

  

**Implementation prompt.** When handing the chosen variation to Claude Code:

  

Implement the FuelWell settings screen from this Claude Design mockup:

  

\[URL\]

  

The mockup includes an accessibility audit. Implement against the audit:

  

combine children for each toggle row, label every toggle, hide decorative

  

icons, support adaptive layout at accessibility5. Reference the patterns

  

in Chapter 15 of the project documentation.

  

Create at Features/Settings/Sources/Settings/SettingsView.swift.

  

Claude Code will produce an implementation that includes the accessibility patterns by default — because the prompt explicitly asks for them and CLAUDE.md reinforces the conventions.

  

## VoiceOver-friendly imagery

When ChatGPT Images 2.0 generates an empty-state illustration, the image is decorative. VoiceOver users don't experience the illustration; they experience the headline and body text wrapping it. This means:

  

1.  The image gets accessibilityHidden(true).
2.  The text *around* the image must convey the message on its own.

  

The wrong empty state:

  

VStack {

  

    Image("MealLogEmpty")  // illustration shows a hand reaching toward a plate

  

    Text("Tap to begin")   // ambiguous without the visual context

  

}

  

The right empty state:

  

VStack(spacing: theme.spacing.lg) {

  

    Image("MealLogEmpty")

  

        .accessibilityHidden(true)

  

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

  

The image is decorative. The text carries the meaning for VoiceOver users. For sighted users, the image and text together set the tone.

  

When prompting ChatGPT Images 2.0 for an empty state, add the constraint explicitly:

  

The illustration is decorative. The accompanying copy will carry the

  

meaning for VoiceOver users. Generate something that complements the

  

copy "Begin gently — log your first meal to see your daily summary"

  

without trying to communicate the same message visually.

  

The image generator now produces an image that *enhances* the text rather than competing with it. Subtle distinction; meaningful at scale.

  

## Per-screen accessibility audit checklist

Every screen in the app passes this checklist before merging. The checklist is short on purpose — long checklists go unread.

  

|  |  |
| :-: | :-: |
| \*\*Item\*\* | \*\*How to verify\*\* |
| Every interactive element has accessibilityLabel | Open in Xcode, press Cmd+Opt+S to see accessibility hierarchy |
| Every swipe / long-press action has an accessibilityAction equivalent | Read through .swipeActions and .onLongPressGesture calls |
| At accessibility5, no text clips and no layout breaks | Run preview at accessibility5 Dynamic Type |
| Color contrast 4.5:1 normal, 3:1 large | DESIGN.md linter at PR time; spot check via Accessibility Inspector |
| Decorative icons marked accessibilityHidden(true) | Grep for Image(systemName: not followed by .accessibilityHidden or .accessibilityLabel |
| Animations respect reduceMotion | Grep for .animation( not gated by reduceMotion ? nil : |
| Snapshot test exists for accessibility5 Dynamic Type | Component Gallery snapshot at .environment(\\\\.dynamicTypeSize, .accessibility5) |
| Accessibility Inspector audit reports zero issues | Xcode → Open Developer Tool → Accessibility Inspector → Audit |

  

The Accessibility Inspector's audit feature deserves special mention. It's a button in Xcode that scans the running app and produces a list of accessibility issues — missing labels, low contrast, missing values, conflicting traits. Run it before every release.

  

## Worst-case gallery preview

The Component Gallery from Chapter 7 has light and dark previews. Add an "accessibility worst case" preview that exercises every constraint at once:

  

\#Preview("Accessibility worst case") {

  

    ComponentGallery()

  

        .theme(.light)

  

        .environment(\\.dynamicTypeSize, .accessibility5)

  

        .environment(\\.accessibilityReduceMotion, true)

  

        .environment(\\.accessibilityReduceTransparency, true)

  

}

  

Pair it with a snapshot test:

  

@Test

  

func gallery\_accessibilityWorstCase() {

  

    let view = ComponentGallery()

  

        .theme(.light)

  

        .environment(\\.dynamicTypeSize, .accessibility5)

  

        .environment(\\.accessibilityReduceMotion, true)

  

        .frame(width: 390, height: 2400)

  

    assertSnapshot(of: view, as: .image)

  

}

  

When a future change breaks the worst-case rendering, the snapshot diff catches it. The gallery becomes the canary for accessibility regressions across the entire app.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Treating accessibility as a release-blocker checklist instead of a daily habit | Time pressure | The patterns above add seconds per component. Build the habit; the audit becomes a confirmation, not a fix-list |
| Hardcoding contrast values that violate AA "because the design called for it" | Designer aesthetic preference | Run the DESIGN.md linter. If a token fails AA, fix it in DESIGN.md, regenerate Theme, and document the change in docs/decisions.md |
| Using .accessibilityHidden(true) on a meaningful element to "clean up VoiceOver" | Over-zealous hiding | If the element conveys meaning, label it. If it's decorative, hide it. The middle ground (meaningful but hidden) is wrong |
| Skipping accessibilityValue because accessibilityLabel "feels enough" | Misunderstanding the API | Label is \*what\* the element is ("Daily calories"). Value is \*the current state\* ("1420 of 2000 kilocalories, 71 percent"). Both, always, on stateful elements |
| Treating images from ChatGPT Images 2.0 as content, not decoration | Default mental model | Image generators produce decorative content. The text around the image carries the meaning. Hide the image from VoiceOver |
| Ignoring reduceTransparency because most users don't have it on | Most users don't, but the ones who do \*need\* it | Same logic as reduceMotion — minimal cost, meaningful payoff |

  

## Hands-On Exercise

**Goal:** Add the WCAG linter to CI and audit the existing FuelWell screens against the checklist.

  

**Time budget:** 90 minutes.

  

**Steps:**

  

1.  Install @design-md/lint. Run it against docs/DESIGN.md. Confirm the output shows passing contrast pairs.
2.  Add the design-md lint step to .github/workflows/pr.yml in the lint job.
3.  Open the running FuelWell app in the simulator. Open Accessibility Inspector (Xcode → Open Developer Tool → Accessibility Inspector).
4.  Click the Audit button. Walk through the audit results screen by screen. Note any issues.
5.  For each issue: open the corresponding view file. Apply the appropriate pattern from this chapter. Re-run the audit.
6.  Add the "Accessibility worst case" preview to the Component Gallery from Chapter 7.
7.  Add the worst-case snapshot test from this chapter to the DesignSystem test target.
8.  Run xcodebuild test. Approve the new snapshot if it looks correct.
9.  For an empty state in the app (use the MealLogEmptyState from Chapter 7 if you have it, or create one): mark the image accessibilityHidden(true), ensure the surrounding text carries the meaning, snapshot it.
10. Commit each step. The history reads as a tour of accessibility hardening: linter wired, audit run, fixes applied, worst-case snapshot added.

  

When the audit reports zero issues and the worst-case snapshot is committed, the floor is in place. Maintaining the floor — adding the patterns to every new component, running the audit before every release — is a continuous practice, not a one-time exercise.

  

## What's Next

Chapter 16 covers performance: budgets, OSSignposter instrumentation, the measured-fix playbook, and the pre-release performance checklist. Performance and accessibility share a structural similarity — both are properties the app either has or doesn't, both have specific tools for measurement, and both have common pitfalls that stem from treating them as features rather than properties. After Chapter 16, the quality layer of the app is fully specified: testing (14), accessibility (15), and performance (16) all have hard contracts and CI enforcement.

  