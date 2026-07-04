# Surf backlog — FuelWell UI polish (ui-polish-refine)

Goal function: see `goal.md` — a skeptical pre-launch reviewer walking /preview → the full
app on desktop + iPhone viewports finds no broken/dishonest states, one visual rhythm,
states everywhere, keyboard/AT access, and graceful degradation with awkward data — with
layouts, navigation, routes, and page architecture unchanged.

Swarm: 20 agents × 4 personas → 368 evidence-backed findings → 70 clusters →
8 consensus clusters (≥8/20 agents) → 6 REPRODUCED by adversarial skeptics.

## Official backlog (reproduced, ranked by agents × max severity)

| id | cluster | agents | max sev | verdict | acceptance check | status |
|----|---------|--------|---------|---------|------------------|--------|
| B1 | C01 Undersized touch targets on mobile (/app/log pills 28px, header icons 32px, choose-food 40px, /app/fitness links) | 19/20 | 5 | REPRODUCED | At 390×844: meal/view filter pills, mobile-header icon buttons, choose-food buttons, and fitness action links all have ≥44px effective hit area (measured incl. padding via elementFromPoint probes); sub-44px visible interactive elements on /app/log drop from 81 to ≤15 with none of the named controls remaining | done (check passed: log 81→1, fitness 0, dashboard 0 sub-44; all named controls 44px) |
| B2 | C03 No inline validation layer (no aria-invalid/error text anywhere; silent disabled buttons; 999999 g portion → "1,649,998 kcal" day with success toast) | 9/20 | 5 | REPRODUCED (signup native-bubble claim qualified) | Playwright: (a) /signup invalid email → aria-invalid=true + role=alert error text; (b) custom-meal empty submit → visible error, not silent no-op; (c) portion input caps at sane max — 999999 g rejected with error message; (d) onboarding gated steps explain why Next is disabled; (e) /app/progress weight input rejects non-numeric with feedback | done (check passed: signup aria-invalid+alerts, custom-meal alerts, 999,999 g rejected, onboarding hints, weight input errors) |
| B3 | C04 Focus ring too low-contrast (50%-alpha green: 2.43:1 on white, 1.92:1 on dark /preview) | 11/20 | 4 | REPRODUCED (only "too subtle" half; "missing" half refuted) | Computed :focus-visible indicator on keyboard focus measures ≥3:1 contrast against both white app surfaces and the dark /preview background (two-tone outline+shadow); verified by script reading activeElement styles on both surfaces | done (check passed: rendered focus outline #117558 ~5.7:1 on light, white ~19:1 on dark preview) |
| B4 | C05 Unit/format chaos (cal vs kcal vs calories on same page; "Xg" vs "X g"; inconsistent thousands separators) | 8/20 | 5 | REPRODUCED (camelCase "30gCarb" artifact refuted) | Shared formatter adopted; script scan of dashboard/nutrition/log/daily-review/recipes/progress page text finds: zero standalone "cal" unit tokens (kcal everywhere), gram values in one spacing style, all numbers ≥1,000 carry separators | done (check passed: 6-route scan — zero bare cal, zero unseparated ≥1,000, one gram style) |
| B5 | C06 No route-transition loading state (only dashboard has loading.tsx; slow-3G nav shows nothing for ~1.6 s) | 9/20 | 4 | REPRODUCED (blank-recipes and search-spinner claims refuted — data is SSR/local) | loading.tsx exists for every main /app route with skeletons matching each page's layout; throttled navigation dashboard→progress shows a pending skeleton instead of frozen old page | done (check passed: 15 loading.tsx present; skeleton visible in slow-3G dashboard→progress nav) |
| B6 | C09 Spacing rhythm drift (two near-identical filter-chip groups on /app/log differ in padding/font/height; section gaps 28/24/16 across pages; 10 unique button paddings on /app/log) | 8/20 | 4 | REPRODUCED (negative-gap "overlap" claim refuted as nesting artifact) | The two /app/log chip groups share identical computed padding/height/font; sibling section gaps uniform within each scanned page and equal across dashboard/nutrition/daily-review; unique visible button-padding values on /app/log reduced to ≤5 | done (check passed: chip groups identical 34px/6px-14px/14px-600; page stacks unified space-y-6; /app/log unique button paddings 8→5) |

## Rejected clusters (killed by skeptics)

| cluster | agents | verdict | skeptic's reason |
|---------|--------|---------|------------------|
| C02 Mobile sidebar renders 0×0 (invisible but in DOM) | 9/20 | NOT_REPRODUCED | getBoundingClientRect artifact: sidebar subtree is display:none on mobile — not rendered, not tabbable (40-Tab probe: zero 0×0 tab stops), absent from the accessibility tree; visible bottom nav exists. Reviewers read raw DOM rects without checking computed display/focusability. |
| C08 Icon-only buttons missing accessible names | 8/20 | NOT_REPRODUCED | Every cited control has an aria-label (several findings quote the very label they claim is missing); bottom-nav icons have visible 11px text labels. Residual nit recorded for Phase 7: /app/daily-review expanders named generically ("Expand"/"Hide"). |

## Below-threshold clusters (recorded, not worked; top 15 of 62 by score)

| cluster | agents | max sev |
|---------|--------|---------|
| C07 Inputs lack programmatic/visible labels (settings, progress weight) | 7 | 5 |
| C10 Shaming/clinical tone in progress/recovery/target copy | 6 | 5 |
| C11 Missing/unhelpful empty states | 7 | 4 |
| C12 No success confirmation after actions | 7 | 4 |
| C13 Layout breaks at zoom / large accessibility text | 7 | 4 |
| C14 WCAG contrast failures (brand text, key numbers) | 5 | 5 |
| C15 Undefined decimal precision for macros/weight | 5 | 5 |
| C16 /preview hub lacks hierarchy/labels | 5 | 5 |
| C17 Disabled buttons never explain why | 6 | 4 |
| C18 Charts lack axis labels/legends/units | 7 | 3 |
| C19 prefers-reduced-motion not respected (addressed in Phase 2 commit 9cb9ada; agents tested pre-fix or via code-grep — re-check in Phase 6) | 4 | 5 |
| C20 Color-only encoding (rings/charts/tabs) | 4 | 5 |
| C21 No dark mode / prefers-color-scheme ignored | 5 | 4 |
| C22 Design-token drift (radii, colors, dimensions) | 5 | 4 |
| C23 Text/input overflow with long values | 5 | 4 |

Full cluster list with member finding ids: `findings/clusters.json`. Skeptic evidence:
`findings/skeptic-verdicts.json`.

## Phase 6 remediation (fresh-eyes ≥3/10 + skeptic)

| id | item | fresh-eyes votes | skeptic verdict | acceptance check | status |
|----|------|------------------|-----------------|------------------|--------|
| R1 | B1 residual: sub-44px controls on routes outside original fix scope (progress day/window/macro filters 36px, coach New chat 32px, settings segmented toggles + intake chips 32-36px, daily-review selectors/collapse/edit links 32-42px, recipes meal filters 36px) | 6/10 on B1 | REPRODUCED | All named controls ≥44px tall at 390×844 on the 5 routes | done (check passed: 5/5 routes PASS) |
| R2 | B4 residual: bare "Cal" stat labels (5 component sources incl. 612 renders on /app/recipes) + unseparated numbers on /app/meal-plan (1641, 1730) | 3/10 on B4 | REPRODUCED (reviewers' "7551"/"2550" examples not found; "1,400 calories" prose ruled acceptable) | 13-route text-node scan: zero bare Cal/cal unit tokens, zero unseparated ≥1,000 | done (check passed: 13/13 routes PASS) |
| R3 | B5 claim: skeletons missing during slow navigations | 6/10 on B5 | NOT_REPRODUCED — client-side transitions under 400ms/50kBps throttle showed the 5-element PageSkeleton for 400-1100ms on both tested navs; reviewers had tested full document loads, which loading.tsx does not cover; no blank states found there either | n/a | rejected (no change needed) |
