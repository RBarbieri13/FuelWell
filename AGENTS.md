<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# App versioning

- **v1.3** is the current shipped release (food logging core, recipes, workouts,
  progress, coach logging, auth/onboarding, settings; Health Score de-emphasized).
- **v1.4** is the next release — all changes shipped from here onward belong to 1.4.
- The version has **one source of truth: the `version` field in `package.json`**.
  The in-app Settings → About → Version reads it directly. To cut 1.4, bump
  `package.json` to `1.4.0` (no other file needs editing for the displayed version).

# Pilot UI polish workflow

- For broad UI polish passes, run the pilot router first and use the printed
  Codex-equivalent plan as the verification loop.
- Before committing UI changes, run lint/build plus rendered screenshot QA for
  desktop and iOS-sized viewports on the affected app routes.
- Treat visible framework overlays, blank screens, console errors, clipped text,
  unusable touch targets, broken focus/keyboard behavior, or worse mobile layout
  than baseline as blockers.
- Prefer existing FuelWell component shapes, Tailwind theme tokens, and local
  color roles over new one-off visual values.

## Public marketing design contract

- Scope public-site styling to `src/app/(marketing)` and `.fw-legacy-marketing`;
  do not let it change `/preview` or `/app/*`.
- Use Inter for body text and controls, Outfit for headings, and the existing
  FuelWell marketing tokens for color, spacing, borders, radii, and shadows.
- Prefer shared `fw-marketing-*` patterns and shared button/card components over
  one-off font, radius, border, or shadow values.
- Verify every public route at desktop and narrow iPhone widths before release,
  including no horizontal overflow and visible keyboard focus.

# Coach engine Definition of Done

- Coach must be a personalized health, nutrition, fitness, and
  body-composition engine, not generic chat. It must retrieve user-specific
  profile, history, goals, meals, workouts, preferences, app activity, and
  coach memory before answering.
- Per-user coach knowledge must be isolated by authenticated `user_id`; preview
  data may use the sample preview user only and must not be presented as
  production persistence.
- Coach actions that change app state must flow through explicit tool/action
  paths, be audit logged, and require confirmation for destructive or
  high-impact edits.
- Health boundaries are mandatory: no diagnosis, no emergency guidance, no
  invented medical facts, and recommend professional care for medical concerns.
- Seed data gates: ingredient count >= 500, recipe count >= 150, workout count
  >= 100. Ingredient, recipe, and workout search must support fast useful
  autocomplete plus closest-match behavior for partials, case differences,
  aliases, and minor typos where feasible.
- Before claiming completion, run a verifier that checks seed counts, search
  behavior, user isolation, materially different coach context for different
  profiles, safe coach actions for meals/groceries/workouts/plans, lint, tests,
  typecheck/build, and that no mock-only route is claimed as finished product.
- Do not production deploy, open PRs, schedule jobs, use paid API calls beyond
  normal dev testing, send external messages, or change live user data without
  explicit user confirmation.
