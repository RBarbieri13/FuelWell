# ui-baseline — Coach interface audit (AUDIT ONLY)

Date: 2026-07-22
Route: `/app/coach` (dev server `pnpm dev`, port 3100, `FUELWELL_PREVIEW_MODE=1` anonymous preview session — same access path the smoke config comment describes; `tests/coach.spec.ts` navigates straight to `/app/coach` with no login)
Viewports: desktop 1280x800, mobile 390x844 (iPhone 13 UA, DPR 3)

## Evidence files (this directory)

- `ui-baseline-desktop.png` — desktop 1280x800, load state
- `ui-baseline-mobile.png` — mobile 390x844, load state
- `ui-baseline-mobile-bottom.png` — mobile, inner `main` scroller scrolled to bottom
- `ui-baseline-mobile-focused.png` — mobile, chat input focused (focus ring visible)
- `ui-baseline-raw.json` — console capture + automated audit (overflow, touch targets, clipped text)
- `ui-baseline-scroll-probe.json` — scroll-container / table-wrapper / element-rect probe

## Headline result

The page renders correctly at both viewports. **Console errors on load: 0 desktop, 0 mobile** (also 0 warnings, 0 pageerrors — see `ui-baseline-raw.json`). No framework overlay, no blank screen, no document-level horizontal overflow (`scrollWidth - innerWidth = 0` at both viewports, including with the input focused). The wide demo table (`min-w-[32rem]`) scrolls inside its own `fw-rich-scroll overflow-x-auto` wrapper (probe: `scrollW 512 / clientW 264`, canScroll true) — compliant with the "wide content scrolls in its own container" rule. Focus behavior verified: clicking the "Message Coach" input focuses it (`document.activeElement` = the input) and paints a clear green focus ring with no layout shift. Send button is 48x48, attach button 48x48, input 48px tall — all >= 44px. Current mobile layout is substantially richer than `docs/ui-loop/baseline/app-coach--mobile.png` and not worse in any measured dimension; **no blockers found**.

## Defects

### 1. [minor] Mobile — inline "Open nutrition detail" link touch target 134x18px
- Viewport: 390x844
- Element: `a[href="/app/nutrition"]` with classes `break-words font-black text-primary-700 underline ...`, inside the "Inline artifacts" demo card
- Screenshot: `ui-baseline-mobile-bottom.png` (link visible under the FW artifact preview)
- 18px tall is well under the 44px target minimum. It is an inline text link (WCAG 2.5.8 inline exception arguably applies), but it is the primary action of that artifact card.
- Fixed looks like: link rendered as a >= 44px-tall tappable row (e.g. `inline-flex min-h-11 items-center`) or padded hit area, without changing visual weight.

### 2. [minor] Mobile — last "Try asking" suggestion clips mid-glyph under the floating composer
- Viewport: 390x844
- Element: suggestion button "Analyze a menu or food photo" (rect y 666–714) vs composer bar (y 704–752); "Plan a workout for today" (y 722–770) is fully hidden at rest.
- Screenshots: `ui-baseline-mobile.png`, `ui-baseline-mobile-focused.png` — text is cut horizontally at the composer's top edge with no fade/mask.
- Content IS reachable (inner `main` scroller, `scrollHeight 3575 / clientHeight 537`; scroll-to-bottom clears the composer — see `ui-baseline-mobile-bottom.png`), so this is cosmetic, not lost content. But at load it reads as broken clipping.
- Fixed looks like: bottom fade/mask on the scroll container or extra `scroll-padding-bottom`/spacer so a suggestion row is never sliced mid-glyph at rest.

### 3. [minor] Desktop — sidebar "Collapse menu" toggle 38.5x40px
- Viewport: 1280x800
- Element: `button[aria-label="Collapse menu"]`, classes `h-10 w-10 ... rounded-full`
- Screenshot: `ui-baseline-desktop.png` (top-left, next to the FuelWell logo)
- Desktop pointer input, so low impact, but it is the only control on the page under 44px in both dimensions and iPads at >= sm widths get this layout with touch.
- Fixed looks like: `h-11 w-11` (44px).

### 4. [minor] Desktop/tablet — header quick links "Attachments", "Menu review", "Dashboard" are 20px-tall text links
- Viewport: 1280x800 (elements are `hidden ... sm:inline`, so they also appear on touch tablets from 640px up)
- Elements: `a` 82x20 / 82x20 / 69x20 in the Coach page header (top-right)
- Screenshot: `ui-baseline-desktop.png`
- Fixed looks like: links rendered as `inline-flex min-h-11 items-center` hit areas (visual size can stay identical).

### 5. [minor] Mobile — empty-state Coach page is ~3,575px of static marketing content with a placeholder-looking artifact image
- Viewport: 390x844
- Element: the pre-chat landing sections ("How a chat plays out", "What it can do", "Inline artifacts stay in the conversation") including a large dark "FW" placeholder image block
- Screenshot: `ui-baseline-mobile-bottom.png` (FW block cropped at top of shot)
- Roughly 6.5 screens of scroll before the end of the empty state; the giant "FW" tile reads as an unfinished placeholder asset rather than product UI. Baseline (`docs/ui-loop/baseline/app-coach--mobile.png`) showed the chat surface immediately.
- Fixed looks like: shorter empty state (hero + suggestions), or the demo/marketing sections collapsed behind a disclosure; the FW tile replaced with a real artifact preview.

### Observations, not defects
- Desktop "New chat" pill measures 75x32 but carries `min-h-11 ... md:min-h-0` — the 44px minimum is deliberately relaxed at md+ (pointer input); on mobile it measures >= 44px. Intentional.
- The `sr-only` 1x1 file input flagged by the automated pass is the hidden pair of the visible 48px attach button. Not a defect.
- Automated clipped-text scan (scrollWidth > clientWidth on leaf text nodes): 0 hits at both viewports.

## Totals

- Blocker: 0
- Major: 0
- Minor: 5

Console errors on load: **0** (desktop and mobile; error + warning capture in `ui-baseline-raw.json`).
