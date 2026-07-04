# Goal function — "meaningfully improved" for the UI-polish aspect

FuelWell's existing UI (layouts, navigation, routes, page architecture **unchanged**) is
meaningfully improved when a skeptical pre-launch reviewer walking /preview → the full app
on desktop and iPhone viewports finds:

1. **No broken or dishonest states**: zero console errors on the core walk; no 500s in
   preview mode; loading states that resolve; no layout shift on skeleton→content swap.
2. **Consistency**: one spacing/typography/radius/shadow rhythm per surface; icons and
   colors used with one meaning; dates/numbers formatted humanely and with correct units.
3. **States everywhere**: every interactive element has visible hover/focus-visible/
   active/disabled treatment; every async surface has loading + empty + error + success
   feedback; destructive actions confirm.
4. **Access**: keyboard-only completion of core jobs (log a meal, read dashboard, ask
   coach, edit settings); focus rings visible; icon-only controls labeled; touch targets
   ≥44px; `prefers-reduced-motion` respected.
5. **Robustness**: long names, zero items, huge numbers, and missing images degrade
   gracefully.

## Observable success criteria (checked at each phase boundary)
- `npm run build` exits 0; `npm run lint` exits 0; `npm run test:unit` exits 0.
- Playwright walk of all 26 routes at 1440×900 and 390×844: all 200, no horizontal
  scroll, zero console errors.
- `prefers-reduced-motion: reduce` emulation shows no running animations on dashboard/log.
- Keyboard-only script can tab to and activate: sidebar nav, log-meal search + submit,
  a primary CTA on each core page, with a visible focus indicator (computed outline/ring).
- Dashboard macros row shows correct units (kcal vs g); greeting matches actual local time.
- Phase 6 fresh-eyes swarm: no backlog item flagged unresolved by ≥3 of 10 reviewers.

## Out of scope
Layout/nav/route/architecture changes; new features; backend/schema changes beyond
preview-mode guards; dependency upgrades; deploys/pushes.
