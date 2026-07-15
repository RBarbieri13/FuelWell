# Goal function — component-level detail refinement

Aspect: the detail, design, and structure of every individual component across every app
page: color shading, borders, size, detail, content, fit, and intuitiveness.

Scope guard (parallel campaigns): NO screen reordering, NO global type-scale or spacing
changes. Component-internal refinement only. Never touch ios/. Never weaken tests.

"Meaningfully improved" means, observably:

1. **Token discipline** — components use the declared palette (primary/accent/sky/lemon +
   shadcn vars). Raw hexes that duplicate a token value are replaced with the token class;
   off-palette hexes are eliminated or consciously documented.
2. **Border/radius/shadow consistency** — sibling components on the same page share border
   color, width, radius family, and shadow treatment; the shared Card/Button/Badge
   primitives define the reference treatment.
3. **Contrast** — body-size text inside components meets ~WCAG AA (4.5:1) or is flagged in
   the report; small labels below AA are raised where surgical.
4. **State completeness** — interactive components have visible hover/active/focus-visible/
   disabled treatments; empty states have purposeful copy and a next action.
5. **Affordance clarity** — everything that looks tappable navigates or acts; chevrons go
   somewhere; static elements don't masquerade as buttons; no dead affordances (repo rule).
6. **Internal fit at 320px** — no clipped/overflowing/misaligned content inside components
   at 320x844; `tests/mobile-component-clipping.spec.ts` stays green.
7. **Microcopy quality** — labels inside components are specific, units present (g, kcal,
   min), no vague filler.

Verification: before/after screenshots at 320/390/430 for all 22 routes
(surf-evidence/detail/), clipping spec green, and final gate: lint + tsc + unit tests +
full playwright suite green.
