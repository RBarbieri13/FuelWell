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
