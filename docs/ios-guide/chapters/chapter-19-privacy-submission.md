# Chapter 19: Privacy, HealthKit & App Store Submission

"App Review reads every string."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Have a complete PrivacyInfo.xcprivacy manifest reflecting FuelWell's actual data flow
2.  Have Info.plist usage strings that pass App Review on the first submission
3.  Use ChatGPT Images 2.0 to generate App Store screenshots in every supported language without manual rework
4.  Use Claude Design + the Figma for Agents MCP to produce device-frame screenshots that match the in-app design system
5.  Configure fastlane deliver for phased rollout, automated metadata, and submission information
6.  Run the full pre-submission checklist and submit to App Review with confidence

## Prerequisites

Chapters 17 and 18 complete (CI/CD running green; Sentry, PostHog, and the kill-switch infrastructure all wired up). The app is feature-complete for v1.0. You have an active Apple Developer Program membership and an App Store Connect record for FuelWell.

  

## The privacy manifest

Apple requires PrivacyInfo.xcprivacy for any app that uses certain "required reason" APIs (UserDefaults, FileManager timestamp APIs, system uptime, disk space). FuelWell uses several of these. The manifest must accurately declare every data type collected and every required-reason API used.

  

Create FuelWell/PrivacyInfo.xcprivacy:

  

\<?xml version="1.0" encoding="UTF-8"?\>

  

\<\!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"\>

  

\<plist version="1.0"\>

  

\<dict\>

  

    \<key\>NSPrivacyTracking\</key\>\<false/\>

  

    \<key\>NSPrivacyTrackingDomains\</key\>\<array/\>

  

    \<key\>NSPrivacyCollectedDataTypes\</key\>

  

    \<array\>

  

        \<dict\>

  

            \<key\>NSPrivacyCollectedDataType\</key\>\<string\>NSPrivacyCollectedDataTypeHealth\</string\>

  

            \<key\>NSPrivacyCollectedDataTypeLinked\</key\>\<true/\>

  

            \<key\>NSPrivacyCollectedDataTypeTracking\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypePurposes\</key\>

  

            \<array\>\<string\>NSPrivacyCollectedDataTypePurposeAppFunctionality\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyCollectedDataType\</key\>\<string\>NSPrivacyCollectedDataTypeFitness\</string\>

  

            \<key\>NSPrivacyCollectedDataTypeLinked\</key\>\<true/\>

  

            \<key\>NSPrivacyCollectedDataTypeTracking\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypePurposes\</key\>

  

            \<array\>\<string\>NSPrivacyCollectedDataTypePurposeAppFunctionality\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyCollectedDataType\</key\>\<string\>NSPrivacyCollectedDataTypeEmailAddress\</string\>

  

            \<key\>NSPrivacyCollectedDataTypeLinked\</key\>\<true/\>

  

            \<key\>NSPrivacyCollectedDataTypeTracking\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypePurposes\</key\>

  

            \<array\>\<string\>NSPrivacyCollectedDataTypePurposeAppFunctionality\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyCollectedDataType\</key\>\<string\>NSPrivacyCollectedDataTypeCrashData\</string\>

  

            \<key\>NSPrivacyCollectedDataTypeLinked\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypeTracking\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypePurposes\</key\>

  

            \<array\>\<string\>NSPrivacyCollectedDataTypePurposeAppFunctionality\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyCollectedDataType\</key\>\<string\>NSPrivacyCollectedDataTypeProductInteraction\</string\>

  

            \<key\>NSPrivacyCollectedDataTypeLinked\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypeTracking\</key\>\<false/\>

  

            \<key\>NSPrivacyCollectedDataTypePurposes\</key\>

  

            \<array\>\<string\>NSPrivacyCollectedDataTypePurposeAnalytics\</string\>\</array\>

  

        \</dict\>

  

    \</array\>

  

    \<key\>NSPrivacyAccessedAPITypes\</key\>

  

    \<array\>

  

        \<dict\>

  

            \<key\>NSPrivacyAccessedAPIType\</key\>\<string\>NSPrivacyAccessedAPICategoryUserDefaults\</string\>

  

            \<key\>NSPrivacyAccessedAPITypeReasons\</key\>\<array\>\<string\>CA92.1\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyAccessedAPIType\</key\>\<string\>NSPrivacyAccessedAPICategoryFileTimestamp\</string\>

  

            \<key\>NSPrivacyAccessedAPITypeReasons\</key\>\<array\>\<string\>C617.1\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyAccessedAPIType\</key\>\<string\>NSPrivacyAccessedAPICategoryDiskSpace\</string\>

  

            \<key\>NSPrivacyAccessedAPITypeReasons\</key\>\<array\>\<string\>E174.1\</string\>\</array\>

  

        \</dict\>

  

        \<dict\>

  

            \<key\>NSPrivacyAccessedAPIType\</key\>\<string\>NSPrivacyAccessedAPICategorySystemBootTime\</string\>

  

            \<key\>NSPrivacyAccessedAPITypeReasons\</key\>\<array\>\<string\>35F9.1\</string\>\</array\>

  

        \</dict\>

  

    \</array\>

  

