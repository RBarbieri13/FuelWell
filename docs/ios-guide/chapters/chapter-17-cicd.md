# Chapter 17: CI/CD with GitHub Actions + Fastlane

"git tag v1.0.0 && git push should ship it."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Have a GitHub Actions workflow that runs the full test suite, lints, and design system checks on every PR
2.  Have a Fastfile with three lanes — test, beta, release — that handle every release scenario
3.  Have match configured for code-signing certificate management
4.  Have all required secrets configured in GitHub Actions
5.  Have a Dangerfile that catches the most common PR-quality issues automatically
6.  Have the design-system CI checks introduced in Chapters 8 and 15 wired into the lint job

## Prerequisites

Chapters 8 and 15 complete (the three design system scripts exist: scripts/generate-theme.swift, scripts/check-theme-drift.sh, scripts/check-design-violations.sh; the DESIGN.md WCAG linter is installed). An Apple Developer Program membership. An App Store Connect API key. A private GitHub repo for the FuelWell project, and a *separate* private GitHub repo for the certificates that match will manage.

  

## The three lanes

Fastlane organizes release automation into "lanes" — named workflows. FuelWell uses three:

  

  - **test** — runs the full test suite. Used by CI on every PR.
  - **beta** — builds, signs, and uploads to TestFlight. Used by CI on every push to main.
  - **release** — builds, signs, uploads to TestFlight, then submits to App Review. Used by CI when a v\* tag is pushed.

  

This separation means the dangerous workflows (beta, release) are gated by branch and tag conventions. PRs run test. Merges run beta. Tags run release. No workflow can fire by accident.

  

## Gemfile

Bundler manages the Fastlane version so CI runs the same Fastlane the developer ran locally.

  

source 'https://rubygems.org'

  

gem 'fastlane'

  

gem 'cocoapods'

  

Run bundle install once. Commit Gemfile and Gemfile.lock.

  

## fastlane/Fastfile

The full Fastfile, with all three lanes:

  

default\_platform(:ios)

  

platform :ios do

  

  before\_all do

  

    app\_store\_connect\_api\_key(

  

      key\_id: ENV\["ASC\_KEY\_ID"\],

  

      issuer\_id: ENV\["ASC\_ISSUER\_ID"\],

  

      key\_content: ENV\["ASC\_KEY\_P8\_CONTENT"\],

  

      is\_key\_content\_base64: true

  

    )

  

  end

  

  desc "Run all tests"

  

  lane :test do

  

    run\_tests(

  

      project: "FuelWell.xcodeproj",

  

      scheme: "FuelWell",

  

      devices: \["iPhone 17 Pro"\],

  

      result\_bundle: true,

  

      output\_directory: "fastlane/test\_output"

  

    )

  

  end

  

  desc "TestFlight beta"

  

  lane :beta do

  

    ensure\_git\_status\_clean

  

    match(type: "appstore", readonly: true)

  

    increment\_build\_number\_in\_xcodeproj(xcodeproj: "FuelWell.xcodeproj")

  

    build\_app(

  

      project: "FuelWell.xcodeproj",

  

      scheme: "FuelWell",

  

      configuration: "Release",

  

      export\_method: "app-store",

  

      output\_directory: "fastlane/build",

  

      output\_name: "FuelWell.ipa"

  

    )

  

    upload\_to\_testflight(

  

      skip\_waiting\_for\_build\_processing: true,

  

      changelog: sh("git log -1 --pretty=%B").strip,

  

      groups: \["Internal"\]

  

    )

  

    if ENV\["SENTRY\_AUTH\_TOKEN"\]

  

      sentry\_upload\_dsym(

  

        auth\_token: ENV\["SENTRY\_AUTH\_TOKEN"\],

  

        org\_slug: "your-org",

  

        project\_slug: "fuelwell-ios",

  

        dsym\_path: "fastlane/build/FuelWell.app.dSYM.zip"

  

      )

  

    end

  

  end

  

  desc "Production release"

  

  lane :release do

  

    ensure\_git\_status\_clean

  

    match(type: "appstore", readonly: true)

  

    build\_app(

  

      project: "FuelWell.xcodeproj",

  

      scheme: "FuelWell",

  

      configuration: "Release",

  

      export\_method: "app-store"

  

    )

  

    upload\_to\_testflight(

  

      skip\_waiting\_for\_build\_processing: false,

  

      groups: \["Internal", "External"\]

  

    )

  

    deliver(

  

      submit\_for\_review: true,

  

      automatic\_release: false,

  

      phased\_release: true,

  

      force: true,

  

      submission\_information: {

  

        add\_id\_info\_uses\_idfa: false,

  

        export\_compliance\_uses\_encryption: true,

  

        export\_compliance\_is\_exempt: true

  

      }

  

    )

  

  end

  

