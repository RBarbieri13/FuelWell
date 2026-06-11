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