\</dict\>

  

\</plist\>

  

Audit this against actual data flow. If you add a new collected data type during development, add a row here. The manifest must match reality — App Review cross-checks it against runtime behavior.

  

## Info.plist usage strings

Every iOS permission prompt shows a string the developer wrote. Apple rejects vague strings ("for app functionality"). The strings must name the data, the use, and the protections.

  

\<key\>NSHealthShareUsageDescription\</key\>

  

\<string\>FuelWell reads your steps, active calories, and workout history from Apple Health to show your daily activity on the dashboard and to suggest meals and workouts that match your energy needs. Your health data stays on your device and is never sold or shared with third parties.\</string\>

  

\<key\>NSHealthUpdateUsageDescription\</key\>

  

\<string\>FuelWell does not currently write to Apple Health. This permission is required by iOS for apps that may add this feature later.\</string\>

  

\<key\>NSCameraUsageDescription\</key\>

  

\<string\>FuelWell uses the camera to scan barcodes on packaged foods to quickly add them to your meal log. Camera images are processed on your device and never uploaded.\</string\>

  

\<key\>NSPhotoLibraryUsageDescription\</key\>

  

\<string\>FuelWell can read images from your photo library to identify foods you've photographed. Selected photos are processed on your device and never uploaded.\</string\>

  

\<key\>NSUserNotificationsUsageDescription\</key\>

  

\<string\>FuelWell sends meal reminders and goal notifications based on your schedule. You can change reminder times in Settings.\</string\>

  

**Pitfall** — "for app functionality" is the most common rejection trigger. Name the data, name the use, name the protections. Apple's reviewers are not pattern-matching against keywords; they're reading the strings.

  

## App Store screenshots: the multilingual problem

App Store screenshots are the moment where ChatGPT Images 2.0's April 2026 capabilities have the most operational impact.

  

The traditional workflow for screenshots in five languages:

  

1.  Design English screenshots in Figma — 6 screenshots × 3 device sizes = 18 images
2.  Translate the marketing copy into the four other languages
3.  Manually swap the text in Figma — and discover that German runs 30% longer, Japanese needs different line breaks, Arabic needs RTL layout
4.  Re-export 18 × 5 = 90 images
5.  Total time: 3-5 days for a solo developer who isn't a designer

  

This was where many solo developers shipped English-only and called it done.

  

ChatGPT Images 2.0 changed this. The model has 99% multilingual text rendering accuracy and can generate up to 8 coherent images per prompt. The new workflow:

  

1.  Generate the English screenshots once via Claude Design
2.  For each non-English language, prompt ChatGPT Images 2.0 with: English screenshot + translated copy + DESIGN.md context + "render this screenshot in \[language\] with the translated text, preserving the layout"
3.  Review the output for layout integrity (German runs long, etc.) and adjust the source mockup if needed
4.  Total time: 3-5 hours for the same coverage

  

Both tools play complementary roles: Claude Design produces the source mockup with full design-system fidelity; ChatGPT Images 2.0 handles the localized variants where text rendering is the constraint.

  

