# Persona swarm findings (4 agents x 2 personas, haiku-class)

Full JSON returned in agent transcripts; verdicts after skeptic reproduction:

ACCEPTED -> fixed (commit c64b2c1 and earlier):
- Dan: 'active burn'/'net room' jargon in daily-review overview -> plain language
- Dan: coach pills not parallel -> 'kcal left'/'protein left'
- Dan/score: health score lacked scale -> /100 added (earlier commit)
- Marcus: 'Details' text link without chevron on dashboard plate card -> chevron added
- Marisol: two unselected chip styles side-by-side on Log -> diet chips joined tinted family
- Priya: protein bar class bg-sky-500 not the macro token -> bg-macro-protein
- Elena: recipes search placeholder clipped at 320 -> shortened
- Sam: profile edit pencil 40px hit target -> 44px
- Jess (validation): bottom-nav active state now reads clearly (post-fix build)

REJECTED after reproduction (skeptic evidence):
- Elena sev-5 'grocery items do not render': items render (main scrollHeight 5234,
  food names + 5 toggles present). FullPage screenshots cannot expand the app's
  inner-scroll main (h-dvh overflow-hidden) — capture artifact, also explains
  'blank' settings captures.
- Marcus 'live workout has no set checkboxes': set toggles exist behind Begin
  (live-workout-session.tsx:282 toggleSet).
- Priya 'protein bars missing': bars render; audit query matched bg-macro-* only.
- Priya 'series chips lack color': swatch + check already encode state.
- Dan 'paperclip/send unlabeled': both carry aria-labels + title.
- Placeholder contrast, outline-offset, chip font-size/weight, segmented-control
  spacing, top-right reach: out of lane (documented) or deliberate convention.
