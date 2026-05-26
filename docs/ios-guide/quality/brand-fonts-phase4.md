# Phase 4 Brand Font Readiness

Scope: app-bundled typography for the FuelWell iOS design system

## Design Contract

`docs/ios-guide/DESIGN.md` defines three app font families:

| Token | Family | Role |
| --- | --- | --- |
| `font.display` | Outfit | Screen titles, verdict copy, prominent labels |
| `font.body` | Inter | Body text, captions, controls |
| `font.numeric` | DM Sans | Macro values, calories, weights, percentages |

Moonchild MCP is connected, but the current published `Fuelwell` design system does not yet contain token or component files. Until those files are published, `DESIGN.md` remains the local source of truth.

## Implementation

The iOS app now bundles the required variable font files under `ios/FuelWellApp/Resources/Fonts/` and registers them at launch through `FuelWellFontRegistry`.

Bundled families:

- Outfit variable
- Inter variable
- DM Sans variable

This removes the previous runtime ambiguity where SwiftUI referenced the brand family names but the app bundle did not contain the actual fonts.

## Guardrail

`DesignSystemTests.brandFontRegistryMatchesThemeFamilies` verifies that the registry manifest stays aligned with `Theme.app.font`.

If Moonchild later publishes concrete font/token exports, compare the published family names and weights against this file before changing the app.
