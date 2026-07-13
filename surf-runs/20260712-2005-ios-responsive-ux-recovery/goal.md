# Goal Function

FuelWell mobile UX is meaningfully improved only when all of the following are true:

1. Every primary route at 320, 375, 390, and 430px has `document.scrollWidth <= viewport width` and no primary app pane exceeds its client width.
2. Text, headings, inputs, cards, controls, and ordinary media remain fully visible. Only explicitly identified tables, charts, code, and formulas may scroll inside a contained region with a visible affordance.
3. Daily Review uses one clear control per expandable section. Collapsing the energy ledger hides Latest-range navigation and chart content. Intake and output have understandable, full-width controls.
4. Browse Workout Library takes the user directly to an open, focused library. Mobile filters are dropdowns. Results are capped at 20 per page with explicit previous/next controls and a page count. Hidden columns are disclosed.
5. Pick My Own and Activity are compact, side-by-side paths where space permits and stack cleanly on the smallest phone.
6. Groceries provides a phone-native row/card representation with usable quantity and edit actions and no 980px primary layout.
7. Three consecutive new-user and existing-user journeys complete without clipped UI, lost profile/meals/workouts/groceries, cross-page mismatch, or inaccurate Coach component values.
8. Unit, lint, TypeScript, production build, responsive Playwright, and iOS release-binding gates pass.

Verifier output is PASS/FAIL with reasons. Any failure becomes the next implementation input. A full review round with no net-new high-value changes is the convergence condition.

