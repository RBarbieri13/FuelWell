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