end

  

## .github/workflows/pr.yml

The PR workflow. Two parallel jobs: lint (fast) and test (slow). Both must pass to merge.

  

The lint job has grown to include the design system checks introduced in earlier chapters. The progression: SwiftLint catches Swift style issues; the feature-import script enforces module topology; the theme drift check catches DESIGN.md / Theme divergence; the design violations script catches hardcoded colors and spacing in views; the WCAG linter catches contrast violations in DESIGN.md itself.

  

name: PR Checks

  

on:

  

  pull\_request:

  

    branches: \[main\]

  

  push:

  

    branches: \[main\]

  

concurrency:

  

  group: ${{ github.workflow }}-${{ github.ref }}

  

  cancel-in-progress: true

  

jobs:

  

  lint:

  

    runs-on: macos-15

  

    steps:

  

      - uses: actions/checkout@v4

  

      - run: brew install swiftlint

  

      - run: swiftlint --strict

  

      \# Architecture enforcement (Chapter 5)

  

      - run: ./scripts/check-feature-imports.sh

  

      \# Design system enforcement (Chapter 8)

  

      - run: ./scripts/check-theme-drift.sh

  

      - run: ./scripts/check-design-violations.sh

  

      \# Accessibility enforcement (Chapter 15)

  

      - run: npm install -g @design-md/lint

  

      - run: design-md lint docs/DESIGN.md --standard wcag-aa

  

  test:

  

    runs-on: macos-15

  

    steps:

  

      - uses: actions/checkout@v4

  

      - run: sudo xcode-select -s /Applications/Xcode\_26.app

  

      - uses: actions/cache@v4

  

        with:

  

          path: |

  

            \~/Library/Developer/Xcode/DerivedData/\*\*/SourcePackages

  

            \~/Library/Caches/org.swift.swiftpm

  

          key: ${{ runner.os }}-spm-${{ hashFiles('\*\*/Package.resolved') }}

  

      - run: bundle install

  

      - run: bundle exec fastlane test

  

      - uses: actions/upload-artifact@v4

  

        if: always()

  

        with:

  

          name: test-results

  

          path: fastlane/test\_output

  

The lint job runs in 2-3 minutes. The test job runs in 8-15 minutes depending on caching. They run in parallel, so total wall-clock time is the slower of the two.

  

The five lint checks form a layered contract:

  

  - **swiftlint --strict** — Swift style and complexity
  - **check-feature-imports.sh** — module topology (no Feature → Feature imports)
  - **check-theme-drift.sh** — DESIGN.md and Theme.generated.swift are in sync
  - **check-design-violations.sh** — no hardcoded colors, fonts, or spacing in views
  - **design-md lint** — DESIGN.md tokens meet WCAG AA contrast

  

A PR that fails any of these can't merge. The contract is enforced by tooling, not by review discipline.

  

## .github/workflows/release.yml

The release workflow. Triggered by tags matching v\*. Runs the beta lane (uploads to TestFlight). Promotion from TestFlight to App Review happens via the release lane, which we wire up only for tags matching release-\* to keep the dangerous path explicit.

  

name: Release

  

on:

  

  push:

  

    tags: \['v\*'\]

  