## Generating App Store screenshots end-to-end

### Step 1 — Generate the English source mockups via Claude Design

In Claude Design, prompt:

  

Generate App Store screenshots for FuelWell. iPhone 17 Pro Max device frame.

  

Six screenshots covering the v1.0 flow:

  

1\. Dashboard with daily macros and steps

  

2\. Meal log with three logged meals

  

3\. Add meal form with sample data

  

4\. Weekly summary with trend chart

  

5\. Workouts feed

  

6\. Settings with HealthKit toggle on

  

Each screenshot includes a single bold marketing headline at the top

  

(8 words or fewer), and the actual app UI underneath. Marketing background

  

should use the cream-and-terracotta palette consistent with the brand.

  

Use the existing design system. Three layout variations.

  

Claude Design produces three on-brand variations of all six screenshots. The variations differ in headline placement (top, side, integrated), and in how much of the app UI is visible per shot.

  

Pick the variation that scans best at App Store thumbnail size — usually the one with the most contrast between headline and app UI.

### Step 2 — Capture the chosen layout

For each of the six screenshots, capture the public URL from Claude Design. You now have six on-brand English screenshots.

### Step 3 — Generate the localized variants via ChatGPT Images 2.0

For each non-English language, prompt ChatGPT Images 2.0 (Thinking mode on, 2K resolution):

  

Reference design system:

  

\[paste the colors, typography, and brand voice sections from docs/DESIGN.md\]

  

Source: this English App Store screenshot:

  

\[paste the URL of the chosen English variation, screenshot 1 of 6\]

  

Task: Render this exact screenshot with the marketing headline and all

  

in-app text translated to German. Preserve the layout, fonts, color

  

palette, and visual hierarchy.

  

Marketing headline (English): "Your day, in clear focus"

  

Marketing headline (German): "Dein Tag, im klaren Fokus"

  

In-app strings to translate (preserve case and styling):

  

\- "Today" → "Heute"

  

\- "1,420 of 2,000 kcal" → "1.420 von 2.000 kcal"

  

\- "Steps" → "Schritte"

  

\- "Meals logged" → "Mahlzeiten erfasst"

  

Output: 1284x2778 PNG (iPhone 17 Pro Max App Store size).

  

Note: German text often runs 25-30% longer than English. If a translated

  

string overflows its container, adjust the layout proportionally to

  

preserve hierarchy. Don't truncate.

  

Repeat for each language and each screenshot. Six screenshots × four languages = 24 generations. At 60-90 seconds each in Thinking mode, the full set takes 30-40 minutes.

### Step 4 — Review for layout integrity

Open the generated images. Check:

  

  - **Text fits.** German often expands; Arabic often contracts. The model should have adjusted, but spot check.
  - **Numbers use locale conventions.** German uses periods as thousand separators (1.420 not 1,420). The model handles this when prompted; verify.
  - **Imagery is consistent.** The illustrations and chart shapes should match the English source. The model may regenerate them; if they drift visibly, re-prompt with a stronger consistency directive.

  

For any image that needs adjustment, re-prompt with the specific issue called out:

  

The previous output truncated the headline "Dein Tag, im klaren Fokus"

  

at "Dein Tag, im klar..." Regenerate with the headline at 90% font size

  

to preserve full text. Otherwise identical to the previous output.

### Step 5 — Save with structured filenames

fastlane/screenshots/

  

├── en-US/

  

│   ├── 1-dashboard.png

  

│   ├── 2-meal-log.png

  

│   ├── 3-add-meal.png

  

│   ├── 4-weekly-summary.png

  

│   ├── 5-workouts.png

  

│   └── 6-settings.png

  

├── de-DE/

  

│   └── ... (same six)

  

├── es-ES/

  

│   └── ...

  

├── fr-FR/

  

│   └── ...

  

└── ja-JP/

  

    └── ...

  

Fastlane's deliver tool reads this structure and uploads automatically.

  

## When Figma is in the loop

