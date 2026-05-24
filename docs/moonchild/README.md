# FuelWell Moonchild Setup

Moonchild is the design-system-to-implementation handoff path for FuelWell UI work. This repo is ready to use Moonchild exports today, and can use Moonchild MCP once Robert installs/authenticates the MCP from Moonchild account settings.

## Current Status

- Local skill available: `moonchild-design-implementation`
- Codex skill path: `/Users/robert.barbieri/.codex/skills/moonchild-design-implementation/SKILL.md`
- Claude skill path: `/Users/robert.barbieri/.claude/skills/moonchild-design-implementation/SKILL.md`
- Moonchild MCP: not detected in local config yet
- Repo design source of truth: `docs/ios-guide/DESIGN.md`
- Generated Swift theme: `ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift`

## FuelWell Design Inputs

Give Moonchild these files when building or refreshing the FuelWell design system:

- `docs/ios-guide/DESIGN.md` - canonical tokens and visual language.
- `docs/ios-guide/PRINCIPLES.md` - product and UX decision rules.
- `docs/ios-guide/PRODUCT-CONTEXT.md` - product audience and behavior model.
- `docs/ios-guide/APP-MAP.md` - screen inventory and navigation hierarchy.
- `docs/ios-guide/FLOW-CHART.md` - user journeys and cross-screen states.
- `docs/ios-guide/mockups/*.png` - locked visual references.
- `docs/ios-guide/mockups/html/*.html` - inspectable mockup source.
- `docs/ios-guide/decisions.md` - locked decisions and reviewer consolidation.

## Design System Contract

Moonchild must preserve these locked FuelWell rules:

- Brand mark green is `#47E7B0`.
- Retired green `#3D9B2F` must not appear.
- Action/success green is `#00D278`.
- SwiftUI implementation must use `@Environment(\.theme)` and `Theme.swift` tokens.
- `Theme.swift` is generated from `docs/ios-guide/DESIGN.md`; do not edit it by hand.
- Run `ios/scripts/check-theme-drift.sh` after any design-token change.
- No hardcoded SwiftUI colors outside the generated theme.

## Connected MCP Workflow

Use this prompt after Moonchild MCP is installed and authenticated:

```text
Fetch the active FuelWell Moonchild project through MCP. List design-system tokens, component families, screens, routes, and variants. Do not implement yet. Compare Moonchild tokens with docs/ios-guide/DESIGN.md and ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift. Identify any drift before coding.
```

Then use this implementation prompt:

```text
Use the Moonchild MCP design data for [FuelWell screen or flow]. Implement it in this repo using the existing iOS packages and Theme.swift. Preserve tokens, layout, variants, empty/loading/error states, and interaction states. Run build, tests, SwiftLint, import-direction check, and theme-drift check. For UI work, visually verify the simulator result against the Moonchild design.
```

## If MCP Is Not Connected

Ask Robert for one of these before claiming design fidelity:

- The Moonchild MCP install command from Moonchild Settings.
- A Moonchild exported structured spec.
- A Moonchild screenshot set plus the exported token/component spec.

Screenshots alone are allowed for rough implementation, but not pixel-fidelity claims.

## Export Intake

When Robert provides a Moonchild export, save the human-readable planning copy in:

`docs/moonchild/exports/`

Use `docs/moonchild/templates/moonchild-screen-intake.md` for every screen or flow.

Do not commit private Moonchild account tokens, session files, or API keys.
