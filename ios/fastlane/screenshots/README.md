FuelWell App Store screenshots must come from the verified immutable candidate through the native WKWebView shell.

Run from `ios/` after setting the release-candidate and sign-in environment variables:

```bash
bundle exec fastlane ios screenshots
```

Required gates before the command will succeed:

- Install Bundler `2.6.9` or run in a managed Ruby environment that satisfies `ios/Gemfile.lock`.
- Set `FUELWELL_CANDIDATE_URL`, `FUELWELL_CANDIDATE_GIT_SHA`, `FUELWELL_CANDIDATE_DEPLOYMENT_ID`, `FUELWELL_CANDIDATE_ENVIRONMENT`, `FUELWELL_UI_TEST_EMAIL`, and `FUELWELL_UI_TEST_PASSWORD`.
- Keep only real captured PNGs under `ios/fastlane/screenshots/en-US/`; do not hand-author or mock these assets.