jobs:

  

  release:

  

    runs-on: macos-15

  

    timeout-minutes: 60

  

    steps:

  

      - uses: actions/checkout@v4

  

      - run: sudo xcode-select -s /Applications/Xcode\_26.app

  

      - uses: actions/cache@v4

  

        with:

  

          path: |

  

            \~/Library/Developer/Xcode/DerivedData/\*\*/SourcePackages

  

            \~/Library/Caches/org.swift.swiftpm

  

          key: ${{ runner.os }}-spm-${{ hashFiles('\*\*/Package.resolved') }}

  

      - run: bundle install

  

      - uses: webfactory/ssh-agent@v0.9.0

  

        with:

  

          ssh-private-key: ${{ secrets.MATCH\_DEPLOY\_KEY }}

  

      - env:

  

          MATCH\_PASSWORD: ${{ secrets.MATCH\_PASSWORD }}

  

          ASC\_KEY\_ID: ${{ secrets.ASC\_KEY\_ID }}

  

          ASC\_ISSUER\_ID: ${{ secrets.ASC\_ISSUER\_ID }}

  

          ASC\_KEY\_P8\_CONTENT: ${{ secrets.ASC\_KEY\_P8\_BASE64 }}

  

          DEV\_TEAM\_ID: ${{ secrets.DEV\_TEAM\_ID }}

  

          APPLE\_ID: ${{ secrets.APPLE\_EMAIL }}

  

          SENTRY\_AUTH\_TOKEN: ${{ secrets.SENTRY\_AUTH\_TOKEN }}

  

        run: bundle exec fastlane beta

  

Tag v1.0.0-rc1, v1.0.0-rc2, etc., trigger the beta lane. When ready to submit for review, run the release lane manually:

  

bundle exec fastlane release

  

This pattern — automated TestFlight uploads, manual App Review submission — keeps the dangerous step gated behind explicit human action while the routine step is fully automated.

  

## Required GitHub Secrets

|  |  |
| :-: | :-: |
| \*\*Secret\*\* | \*\*Value\*\* |
| MATCH\\\_PASSWORD | Match passphrase you set when initializing match |
| MATCH\\\_DEPLOY\\\_KEY | SSH private key with read access to certs repo |
| ASC\\\_KEY\\\_ID | App Store Connect API key ID (from App Store Connect → Users and Access → Keys) |
| ASC\\\_ISSUER\\\_ID | App Store Connect issuer ID (same screen) |
| ASC\\\_KEY\\\_P8\\\_BASE64 | cat AuthKey.p8 \| base64 |
| DEV\\\_TEAM\\\_ID | Apple Developer team ID |
| APPLE\\\_EMAIL | Apple ID email |
| SENTRY\\\_AUTH\\\_TOKEN | Sentry token with project:write, project:releases |

  

Configure these in GitHub: Settings → Secrets and variables → Actions → New repository secret.

  

## Dangerfile

Danger runs as part of CI to catch PR-quality issues that aren't worth a separate test. Add Dangerfile to the repo root:

  

\# PR size warnings

  

warn("Big PR — consider splitting") if git.lines\_of\_code \> 500

  

\# Require changelog updates for user-facing changes

  

