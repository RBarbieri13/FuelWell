# Decisions — fuelwell-appstore-finalization

Opened 2026-08-10T03:50:02.326522+00:00

## 2026-08-10 public listing candidate

- Freeze `8f59d3c157d727ffb57d991ca8fcc70736511a87` as the runtime candidate. Keep the status and graph evidence in a follow-up documentation commit so deployments can continue to target the exact runtime SHA.
- Use `https://fuelwell-preview.vercel.app`, `/privacy`, and `/support` as the App Store listing destinations. The candidate gate must prove the two public information routes return HTTP 200 before acceptance.
- Do not describe the public Vercel alias as current: it still points to an older deployment and remains pending the approved live deployment step.
- The local `codex exec` verifier harness could not run because its configured model identifiers require a newer CLI. A fresh read-only multi-agent verifier independently reran the release checks and verified the code claim, while requiring this separate evidence commit before the candidate record is considered complete.