For App Store screenshots specifically, many developers prefer Figma because it gives device-frame templates with status bars, dynamic island, and proper rounded corners. The April 2026 Figma for Agents MCP makes this workflow integrated.

  

If you didn't install the Figma for Agents MCP in Chapter 3, install it now:

  

claude mcp add figma \\

  

  -s user \\

  

  -e FIGMA\_API\_TOKEN=\<your-figma-token\> \\

  

  -- npx -y @figma/mcp-server@latest

  

Create a Figma file with iPhone 17 Pro Max device frames for App Store sizes. In a Claude Code session:

  

Pull the six chosen Claude Design mockups into the Figma file

  

"FuelWell App Store Screenshots". For each mockup, place it in an

  

iPhone 17 Pro Max device frame. Add a localizable text layer for

  

the marketing headline at the top of each frame.

  

Use the existing design system tokens.

  

Claude Code uses the Figma MCP to read the existing file and write the device-framed screenshots into it. You now have a Figma file structured for App Store delivery, with the source mockups intact and locale-swappable headline layers.

  

This workflow is optional. The pure Claude Design + ChatGPT Images 2.0 path produces App-Store-acceptable screenshots without Figma. Use Figma only if you have a designer who lives there or if you need fine-grained device-frame fidelity.

  

## Fastlane deliver configuration

fastlane deliver uploads metadata and screenshots to App Store Connect. It reads fastlane/metadata/\<locale\>/ for text and fastlane/screenshots/\<locale\>/ for images.

  

The Fastfile lane (extended from Chapter 17):

  

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

  

    metadata\_path: "./fastlane/metadata",

  

    screenshots\_path: "./fastlane/screenshots",

  

    submission\_information: {

  

      add\_id\_info\_uses\_idfa: false,

  

      export\_compliance\_uses\_encryption: true,

  

      export\_compliance\_is\_exempt: true

  

    }

  

  )

  

end

  

Notable choices:

  

  - **phased\_release: true** — App Store Connect rolls the release out gradually over 7 days. If something is broken, you pause the rollout from App Store Connect; users on the new version don't grow.
  - **automatic\_release: false** — after App Review approval, the release sits in "ready for sale" until you manually release it. This buys time to do a final QA on the production-built TestFlight version.
  - **submit\_for\_review: true** — submits automatically after upload. Combined with automatic\_release: false, this means: ship the binary to review on tag-push, but don't go live until I manually flip the switch.

  

## Metadata structure

fastlane/metadata/\<locale\>/ contains text files for App Store listing copy:

  

fastlane/metadata/en-US/

  

├── name.txt                  \# FuelWell

  

├── subtitle.txt              \# Wellness without the shouting

  

├── description.txt           \# Long description

  

├── keywords.txt              \# nutrition, fitness, healthkit, ...

  

├── promotional\_text.txt      \# What's new, updateable without resubmission

  

├── support\_url.txt           \# https://fuelwell.app/support

  

├── marketing\_url.txt         \# https://fuelwell.app

  

└── privacy\_url.txt           \# https://fuelwell.app/privacy

  

Repeat the structure for each supported locale. Translated strings live in the locale folder.

  

For the description, write the English version first. Use Claude Design or Claude Code to translate to each other locale, with a prompt like:

  

Translate the following App Store description to German. Maintain the

  

brand voice: warm, direct, science-honest, calm. Avoid marketing

  

exclamation. Use the second person. Preserve paragraph structure and

  

bullet points.

  

\[paste English description\]

  

Review each translation before committing. Native review is ideal but not required — App Review accepts machine-translated metadata if the meaning is preserved and there are no overt errors.

  

## Pre-submission checklist