has\_app\_changes = \!git.modified\_files.grep(/Features\\//).empty?

  

has\_changelog\_entry = git.modified\_files.include?("CHANGELOG.md")

  

warn("Please add a CHANGELOG.md entry for user-facing changes") \\

  

  if has\_app\_changes && \!has\_changelog\_entry

  

\# Cross-feature import detection (defense in depth — also caught by check-feature-imports.sh)

  

violators = \`./scripts/check-feature-imports.sh 2\>&1\` rescue ""

  

fail("Cross-feature imports detected:\\n\#{violators}") \\

  

  unless violators.empty? || violators.include?("✅")

  

\# New reducers must come with tests

  

new\_reducers = git.added\_files.grep(/Features\\/.\*Feature\\.swift$/)

  

new\_tests = git.added\_files.grep(/Features\\/.\*FeatureTests\\.swift$/)

  

unless new\_reducers.empty? || \!new\_tests.empty?

  

  fail "New reducers without tests: \#{new\_reducers.join(', ')}"

  

end

  

\# DESIGN.md changes warrant a callout

  

if git.modified\_files.include?("docs/DESIGN.md")

  

  message("DESIGN.md changed. Verify the regenerated Theme.generated.swift is in this PR " \\

  

          "(check-theme-drift.sh in CI will fail otherwise).")

  

end

  

\# New ChatGPT Images 2.0 assets get a soft reminder

  

new\_assets = git.added\_files.grep(/Resources\\/Assets\\/.\*\\.png$/)

  

unless new\_assets.empty?

  

  message("New image assets added: \#{new\_assets.length}. " \\

  

          "Verify they were generated with DESIGN.md context (Chapter 8).")

  

end

  

The last two messages are new in the April 2026 rebuild — they reflect the design-system tooling that was introduced in Chapters 8 and 15. The DESIGN.md change message is informational; the asset reminder is a soft check that the developer used the right workflow.

  

## Why this configuration

A few of the choices in the workflow above are non-obvious. Capturing the reasoning so the configuration doesn't decay over time:

  

**concurrency.cancel-in-progress: true** — when a developer pushes a fix to a PR, the in-progress run on the previous commit gets cancelled. Saves CI minutes and avoids noisy "failed" results on stale commits.

  

**actions/cache@v4** **with the** **Package.resolved** **hash key** — caches SPM downloads. Cold cache adds 5-7 minutes; warm cache adds 0-1 minute.

  

**macos-15** **runner** — required for Xcode 26. The default macos-latest may not be 26 yet at the time of CI run.

  

**Five lint checks running in serial in one job** — the lint job is fast (2-3 minutes) and the checks build on each other (theme drift check expects DESIGN.md is valid; design violations check expects Theme.generated.swift exists). Running them serially in one job is cheaper than four parallel jobs with their own checkout overhead.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Putting MATCH\\\_PASSWORD in the repo "for now" | Bootstrapping shortcut | Generate a strong passphrase. Store in a password manager. Set it as a GitHub Secret. Never commit |
| Storing certificates in the same repo as the source | "Why two repos?" | Match's design pattern requires a separate repo so signing material is access-controlled separately. Two repos, one passphrase |
| Forgetting to update the Xcode build number on each release | Manual builds, manual mistakes | increment\\\_build\\\_number\\\_in\\\_xcodeproj in the Fastfile handles this. Don't bypass it |
| Skipping the dSYM upload to Sentry | "It's optional" | Without dSYMs, Sentry stack traces are useless. Worth the extra Fastlane step every time |
| Disabling lint checks "temporarily" because they're failing | Time pressure | A failing lint check is a real signal. Fix the code, don't disable the check. The five-check contract has no exceptions |
| Adding new lint checks without testing them locally first | "CI will tell me if it's broken" | New checks should be runnable from the repo root with a single command. Add to scripts/, test locally, then wire into CI |

  

## Hands-On Exercise

**Goal:** Take the FuelWell repo from "passes locally" to "passes CI on every PR and tag-pushed release."

  

**Time budget:** 2-3 hours.

  

**Steps:**

  

1.  Create a separate private GitHub repo for certificates (e.g., FuelWell-Certs).
2.  Run bundle exec fastlane match init from the FuelWell repo root. Configure to use the certs repo.
3.  Run bundle exec fastlane match appstore to generate App Store distribution certificates and provisioning profiles.
4.  Generate a deploy key for the certs repo. Add the public key as a deploy key on FuelWell-Certs. Add the private key as MATCH\_DEPLOY\_KEY in the FuelWell repo's GitHub Secrets.
5.  Create the App Store Connect API key in App Store Connect → Users and Access → Keys. Download the AuthKey.p8 file. Configure the four ASC\_\* and DEV\_TEAM\_ID and APPLE\_EMAIL secrets in GitHub.
6.  Create a Sentry project. Generate an auth token with project:write and project:releases scopes. Configure as SENTRY\_AUTH\_TOKEN in GitHub.
7.  Save the Fastfile, both workflow files, and the Dangerfile from this chapter into the repo.
8.  Verify the lint job's five checks all run locally:
      
      - swiftlint --strict
      - ./scripts/check-feature-imports.sh
      - ./scripts/check-theme-drift.sh
      - ./scripts/check-design-violations.sh
      - design-md lint docs/DESIGN.md --standard wcag-aa
9.  Open a small PR. Watch the lint and test jobs run in parallel. Confirm both pass.
10. Merge to main. Watch the beta lane run. Confirm a new TestFlight build appears in App Store Connect.
11. Tag v1.0.0-rc1. Watch the release workflow run. Confirm another TestFlight build with the tagged version.
12. Commit each step. The history reads as a tour of CI maturation: lanes, workflows, secrets, Dangerfile, design system enforcement.

  

When the full pipeline runs green and a tag-push reliably produces a TestFlight build, the release infrastructure is in place. From here, every release is git tag vX.Y.Z && git push origin vX.Y.Z.

  

## What's Next

Chapter 18 covers analytics, observability, and the kill-switch infrastructure. PostHog for product analytics, Sentry for crash reporting, Supabase feature\_flags for the kill-switch, and the Sentry MCP for Claude Code-powered triage. After 18, the production telemetry layer is wired; you'll be able to know what users are doing, why they crash, and how to disable an AI feature in 30 seconds when something goes wrong.

  