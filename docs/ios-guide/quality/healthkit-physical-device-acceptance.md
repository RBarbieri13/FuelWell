# HealthKit Physical-Device Acceptance

Updated: 2026-05-31

## Purpose

Simulator testing proves the W6 navigation path, HealthKit fallback copy, and UI regressions. It does not prove live HealthKit authorization or real sample ingestion. Before TestFlight, FuelWell needs one physical-device acceptance pass attached to the release evidence.

## In-App Path

Open `Menu` -> `Permissions` -> `HealthKit acceptance`.

The page is intentionally visible in the app so Robert, Max, and testers can distinguish between:

- navigation/UI readiness, which can pass in Simulator;
- live data acceptance, which requires an iPhone;
- denied-state fallback, which must remain usable when Health access is off.

## Acceptance Checklist

| Gate | Expected Evidence | Status |
| --- | --- | --- |
| Health permission prompt | Screenshot or screen recording from a physical iPhone showing requested categories. | Pending device pass |
| Live metrics | Dashboard, Activity, and Progress reflect HealthKit-backed steps, active energy, workouts, body mass, or sleep. | Pending device pass |
| Denied-state fallback | Health access disabled, app still supports manual meals/progress flows and shows non-blocking copy. | Pending device pass |
| Release notes | Device model, iOS version, build number, and tester initials recorded in release evidence. | Pending device pass |

## W6 Closeout Position

W6 may close with this checklist surfaced and UI-tested. TestFlight readiness still requires the physical-device evidence rows above to be filled in by the release candidate pass.
