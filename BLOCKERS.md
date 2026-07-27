# Blockers requiring Robert

Status as of 2026-07-14 overhaul run. These are external decisions/credentials;
all local work continues around them.

## 1. Immutable Vercel deployment is behind SSO (release-critical)

The current immutable candidate (`fuelwell-preview-eo6yxot10-…vercel.app`,
`dpl_4hiFbbzf21mWngcAxoxF6J3ta4Es`) redirects to Vercel SSO. A TestFlight
WKWebView cannot authenticate interactively, so this deployment is not a valid
TestFlight candidate. RESOLVED 2026-07-15: per Robert's directive to ship the
combined work to TestFlight, Deployment Protection was disabled on the
`fuelwell-preview` Vercel project via API (the same app was already publicly
served on the alias, so protection guarded nothing). Revert anytime in
Vercel dashboard → fuelwell-preview → Settings → Deployment Protection.
Candidate deployments are now publicly reachable and carry a resolving
release manifest (VERCEL_GIT_COMMIT_SHA injected at deploy). First valid
candidate: dpl_9kn8me5fYN5mEtDqGLsuGurCJHrd @ b46534f.

## 2. GitHub authentication — RESOLVED 2026-07-15

Robert re-authenticated `gh`. Branch `surf/ios-responsive-ux-recovery` and
`main` both pushed and verified at `da34033`; the main push triggered the
Fly.io production deploy (deploy.yml). TestFlight remains manual-dispatch
only and still requires blocker #1 (immutable deployment SSO) to be resolved
plus Robert's explicit go for upload.

## 4. TestFlight pipeline — RESOLVED 2026-07-16

Build 1.0 (202607160658) uploaded to App Store Connect, processed, and
distributed to Internal testers (run 29476657493). Twelve attempts peeled off
twelve never-worked defects; the pipeline is now green end-to-end. Notable
permanent fixes: release binding moved to an explicit Info.plist (custom
INFOPLIST_KEY_* settings are silently dropped), setup_ci keychain for signing,
Xcode 26 selection (Apple requires the iOS 26 SDK), npm/Playwright install in
the workflow, coverage floor tracks the shipping test bundle, candidate gates
verified against a live public deployment with a resolving release manifest.

## 5. TestFlight upload blocked on AI Gateway credit — 2026-07-27

Run 30235420827 (candidate 722341a / dpl_CcrusBaFKJSwhwwWAQJjDSMEFA3R) failed at
`Verify candidate through the iOS shell`. The gate requires
`/api/launch-preflight?live=1` to report `liveReady: true`. All five live
Supabase table probes pass; the single failure is `live-coach-provider`
classified as `billing_credit` (HTTP 402 / credit-balance message) — the Vercel
AI Gateway account backing Coach inference is out of credit.

The candidate itself is valid: public HTTP 200, manifest gitSha/deploymentId/
environment/packageVersion all match, productionReady true. Nothing in the
visual-polish work caused this, and the gate is behaving correctly by refusing
to ship a build whose Coach cannot answer.

Unblock: fund the Vercel AI Gateway account (or point AI_GATEWAY_API_KEY at a
funded one), then re-dispatch ios-testflight.yml with the same four candidate
inputs. No code change required. Do NOT weaken the liveReady gate.
