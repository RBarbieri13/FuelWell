# Contested Choices — Reconciliation Essays

For each decision in the Reconciliation Matrix rated Medium or Low confidence. These are the calls most likely to bite later if gotten wrong.

Only one row in the matrix landed at Medium confidence: **Feature flags**. Everything else was High. Rather than inflate the list, here is the single essay that matters — this is genuinely the decision most likely to bite a solo builder shipping AI-generated content.

## Feature Flags — Reconciliation Essay

**What the reports argue.** Coverage is thin and uneven, which is itself the problem. R2 (*FuelWell Pipeline*) treats feature flags as a bundled PostHog capability and also name-drops LaunchDarkly as a production kill-switch mechanism for "critical bugs." R5 (*compass_artifact*) lists PostHog's included flags as a leaning-consensus pick for solo devs, emphasizing the all-in-one appeal. R1, R3, and R4 don't meaningfully address flags at all — they're focused on architecture and tooling, not runtime control planes. The *Top 10 Disagreements* synthesis doesn't surface this as a contested decision, which is misleading: the reports aren't agreeing, they're mostly silent.

**Why they disagree (or don't).** The real split isn't PostHog vs LaunchDarkly — it's between treating flags as a *product-experiment* tool (PostHog's framing) versus a *safety/reliability* tool (R2's LaunchDarkly kill-switch framing). These are different jobs. Product flags tolerate eventual consistency, SDK dependencies, and vendor downtime. Kill-switches cannot — if Anthropic returns an unsafe meal plan and your flag service is rate-limited or down, you ship the bug.

**The tradeoff for your context.** You're a solo builder shipping AI-generated nutrition and workout content. That's a category where *a single bad output can become a TestFlight-rejection or a press incident.* You need two capabilities with different reliability profiles, and no single vendor cleanly serves both without either overpaying or overtrusting.

**What to do.** Use **PostHog for product flags and experiments** — it's already in your analytics stack, zero marginal cost, fine for gradual rollouts and A/B tests. Separately, build a **hand-rolled kill-switch**: a single `feature_flags` row in Supabase, fetched on launch with a 30-second cache, enforced server-side inside your Edge Functions (not just client-read). This way, if PostHog is down or an AI response looks suspect, you can disable the feature from a SQL console in 10 seconds without shipping a build. Two tools, two failure domains, both cheap.
