# Decisions — fuelwell-appstore-finalization

Opened 2026-08-10T03:50:02.326522+00:00

## 2026-08-10 public listing candidate

- Freeze `8f59d3c157d727ffb57d991ca8fcc70736511a87` as the runtime candidate. Keep the status and graph evidence in a follow-up documentation commit so deployments can continue to target the exact runtime SHA.
- Use `https://fuelwell-preview.vercel.app`, `/privacy`, and `/support` as the App Store listing destinations. The candidate gate must prove the two public information routes return HTTP 200 before acceptance.
- Do not describe the public Vercel alias as current: it still points to an older deployment and remains pending the approved live deployment step.
- The local `codex exec` verifier harness could not run because its configured model identifiers require a newer CLI. A fresh read-only multi-agent verifier independently reran the release checks and verified the code claim, while requiring this separate evidence commit before the candidate record is considered complete.
- Generate and retain the screenshot attestation secret only in `$HOME/.fuelwell/apple-testflight.env` with mode `0600`; never commit or print it. Use Homebrew Ruby with Bundler 2.6.9 for the capture lane because macOS system Ruby 2.6 cannot run that Bundler release.
- Freeze `1a09de1d750afa3da8645f6ad9068be38d452772` as the replacement runtime candidate after live App Store Connect inspection exposed a release-lane mismatch. App Store promotion must use an explicit, already-reviewed TestFlight build number and must not rebuild or upload a second binary. This final amendment also scopes readiness and unit assertions to the actual App Store upload, build-query, and reviewed-build helper blocks.
- Treat the live Apple `1.0` version record and July 16 build as historical state only. The candidate is version `1.4.0`; release preparation must create/select the matching `1.4.0` record after that exact build is processed and accepted in TestFlight.
- The independent verifier's `47/3/0` readiness count was produced without sourcing the private Apple environment; the operator run with `$HOME/.fuelwell/apple-testflight.env` sourced is `48/2/0`. Its code-gate feedback was accepted by explicitly testing unexpired status, manual submission, and the absence of build/upload calls in the App Store promotion lane.
