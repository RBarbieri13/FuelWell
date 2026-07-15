# Inventory — component detail campaign (base 8feac69)

Full route→component map and findings produced by exploration agent 2026-07-14.
Baselines: surf-evidence/detail/before/*.png (66 shots: 22 routes x 320/390/430).

## Fix-once components
- ui/card (13+ routes), ui/button (10+), ui/badge, ui/input, ui/empty-state
- detail-surfaces.tsx renders daily-review + nutrition + fitness (3 routes, 1 file)
- layout: sidebar, mobile-nav, mobile-header (all routes)
- Duplicated patterns without a primitive: stat tiles (5 impls), rings (3), chips (4), bars (3)

## Consensus findings (from static audit)
1. Border grey sprawl: border-primary-100 (188x), neutral-200 (49x), #dce8e3 (21x),
   #e6efeb (20x), + 5 more; workouts-view mixes #e6efeb outer / #dce8e3 inner on one screen.
2. Radius sprawl: 24px/22px/20px/2rem/1.5/1.45/1.35/1.25rem on peer cards; tokens unused.
3. Teal gradient endpoint spelled 5 ways: #159aa2 #138893 #1592a0 #159aa0 #19a4ad.
4. Token-duplicate hexes: #7a650d (badge), #f2f7f5 (recipes), #d8e7e1, #1eae84/#c7a91e/#f0795b
   (charts/rings), #d6f0e8 (ring track), #123d32 (skeleton).
5. Off-palette one-offs: #f97316 orange in InflowsOutflowsRing ("Out" should be accent),
   #3e98cf in totals-summary (protein; sky-500 is #3e92c9), #f5f5f5 ring track.
6. Contrast: .fw-muted #78928a (~3.6:1) used 85x for meaningful text; artifact-scope remap
   also #78928a; neutral-400 at 10-11px in coach artifacts + dashboard/activity/recovery labels;
   mobile-nav + sidebar inactive items neutral-400.
7. Focus: 52/54 raw-button files rely on global outline; food-search.tsx:89 +
   custom-meal-form.tsx:150 use focus:outline-none WITHOUT replacement ring on some elements;
   input focus ring color/width varies (primary-200 vs primary-500).
8. Affordance ambiguity: static tiles styled like tappable rows in dashboard-client (contributors),
   activity (load rows), recovery (item rows vs Link rows share visual language).
9. Units: EnergyStat/MiniStat/StatTile render bare numbers in places; RecipeListCard mixes
   "kcal"/"g protein /serving" formatting.
10. mobile-nav: Log item has highlight:true so it renders accent-colored even when inactive —
    reads as "current tab" from every screen; Coach and Move share sky-600 active color.

## Guardrails
- tests/mobile-component-clipping.spec.ts + mobile-route-containment.spec.ts (widths 320-430)
  assert no overflow/clip; signup preview disclosure <=12% viewport height, CTA in first viewport.
- Preview data: preview-session.ts sample fixtures on localhost; onboarding overrides via
  preview-onboarding.ts localStorage — keep name/goal/target displays reading through it.
- Sibling campaigns own screen layout and sizing/type-scale: do not reorder screens or
  change global type scale. Component-internal only.