Before pushing the release tag, run through this. Every box must check.

  

  - PrivacyInfo.xcprivacy reflects actual data flow — verified by walking through the app and checking each collected data type
  - Every NS\*UsageDescription string names the data, the use, and the protections
  - Account deletion flow works end-to-end — tested on a TestFlight build
  - Data export flow works end-to-end — tested on a TestFlight build
  - Privacy policy URL serves a real page that matches the manifest
  - Support URL serves a real page with at least an email contact
  - Screenshots match the shipped UI — not aspirational, not from an older version
  - Screenshots exist in every declared supported locale
  - Keywords do not include competitor names
  - Age rating questionnaire answered honestly (likely 4+ for FuelWell, but verify against actual content)
  - All AI features behind kill-switches verified working — see Chapter 18 kill-switch drill
  - Sentry release tag matches app version — verified by looking at recent uploads in Sentry
  - PostHog default-off telemetry verified — first-launch user is not tracked until consent
  - Phased rollout enabled in deliver configuration
  - Full pre-release performance checklist from Chapter 16 passed
  - Full accessibility audit from Chapter 15 passed

  

When every box is checked, push the release tag:

  

git tag v1.0.0

  

git push origin v1.0.0

  

The release lane runs in CI. The build uploads to TestFlight, then to App Store Connect, then submits for review with the configured metadata.

  

App Review typically takes 24-48 hours for a first submission. While waiting, monitor Sentry and PostHog from the TestFlight build to catch any issues that didn't surface in development.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Generating screenshots at the wrong resolution | Claude Design's default canvas isn't App Store size | Specify 1284x2778 (iPhone 17 Pro Max) explicitly in the ChatGPT Images 2.0 prompt for App Store sizing |
| Letting localized headlines overflow | The translation is longer than the design accommodates | The Thinking-mode generator will adjust if prompted; spot check, and re-prompt for the specific image with adjusted font size |
| Screenshots that don't match the shipped app | The screenshots were generated from an older mockup or an aspirational design | Generate screenshots from the \*current shipped UI\*, not from the original design. The TestFlight build is the source of truth |
| Privacy manifest declares data types the app doesn't actually collect | "Add it just in case" thinking | Apple cross-checks the manifest against runtime behavior. Declaring more than you collect can trigger rejection too |
| Pushing the release tag before TestFlight is on the new version | Eagerness | Build → TestFlight → wait for processing → install → spot check → \*then\* tag for release |
| Skipping the kill-switch drill before submission | "It worked last week" | The drill confirms the kill-switch path is current. AI features ship with kill-switches enabled by default — verify the \*off\* path works before launch |

  

## Hands-On Exercise

**Goal:** Take FuelWell from feature-complete to submitted-for-review.

  

**Time budget:** Half a day.

  

**Steps:**

  

1.  Audit PrivacyInfo.xcprivacy against actual data flow. Add or remove data type declarations to match reality.
2.  Review every NS\*UsageDescription string. Rewrite any that say "for app functionality" — name data, use, and protections.
3.  Generate the six App Store screenshots in English via Claude Design. Capture URLs.
4.  Generate the four non-English variants for each screenshot via ChatGPT Images 2.0 with the multilingual prompt template. Save with the structured filename pattern.
5.  Spot-check each localized screenshot for layout integrity. Re-generate any that need adjustment.
6.  Populate fastlane/metadata/\<locale\>/ for each supported locale.
7.  Run through the pre-submission checklist. Address any unchecked items.
8.  Run the kill-switch drill from Chapter 18 against the TestFlight build. Confirm the *off* path works.
9.  Push the release tag: git tag v1.0.0 && git push origin v1.0.0.
10. Watch the release CI workflow. Verify TestFlight upload, App Store Connect upload, and submission for review.
11. Set a calendar reminder for 48 hours from submission to check review status.
12. Commit the metadata and screenshots: git add fastlane && git commit -m "Chapter 19: App Store metadata and localized screenshots".

  

When App Review approves the build (typically 24-48 hours later), you have the option to release manually. Wait for at least 4-6 hours of approved-but-not-released time to do a final QA on the production-built version before flipping the switch.

  

## What's Next

Chapter 20 is the operational chapter — what happens after launch. Sentry alert configuration, the kill-switch drill schedule, the daily/weekly/quarterly cadences that keep a shipped app healthy, and the runbook template for common scenarios. After Chapter 20, the guide is complete: you have an architecture, a tooling layer, a quality bar, a release process, and an operations playbook. What you do with them is the actual work.

  