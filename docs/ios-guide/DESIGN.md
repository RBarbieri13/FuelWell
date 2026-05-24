# FuelWell — DESIGN.md

> **Format:** Google Labs DESIGN.md (Apache 2.0). This file is the canonical source of truth for FuelWell's design system. Every AI agent in the loop (Claude Code, Claude Design, ChatGPT Images 2.0, Figma for Agents) reads this file. The Swift `Theme` struct in `Packages/DesignSystem` is generated from it, not hand-maintained.
>
> **Brand green resolved (May '26, Robert + Max):** the canonical brand green is `#47E7B0` (per commit `63419cb`). The deeper `#3D9B2F` is retired — `src/lib/design-tokens.ts` must be updated and the CI drift check will fail until it is. The action/success green `#00D278` is a *separate* token (semantic + macro use); it is not the brand mark color and is not affected by this resolution.
>
> **Surfaces note (May '26 review, Robert + Max):** the in-product palette is **light-mode native**. The Core Dashboard, Macro Tracking and Workout Detail screens are all rendered on light surfaces — verdict-led, information-dense, with semantic and macro accents at full saturation so they pop against `#F4F5F7`. A dark variant is documented at the end of the Color section but is **opt-in**, not the default. The marketing site (`fuelwellhealth.com`, in `RBarbieri13/FuelWell`) is a separate light system with its own emerald `#34D399` + warm orange `#F4945E` palette — keep them distinct in code (`Theme.app` vs `Theme.marketing`).

---

## Brand

**Name:** FuelWell
**Mission:** A real-time decision system that removes the need for users to constantly figure out what to do about their nutrition.
**What it is not:** a tracking app, a workout app, a nutrition planner.

**Voice**
- Direct, never hedging. "Eat a real lunch" beats "consider a more substantial meal."
- Confident in the recommendation. The user came here because they didn't want to decide.
- Specific. "320 calories under" beats "you have room for more."
- Respectful of the user's time. No celebratory copy after every meal log.
- Dense. Show numbers, not breathing room. Tight rows, tabular figures, no decorative whitespace. Users open the app to get facts.

**Voice — banned vocabulary** (carried over from marketing-site review)
- ❌ "shred," "crush," "grind," "beast mode," "diet," "cheat day"
- ❌ Clinical-medical: "subject," "intervention," "compliance," "BMI protocol"
- ✅ Preferred: "smarter," "personalized," "adaptive," "real-time," "your body," "your day," "guidance," "recalibrate," "rebalance," "macros," "recovery," "energy"

**Anti-patterns** (what FuelWell never looks like)
- A wall of macros with no recommendation in sight.
- Streaks, badges, gamification rewards.
- Tab bars where the verdict isn't on the first screen the user sees.
- Modal popups for non-critical events.
- Aggressive multi-stop gradients on flat surfaces. Gradients are reserved for the brand CTA, the verdict ring, the gradient-text emphasis, and ambient blurred mesh blobs.
- Emoji as decoration. Inline functional emoji (🍗 / 🥑) is OK in a macro callout where it replaces a label; never in headlines, never in buttons.
- Pastel or desaturated semantic colors. On light surfaces, semantic and macro tokens stay at full saturation — that's the *pop* against `#F4F5F7`. Tint backgrounds (e.g. success at 10% alpha) are fine; tinted *foregrounds* are not.

---

## Color

Color tokens are **light-mode native** (May '26 review). Surfaces are bright by default; semantic and macro accents are used at full saturation so they pop against neutral light backgrounds. A dark variant is documented at the end of this section — opt-in, not the default.

### Primary

| Token | Hex | Use |
|---|---|---|
| `color.primary.orange` | `#E87A1D` | Brand warm accent, CTAs in marketing context, fuel / pre-workout chips |
| `color.primary.green` | `#47E7B0` | **Canonical brand mark** — logo, splash, brand-mention treatments. Resolved May '26 (was `#3D9B2F`). |
| `color.primary.accent` | `#00D278` | Action / success green — verdicts, macros, on-track chips. Distinct from the brand mark above; they coexist by role, not by accident. |

### Background — light (canonical)

| Token | Hex | Use |
|---|---|---|
| `color.bg.base` | `#F4F5F7` | Root window |
| `color.bg.surface` | `#FFFFFF` | Cards, sheets |
| `color.bg.elevated` | `#0F1117` | **Inverted highlight row** — used to feature a single dense row (macros band, fuel callout) against the otherwise-light layout. Acts as the workhorse for emphasis in a light theme. |
| `color.bg.border` | `#E5E7EB` | Card borders, top-level dividers |
| `color.bg.borderSoft` | `#EEF0F3` | Inner dividers within a card (e.g. between exercise rows) |

### Text — light (canonical)

| Token | Hex | Use |
|---|---|---|
| `color.text.primary` | `#0A0A0F` | Headlines, verdicts |
| `color.text.body` | `#1F2937` | Body copy |
| `color.text.secondary` | `#6B7280` | Labels, captions |
| `color.text.muted` | `#9CA3AF` | Placeholder, helper text |
| `color.text.disabled` | `#C7CCD3` | Disabled controls |
| `color.text.onDark` | `#FFFFFF` | Foreground over `bg.elevated` highlight rows |
| `color.text.onDarkMuted` | `#9AA0AC` | Labels over `bg.elevated` |

### Semantic

| Token | Hex | Use |
|---|---|---|
| `color.semantic.success` | `#00D278` | On-track, positive verdict |
| `color.semantic.warning` | `#F59E0B` | Approaching limits, caution |
| `color.semantic.error` | `#EF4444` | Over-limit, blocked action |
| `color.semantic.info` | `#00B4D8` | Neutral information |
| `color.semantic.premium` | `#A855F7` | Premium-tier surfaces (post-Pilot) |

### Macro-channel colors *(carried over from in-app reference screens)*

| Token | Hex | Use |
|---|---|---|
| `color.macro.protein` | `#00D278` | Protein progress, protein chip |
| `color.macro.carbs` | `#F59E0B` | Carbs progress, carbs chip |
| `color.macro.fat` | `#A855F7` | Fat progress, fat chip |
| `color.macro.calories` | `#00D278` | Calorie ring outer stroke |

**Saturation rule:** these values are used as-is on light surfaces. Do not lighten or tint a macro/semantic token for the foreground — the punch is the point. The only allowed reduction is for *background tints*, at exactly 10% alpha (e.g. `rgba(0,210,120,.10)` for an on-track chip behind protein numerics).

### Gradients

| Token | Definition | Use |
|---|---|---|
| `gradient.brand` | `linear-gradient(135deg, #E87A1D, #00D278)` | Hero CTA, branded buttons |
| `gradient.header` | `linear-gradient(135deg, #1A1A2E, #16213E)` | Top-of-screen washes (dark variant only) |
| `gradient.premiumGlow` | `linear-gradient(135deg, #2A1A3E, #1A2A3E)` | Premium-feature backgrounds (dark variant only) |
| `gradient.text` | `linear-gradient(90deg, #00D278, #00B4D8)` | Display-type emphasis — the headline-phrase highlight inside a verdict |

### Dark variant (opt-in)

Kept for the eventual system-following dark mode and for OS surfaces (lock-screen widget, watch). **Do not** ship a screen in dark unless the spec calls for it.

| Token | Hex | Use |
|---|---|---|
| `color.bg.base.dark` | `#0A0A0F` | Root window |
| `color.bg.surface.dark` | `#111118` | Cards, sheets |
| `color.bg.elevated.dark` | `#1A1A24` | Modals, popovers, raised cards |
| `color.bg.border.dark` | `#2A2A3A` | Dividers, card borders |
| `color.text.primary.dark` | `#FFFFFF` | Headlines |
| `color.text.body.dark` | `#E0E0E0` | Body |
| `color.text.secondary.dark` | `#999999` | Labels |
| `color.text.muted.dark` | `#777777` | Helper |
| `color.text.disabled.dark` | `#555555` | Disabled |

---

## Typography

Three families. The numeric family exists because macros, weights, and percentages need tabular alignment.

| Token | Family | Weight | iOS equivalent |
|---|---|---|---|
| `font.display` | Outfit | 600–700 | Custom font, bundled |
| `font.body` | Inter | 400–600 | Custom font, bundled |
| `font.numeric` | DM Sans | 500 | Custom font, bundled, tabular figures enabled |

### Scale

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `text.caption` | 12 | 16 | 0 | Labels, helper text |
| `text.body.sm` | 14 | 20 | 0 | Secondary body |
| `text.body` | 16 | 24 | 0 | Default body |
| `text.body.lg` | 18 | 26 | 0 | Emphasized body |
| `text.title.sm` | 20 | 26 | -0.2 | Section headers |
| `text.title` | 22 | 28 | -0.2 | Screen titles |
| `text.title.lg` | 28 | 34 | -0.4 | Verdict cards |
| `text.display` | 32 | 38 | -0.6 | Hero numerics, primary verdicts |

### Style mappings

- Verdict copy: `font.display` + `text.title.lg`, `color.text.primary`
- Macro numbers: `font.numeric` + `text.display`, `color.text.primary`
- Body: `font.body` + `text.body`, `color.text.body`
- Section labels: `font.body` uppercase + `text.caption`, `color.text.secondary`, tracking `+0.08em`

### Numerical conventions *(carried over)*

- Calories: `2,748` (comma thousands), unit appended below as a small label: `KCAL / DAY`
- Macros: `153g` — number + unit, no space; word label below
- Weights: `74.2 kg` (one decimal) or `180 lb` — match user locale
- Percentages: `22%` — no space
- Time inside the app status bar is the iOS native string (`9:41`)

---

## Spacing

Matches the marketing site's scale (`src/lib/design-tokens.ts`). One scale across web and iOS.

| Token | Value (pt) |
|---|---|
| `space.xs` | 4 |
| `space.sm` | 8 |
| `space.md` | 16 |
| `space.lg` | 24 |
| `space.xl` | 32 |
| `space.2xl` | 48 |
| `space.3xl` | 64 |
| `space.4xl` | 96 |

Default screen edge padding: `space.md` (16pt). Card internal padding: `space.lg` (24pt). Vertical rhythm between sections: `space.xl` (32pt).

---

## Radii

| Token | Value | Use |
|---|---|---|
| `radius.sm` | 6 | Inputs, small chips |
| `radius.md` | 12 | Cards, buttons |
| `radius.lg` | 20 | Sheets, prominent surfaces |
| `radius.xl` | 28 | Verdict card, hero |
| `radius.pill` | 999 | Tags, status pills |

---

## Elevation

On light surfaces, elevation is expressed with **soft, low-opacity shadows + a 1px hairline border** (`bg.border`). Never both a heavy shadow and a thick border — pick one. The `bg.elevated` inverted-row trick is a *different* device for emphasis, not elevation.

| Token | Definition (light) | Use |
|---|---|---|
| `elevation.0` | none | Flat surface on `bg.base` |
| `elevation.1` | `0 1px 2px rgba(15,17,23,.04), 0 1px 0 rgba(15,17,23,.02)` | Base cards |
| `elevation.2` | `0 4px 14px rgba(15,17,23,.06), 0 1px 2px rgba(15,17,23,.04)` | Raised cards, hovered chips |
| `elevation.3` | `0 12px 32px rgba(15,17,23,.08)` | Modals, popovers, sticky toasts |
| `elevation.cta` | `0 8px 24px rgba(0,210,120,.22), 0 2px 4px rgba(15,17,23,.10)` | Primary CTA — the green halo is intentional, telegraphs the brand accent |

Dark-variant shadows (opt-in) remain `rgba(0,0,0,.3 → .5)` as before; do not mix the two scales in one tree.

---

## Motion

| Token | Duration (ms) | Curve | Use |
|---|---|---|---|
| `motion.button` | 150 | `ease-out` | Tap feedback, hover |
| `motion.card` | 200 | `ease` | Card hover, expand |
| `motion.fade` | 400 | `ease-out` | Section enter |
| `motion.count` | 800 | `ease-out` | Numeric count-up |
| `motion.pulse` | 300 | `ease-in-out` | Attention pull |

Reduce-Motion-aware: when the system flag is on, durations collapse to 0 and crossfades replace transforms.

---

## Haptics

Haptics are a **feedback layer, not a celebration layer**. Fire one only to confirm an action the user took, mark a verdict change, or mark a snap point during scrubbing. Nothing else. No streak buzz, no entry buzz, no "you logged a meal!" pulse — FuelWell rewards with information, not vibration.

### Tokens

| Token | iOS API | Android equivalent | Use |
|---|---|---|---|
| `haptic.tap` | `UISelectionFeedbackGenerator` | `HapticFeedbackConstants.VIRTUAL_KEY` | Selection change inside a segmented control (Today / Last time), tab swap, picker scroll snap |
| `haptic.confirm` | `UIImpactFeedbackGenerator(.light)` | `HapticFeedbackConstants.CONFIRM` | Checkbox toggle, marking a set complete, dismissing a card |
| `haptic.commit` | `UIImpactFeedbackGenerator(.medium)` | `HapticFeedbackConstants.LONG_PRESS` | Logging a meal, starting a workout, committing a verdict choice |
| `haptic.scrub` | `UIImpactFeedbackGenerator(.soft)` | `HapticFeedbackConstants.CLOCK_TICK` | Each snap point while dragging a slider or day-scroll |
| `haptic.longPress` | `UIImpactFeedbackGenerator(.rigid)` | `HapticFeedbackConstants.LONG_PRESS` | Entering edit-mode on a logged row, opening a context menu |
| `haptic.verdict.positive` | `UINotificationFeedbackGenerator.success` | `HapticFeedbackConstants.CONFIRM` | Engine returns a new on-track verdict that resolves a user question |
| `haptic.verdict.caution` | `UINotificationFeedbackGenerator.warning` | `HapticFeedbackConstants.REJECT` | Engine flips to caution — approaching limit, off-target |
| `haptic.verdict.block` | `UINotificationFeedbackGenerator.error` | `HapticFeedbackConstants.REJECT` | Hard stop — over-limit reached, blocking sync error, action refused |

### Rules

- **One haptic per gesture.** Never chain. If a tap both confirms an action *and* changes a verdict, pick the verdict haptic — it's about the engine's response, which is the point.
- **Verdicts fire on *change*, not on render.** A re-render of an already-positive verdict gets no haptic. Drive from a verdict-id diff, not a `useEffect` over rendered output.
- **No haptic on screen entry.** Loading a screen is not an action.
- **No haptic on automatic animation.** The calorie count-up runs silently. So does the skeleton shimmer and any auto-advancing toast.
- **No haptic on every keystroke.** The number-pad uses the iOS default; never layer `haptic.tap` on top of it.
- **Toasts about other people are silent.** The Gmail-toast on the Core Dashboard fires no haptic; it's ambient information, not user-driven.
- **Respect System Haptics.** iOS suppresses haptics globally when the user disables System Haptics in Settings — the `Theme.Haptics` wrapper is a no-op in that case. Do not work around it.
- **Reduce-Motion does not affect haptics.** They are independent system flags; do not gate on Reduce-Motion.

### Anti-patterns

- ❌ `haptic.tap` on a tab item that's already active. Only fire when content actually changes.
- ❌ `haptic.commit` followed by `haptic.verdict.positive` on the same gesture. Chain = annoying. Pick one.
- ❌ Celebration loops on streaks, weekly summaries, milestones. FuelWell does not gamify; the haptic layer follows.
- ❌ Long, custom Core Haptics patterns (`CHHapticEngine` event sequences). Stick to the eight tokens above; reach for Core Haptics only with explicit design review.

---

## Components

The components below are the FuelWell vocabulary. Every screen is composed of these. The Component Gallery (Chapter 7) shows every variant of every component, snapshot-tested in CI.

### `ScreenScaffold` *(the standard screen template)*

The base every screen wraps. Four slots, all optional except `content`:

```
┌──────────────────────────────────┐
│ Header                           │  title • back • trailing action
├──────────────────────────────────┤
│ Verdict slot                     │  the "what should I do" answer
│ (sticky to top of content)       │
├──────────────────────────────────┤
│ Content (scrollable)             │
│                                  │
├──────────────────────────────────┤
│ Primary action (sticky bottom)   │  optional CTA
└──────────────────────────────────┘
```

**Decision-engine rule:** the verdict slot, when present, is *always* above the data. The data exists to support the verdict, not the other way around. A screen with data and no verdict is an exceptional case (e.g. raw history view), not the default.

### `Header`

Variants:
- **TitleOnly** — large title, no leading control. Top-level screens.
- **TitleWithBack** — large title + back chevron.
- **TitleWithActions** — large title + trailing icon button(s).
- **Compact** — collapsed during scroll, mirrors iOS native.

Uses `font.display` + `text.title`. Edge padding `space.md`.

### `VerdictCard`

The decision-engine surface. Always at the top of content when present.

Variants:
- **Positive** (`color.semantic.success` accent bar)
- **Caution** (`color.semantic.warning` accent bar)
- **Neutral** (no accent bar, `color.bg.elevated` surface)

Anatomy: optional eyebrow label (caption, secondary color), primary statement (`text.title.lg`, primary color), optional supporting line (body, secondary color), optional inline action.

### `DataRow`

Label + value pair. The macro tracking workhorse.

Variants:
- **Static** — label, value, no interaction
- **WithProgress** — adds a progress bar below
- **Tappable** — chevron, drills in
- **Editable** — value is a tappable token that opens an editor

Numeric values use `font.numeric` for tabular alignment.

### `Buttons`

| Variant | Background | Text |
|---|---|---|
| **Primary** | `gradient.brand` | `color.text.primary` |
| **Secondary** | `color.bg.elevated` | `color.text.primary` |
| **Ghost** | transparent | `color.text.body` |
| **Destructive** | `color.semantic.error` | `color.text.primary` |

All buttons: `radius.md`, height 48pt, `text.body.lg` weight 600, full-bleed when in `ScreenScaffold.primaryAction` slot.

### `EmptyState`

Three slots: optional illustration (generated via ChatGPT Images 2.0), title (`text.title.sm`), body (`text.body`, secondary color), optional CTA.

### `LoadingState`

Skeleton blocks at `color.bg.surface` with shimmer at `color.bg.elevated`. Never a spinner alone.

### `ErrorState`

Title (`text.title.sm`, `color.semantic.error`), body (`text.body`, `color.text.body`), recovery CTA (`Buttons.Primary` or `.Secondary`). Never a raw error code without a recovery path.

### `Tag` / `StatusPill`

`radius.pill`, `text.caption`, padding `space.xs` × `space.sm`. Uses semantic colors with 20% opacity backgrounds.

---

## Iconography

System: **SF Symbols only** (iOS native). No custom icon set — resolved May '26. SF Symbols' rounded caps and joins are the canonical look; any concept we can't express in SF Symbols gets a *typographic* treatment (label + numeric) rather than a bespoke glyph.

For non-iOS surfaces (web app, marketing site), **Lucide** is the parity set — picked from the matching SF Symbol where one exists, so cross-platform screens stay visually identical. Use Lucide at default weight; do not switch to a different icon family on the web.

When a concept lacks a clean SF Symbol match, the resolution order is:
1. Re-think the row — a tight label + a numeric value almost always reads better than a forced icon.
2. Use the closest semantic SF Symbol (e.g. `chart.bar.fill` for Macros) and let the *label* carry the specificity.
3. Only escalate to a custom mark with explicit design review. Default: don't.

---

## Imagery

Photographic / illustrative imagery is generated via **ChatGPT Images 2.0** with thinking mode. Sources for prompts:
- Empty states: descriptive of the missing data
- Onboarding heroes: warm, food-forward, no people's faces (privacy)
- App Store screenshots: device frames, multilingual text — thinking mode required

Imagery never carries information that isn't also in text.

---

## Accessibility

- All `color.text.*` × `color.bg.*` pairs meet WCAG AA contrast (4.5:1 for body, 3:1 for large text). The DESIGN.md WCAG linter (Chapter 15) enforces this in CI.
- Dynamic Type: every typographic token is paired with an iOS text style mapping so the user's system size scales the app.
- VoiceOver: every component in this document has a documented VoiceOver label pattern in its Swift implementation.
- Reduce Motion: handled in `motion.*` per the Motion section.

---

## How to use this document

1. **Claude Design.** Open Claude Design, attach this file, prompt with what you want to see. Claude Design will use these tokens verbatim.
2. **Claude Code.** Reference this file when implementing components: *"Implement `VerdictCard` per `DESIGN.md` § Components."*
3. **ChatGPT Images 2.0.** Paste the relevant tokens into prompts when you need brand-consistent illustrations.
4. **Drift detection.** The CI step `scripts/check-design-drift.sh` (added in Phase 1) compares the values here to the generated `Theme.swift`. Drift fails the build.

---

## Open questions

- [x] ~~Reconcile primary green: `#3D9B2F` (tokens) vs `#47E7B0` (logo).~~ Resolved May '26: `#47E7B0` is canonical.
- [x] ~~Light mode timing — Pilot is dark-only. When does light mode enter the plan?~~ Resolved May '26: apps are light-mode native; dark is opt-in.
- [x] ~~Custom icon set — needed for 7 features, or stay SF-Symbols-only at Pilot?~~ Resolved May '26: SF-Symbols-only. Lucide on web for parity.
- [x] ~~Haptics — this document doesn't yet specify a haptic vocabulary. Add before Phase 3.~~ Resolved May '26: see § Haptics.
