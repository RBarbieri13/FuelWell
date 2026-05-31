<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branch workflow (MANDATORY — applies to CLI, web, and GitHub Action sessions)

This repo is edited from multiple devices (MacBook CLI, iPhone/iPad via claude.ai/code, GitHub mobile via @claude). To prevent merge conflicts, every session — human or agent — MUST follow these rules:

1. **Never commit directly to `main`.** A `pre-commit` hook enforces this locally; GitHub branch protection enforces it remotely.
2. **Always start work by pulling latest `main`, then creating a feature branch:**
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/<short-kebab-name>
   ```
3. **Every change ships via a PR** into `main`. No force-pushes to `main`.
4. **Auto-push is on:** a `post-commit` hook pushes the current feature branch to `origin` after every commit, so work is immediately visible from the phone. Do not disable this.
5. **Before resuming work on the MacBook**, run `git fetch origin && git checkout main && git pull` to pick up anything merged from the phone.
6. **If you find yourself on `main` with uncommitted changes**, move them onto a feature branch immediately: `git checkout -b feature/<name>` (no commit needed — working-tree changes carry over).
7. **Do not edit files on a feature branch that another in-flight branch also touches.** If unsure, merge or rebase the open PR first.

# Moonchild design workflow

For Moonchild, design-system, PRD-to-UI, design-to-code, design MCP, or UI consistency work, use the `moonchild-design-implementation` skill first.

- Repo setup lives in `docs/moonchild/README.md`.
- Canonical FuelWell design contract is `docs/ios-guide/DESIGN.md`.
- iOS generated tokens live in `ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift`.
- Moonchild MCP requires Robert to install/authenticate it from Moonchild account settings. If it is not connected, ask for the Moonchild MCP install command or a Moonchild structured export before claiming design fidelity.
- After any design-token or UI implementation work, run build/tests plus `ios/scripts/check-theme-drift.sh`, `ios/scripts/check-feature-imports.sh`, and SwiftLint.

# UI quality skill stack

For meaningful FuelWell UI work, use these local skills together instead of relying on generic SwiftUI defaults:

1. Start with Moonchild when the task touches the design system, route structure, PRD-to-UI work, or visual consistency.
2. Use `impeccable` to critique, polish, typeset, lay out, and harden screens against generic AI UI patterns before shipping.
3. Use `imagegen-frontend-mobile` when a new iOS screen or major visual flow needs a high-fidelity mobile reference before coding.
4. Use `imagegen-frontend-web` for shareable web artifacts, planning boards, landing pages, or browser-based prototypes.
5. Use `image-to-code` when implementing from an approved reference image, screenshot, Moonchild export, or visual mock.

Before opening a UI PR, check that visible chevrons, buttons, and cards either navigate to a real destination or are explicitly disabled/hidden. Do not leave dead affordances in preview screens.
