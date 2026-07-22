# ui-final — Coach interface finalization

Date: 2026-07-22
Route: `/app/coach` (dev server `FUELWELL_PREVIEW_MODE=1 PORT=3100 pnpm dev`, anonymous preview session — same access path as baseline)
Viewports: desktop 1280x800, mobile 390x844 (iPhone 13 descriptor, DPR 3)
Baseline: `ui-baseline-defects.md` / `ui-baseline-raw.json` (2026-07-22, 0 blockers, 5 minors)

## Changed files

- `src/app/app/coach/page.tsx` — header quick links to 44px hit areas; empty-state
  marketing grid behind a "How Coach works and what it can do" disclosure
  (collapsed by default); bottom fade + pb-12 on the chat scroller in the empty
  state; demo app-icon constrained to a 64px media chip; capabilities grid hidden
  below `sm`, side card hidden below `xl`.
- `src/components/coach/artifacts/StreamingTextBubble.tsx` — markdown `a` gets
  `py-3.5` (inline vertical padding grows the tap target to >=44px without
  shifting line layout or breaking link wrapping).
- `src/components/layout/sidebar.tsx` — collapse toggle `h-10 w-10` → `h-11 w-11 shrink-0`.
- `src/app/globals.css` — new `.fw-chat-bottom-fade` mask utility.

Not touched (per node boundaries): `workout-tools.ts`, `goal-tools.ts`,
`workout-library.ts`, `system-prompt.ts`, `knowledge.ts`, `src/lib/coach/tools/`.
(Working tree also contains another session's in-flight act-fitness edits to
workout-tools/workout-library/turn-route/GroceryListCard — not mine, left alone.)

## Per-defect results (measured, `ui-final-raw.json`)

| # | Defect (baseline) | Before | After (measured) | Status |
|---|---|---|---|---|
| 1 | "Open nutrition detail" inline link touch target | 134 x 18 px | 133.7 x 46 px | Fixed |
| 2 | Last "Try asking" suggestion sliced mid-glyph under composer | hard clip, no fade | `mask-image: linear-gradient(#000 calc(100% - 40px), transparent)` active on the chat scroller; the one row crossing the scroller bottom now fades out (screenshots) instead of slicing | Fixed (fade/mask option from the defect's own "fixed looks like") |
| 3 | Desktop "Collapse menu" toggle | 38.5 x 40 px | 44 x 44 px | Fixed |
| 4 | Header quick links Attachments / Menu review / Dashboard | 82x20 / 82x20 / 69x20 | 82.4x44 / 81.9x44 / 69.1x44 (visual size unchanged, `inline-flex min-h-11 items-center`) | Fixed |
| 5 | Mobile empty state ~3,575px scroll + full-width "FW" placeholder tile | inner scroller scrollHeight 3575 | scrollHeight 1533 (57% cut; 2867 with the disclosure expanded — content kept, one tap away); demo image now a 64 x 64 icon chip | Fixed |

Defect 2 note: geometrically one suggestion row still intersects the scroller's
bottom edge at rest (content taller than the 390x844 visible area), but the mask
fades it out — no mid-glyph hard slice, matching the defect's prescribed fix.
Defect 5 note: disclosure keeps all marketing content reachable
(`mobileTourExpanded` probe: both sections render after one tap, overflowX 0).
The rich-response demo bubble stays visible at load because
`tests/coach-mobile-overflow.spec.ts` (release gate) asserts it.

## Blocker-list sweep (AGENTS.md pilot-UI)

- Framework overlays: none (screenshots).
- Blank screens: none; both viewports render fully.
- Console errors: **0 desktop, 0 mobile** (errors + warnings + pageerrors all 0).
- Clipped text: automated leaf scan 0 hits at both viewports.
- Touch targets: mobile small-target list is now ONLY the `sr-only` 1x1 file
  input (hidden pair of the visible 48px attach button — baseline-documented
  non-defect). Desktop residual: "Resize menu" 12x800 col-resize handle and
  "New chat" 75x32 `md:min-h-0` — both present in baseline and recorded there as
  intentional/non-defects; neither is worse.
- Focus/keyboard: input focus ring renders, `document.activeElement` = composer
  input (`focusedOk: true`), no layout shift.
- Horizontal overflow: `scrollWidth - innerWidth = 0` at both viewports,
  including with the input focused (`overflowFocused: 0`).
- Worse-than-baseline mobile: no metric regressed; empty-state scroll 3575→1533,
  same header/composer/nav layout otherwise.

## Rich artifacts with chat-process UI

`tests/coach-rich-inline.spec.ts` (desktop + iOS) re-run green against the final
code: all 6 artifact families mount in-transcript with the pagination/retry/
provider-notice code paths loaded, zero console errors, no overflow.
`tests/coach.spec.ts` deterministic tests green: 320–430px rich-content
containment (long-link wrap unaffected by the new link padding; attach/send
still 48x48) and the provider-failure → Try again recovery flow.

## Test output

- `pnpm exec playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts`
  → **4 passed, 12 skipped** (skips = live-model tests gated on
  `ANTHROPIC_API_KEY`, unset by design in this environment).
- `pnpm vitest run tests/unit` → **39 files, 329 tests passed**.
- `pnpm exec tsc --noEmit` → clean. `eslint` on all touched files → clean.

## Screenshot / evidence inventory (this directory)

- `ui-final-desktop.png` — desktop 1280x800, load state
- `ui-final-mobile.png` — mobile 390x844, load state
- `ui-final-mobile-bottom.png` — mobile, inner scroller at bottom (64px icon chip + fixed link visible)
- `ui-final-mobile-focused.png` — mobile, composer focused (green ring)
- `ui-final-raw.json` — console/pageerror capture + audit (overflowX, smallTargets, wide, clipped) + per-defect measurements at both viewports

## Not verified, and why

- `tests/coach-mobile-overflow.spec.ts` (release gate) not run: it hard-requires
  `FUELWELL_UI_TEST_EMAIL/PASSWORD` (unset locally). Its invariants were
  preserved by design: "Rich response support" section, the
  `FuelWell rich chat preview` image, table/nested-list/formula all still render
  visibly at mobile load.
- Live-model coach E2E (12 tests) skipped: `ANTHROPIC_API_KEY` unset; no paid
  calls permitted for this node anyway.
- iPad/tablet hardware touch behavior at `sm:`/`md:` widths inferred from
  measured 44px rects, not device-tested.
