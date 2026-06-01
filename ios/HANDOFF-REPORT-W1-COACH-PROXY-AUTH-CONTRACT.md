# FuelWell W1 Coach Proxy Auth Contract Handoff

## Scope

This slice closes the live Coach contract gap between the iOS client and the server proxy. The proxy already required stable user attribution for usage caps, but the iOS client was not sending a signed-in Supabase session to the proxy.

## Changed

- `AnthropicClient.live` now accepts `SupabaseAuthClient` and reads the current session before proxy requests.
- Live non-streaming and streaming Coach requests now send:
  - `Authorization: Bearer <supabase access token>`
  - `x-fuelwell-user-id: <auth user uuid>`
  - the existing `x-fuelwell-coach-secret`
- The Coach proxy now verifies the bearer token with Supabase before recording or enforcing usage.
- The proxy rejects requests when:
  - no Supabase session is provided
  - the session is invalid
  - the claimed user id does not match the verified session user
- Website tests now cover bearer-token parsing.
- Anthropic client tests now cover signed-in request headers and the missing-session failure path.

## Verification

- `npm run test:website`
- `npm run lint` (passes with the four existing warnings)
- `npx tsc --noEmit`
- `xcodegen generate --spec project.yml`
- `swiftlint --strict --config .swiftlint.yml`
- `scripts/check-feature-imports.sh`
- `scripts/check-theme-drift.sh`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AnthropicClientTests`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17'`

## Notes

This PR does not call Anthropic, apply Supabase migrations, or deploy the proxy. It hardens the request identity path so the later live Coach gate can prove cost caps against real signed-in users.
