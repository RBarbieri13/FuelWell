FuelWell App Store screenshots must come from the verified immutable candidate through the native WKWebView shell.

Run from `ios/` after setting the release-candidate and sign-in environment variables:

```bash
bundle exec fastlane ios screenshots
```

Required gates before the command will succeed:

- Install Bundler `2.6.9` or run in a managed Ruby environment that satisfies `ios/Gemfile.lock`.
- Set `FUELWELL_CANDIDATE_URL`, `FUELWELL_CANDIDATE_GIT_SHA`, `FUELWELL_CANDIDATE_DEPLOYMENT_ID`, `FUELWELL_CANDIDATE_ENVIRONMENT`, `FUELWELL_UI_TEST_EMAIL`, and `FUELWELL_UI_TEST_PASSWORD`.
- Supply the protected `FUELWELL_SCREENSHOT_ATTESTATION_KEY` release secret (at least 32 characters). The capture lane signs the exact candidate metadata and image hashes; release rejects unsigned, edited, or stale evidence.
- Run capture from the exact candidate commit with no tracked source changes. Generated files under `ios/fastlane/screenshots/` are the only permitted working-tree output.
- Keep only real captured PNGs under `ios/fastlane/screenshots/en-US/`; do not hand-author or mock these assets.

Brand verification before capture:

- Confirm the candidate renders `public/brand/fuelwell-lockup.png` on light surfaces and `public/brand/fuelwell-lockup-ondark.png` on dark surfaces.
- Confirm the native shell uses the staged `FuelWellLaunchLogo` image set supplied by the release-branding node; do not substitute the AppIcon or reconstruct the wordmark in text.
- Run `npm run test:unit -- tests/unit/release/fuelwell-brand-release.test.ts` from the repository root before taking candidate screenshots.
