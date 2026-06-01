# FuelWell TestFlight Route

FuelWell distributes real iPhone review builds through Apple TestFlight. The default route is internal-only: it uploads a build to App Store Connect and does not invite external testers or public-link testers automatically.

## What Robert Provides Once

Create this local file on the MacBook:

```bash
mkdir -p ~/.fuelwell
$EDITOR ~/.fuelwell/apple-testflight.env
```

Add the following values:

```bash
export FUELWELL_APP_IDENTIFIER="com.fuelwell.app"
export FUELWELL_APPLE_ID="you@example.com"
export FUELWELL_APPLE_TEAM_ID="TEAMID1234"
export FUELWELL_APP_STORE_CONNECT_TEAM_ID="123456789"
export FUELWELL_MATCH_GIT_URL="git@github.com:RBarbieri13/fuelwell-certificates.git"
export MATCH_PASSWORD="match-password"
export FUELWELL_ASC_KEY_ID="ABC123DEFG"
export FUELWELL_ASC_ISSUER_ID="00000000-0000-0000-0000-000000000000"
export FUELWELL_ASC_KEY_P8_BASE64="base64-encoded-AuthKey.p8"
```

Optional:

```bash
export FUELWELL_BUILD_NUMBER="202606011430"
export FUELWELL_TESTFLIGHT_CHANGELOG="FuelWell pilot build for Robert and Max."
```

Do not commit this file. It contains Apple signing and upload secrets.

## One-Command Local Upload

After the Apple Developer account, App Store Connect app record, Match certificates repo, and API key exist:

```bash
tools/release/run-testflight-beta.sh
```

That command sources `~/.fuelwell/apple-testflight.env`, installs Ruby dependencies, runs the TestFlight readiness gate, signs with Match in read-only mode, builds the app, and uploads it to TestFlight.

## GitHub Upload

Add these repository secrets before using the manual workflow:

| Secret | Purpose |
| --- | --- |
| `FUELWELL_APP_IDENTIFIER` | Bundle identifier, normally `com.fuelwell.app` |
| `FUELWELL_APPLE_ID` | Apple ID email for App Store Connect |
| `FUELWELL_APPLE_TEAM_ID` | Apple Developer Program team ID |
| `FUELWELL_APP_STORE_CONNECT_TEAM_ID` | App Store Connect provider/team ID |
| `FUELWELL_MATCH_GIT_URL` | Private Match certificates repo SSH URL |
| `MATCH_PASSWORD` | Fastlane Match encryption passphrase |
| `MATCH_DEPLOY_KEY` | SSH private key with read access to the Match repo |
| `FUELWELL_ASC_KEY_ID` | App Store Connect API key ID |
| `FUELWELL_ASC_ISSUER_ID` | App Store Connect issuer ID |
| `FUELWELL_ASC_KEY_P8_BASE64` | Base64-encoded API private key content |

Then run **Actions -> iOS TestFlight -> Run workflow** on `main`.

## Robert and Max Install

1. Install Apple's TestFlight app on each iPhone.
2. In App Store Connect, add Robert and Max to the internal tester group.
3. Add the uploaded build to that group.
4. Open the TestFlight invitation on each iPhone and install FuelWell.

External testers or public links can be added later, but those can require Beta App Review. Keep the first route internal until Robert and Max have installed and smoke-tested the build.

## Verification

Run:

```bash
tools/release/check-testflight-readiness.sh
```

The gate reports missing secrets as blockers without printing secret values.
