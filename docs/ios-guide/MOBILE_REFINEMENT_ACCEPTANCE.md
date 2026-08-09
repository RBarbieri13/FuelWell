# FuelWell iPhone Refinement Acceptance

This pass treats the shipping iOS product as the SwiftUI release shell plus the responsive web app loaded by `WKWebView`. A candidate is acceptable only when both layers satisfy the checks below.

## Layout and navigation

- All primary routes render at 320, 375, 390, and 430 points without document-level horizontal overflow.
- Primary text, metrics, cards, controls, and navigation labels remain fully readable without clipping or unintended truncation.
- Dense tables and formulas may scroll inside a clearly contained region; the page itself may not scroll horizontally.
- Compact layouts use progressive disclosure instead of desktop dashboard density.
- The bottom navigation preserves a minimum 44-point target per destination and identifies the current route without relying on color alone.
- Links, sheets, back gestures, and external URL handling remain functional in the shipping `WKWebView` shell.

## Inputs and state

- Coach, meal logging, authentication, onboarding, grocery editing, and workout inputs remain visible when focused in a compact keyboard viewport.
- Attachment and send controls stay fixed-size while the Coach composer flexes between them without clipping.
- Loading, unavailable, error, retry, empty, and saved states are distinguishable and use calm, actionable copy.
- No refinement may change user data, release binding, persistence behavior, or business rules.

## Accessibility

- Interactive controls have meaningful labels and at least a 44-point target.
- Screen-reader order follows the visual task order, and decorative imagery is hidden from accessibility.
- Brand type and color come from the existing FuelWell design systems.
- Layout tolerates larger text without overlap or horizontal page overflow.
- Motion is restrained and does not block use when Reduce Motion is enabled.

## Verification gate

- Next.js production build, lint, targeted Vitest, and affected Playwright mobile suites pass.
- The iOS theme and feature-import checks pass.
- The `FuelWellApp` scheme builds and tests on one compact and one larger iPhone simulator.
- The repaired core routes have current screenshots at compact and larger iPhone sizes.
- Any document-level horizontal overflow, clipped primary action, unsafe-area collision, or unusable keyboard state is a release blocker.
