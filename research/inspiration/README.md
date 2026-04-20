# Inspiration Library — quick start for Max

This folder holds the real-world reference material we're using to brief the app-building agent on how FuelWell should look, feel, and behave.

## The one file that matters

**`INSPIRATION_TEMPLATE.md`** — open it and fill in the blanks. Everything you put in there becomes part of the brief handed to the agent. A starter shortlist of apps is at the bottom (§6) if you don't know where to begin.

## Where to put screenshots

Save images under `public/inspiration/<app-slug>/` (e.g., `public/inspiration/oura/01-home.png`). That way we can reference them from any markdown file in the repo with a clean relative path, and they're servable by the Next app during design reviews.

On mobile: screenshot → AirDrop / share → into the repo via GitHub mobile or claude.ai/code → Claude drops it into the right folder.

## Companion research

While you're filling this out, Claude is running parallel deep-research reports — those land in `research/reports/`. Max's gut opinions in this template plus the reports together form the full brief.

## When you're done

Tell the agent: *"Read `research/inspiration/INSPIRATION_TEMPLATE.md` and the reports in `research/reports/` and use them as the product/design brief."*
