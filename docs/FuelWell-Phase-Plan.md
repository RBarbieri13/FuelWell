# FuelWell — Internal Phase Plan

Sequential reference checklist. No fixed dates. Everyone on a single pilot plan; full 7-feature MVP with real database and real function.

## Guiding Principle

From the Inspiration Guide (CTO version): every screen answers **"what should I do right now?"** before it shows data. FuelWell is a real-time decision system, not a tracker. If a screen only shows numbers, it is wrong.

## Phase 0 — Pre-build alignment
- [ ] Resolve all 12 gap-analysis items with Max
- [ ] Re-read Inspiration Guide (CTO version); extract decision-engine principles into `ios/PRINCIPLES.md`
- [ ] Lock the 7-feature MVP scope in writing; freeze additions until pilot ships
- [ ] Decide repo layout (`/` Next.js stays, `/ios` for Xcode project)

## Phase 1 — Foundations
- [ ] Xcode project, Swift 6, SPM module structure
- [ ] TCA installed, app shell + root reducer
- [ ] SQLiteData local store, Supabase client wired
- [ ] Design system: tokens ported from `src/lib/design-tokens.ts` to Swift; Outfit / Inter / DM Sans loaded; emerald / orange / violet palette
- [ ] Auth flow (Supabase) — sign up, sign in, session persistence
- [ ] CI: GitHub Actions for iOS build + lint, Fastlane match for certs

## Phase 2 — Data & backend
- [ ] Supabase schema: users, profiles, meals, foods, recipes, grocery_items, progress_entries, coach_messages, restaurants
- [ ] RLS policies per table
- [ ] HealthKit integration (read scope confirmed in Phase 0)
- [ ] AI provider integration + per-user cost guardrails
- [ ] Sync layer between SQLiteData and Supabase

## Phase 3 — Core features (the 7)
Each feature is "done" when it answers a decision, not just displays data.
- [ ] **Macro tracking** — log meal → instant "are you on track?" verdict
- [ ] **AI coaching chat** — context-aware, has memory of user's day
- [ ] **Proactive coaching** — push notifications triggered by user state
- [ ] **Restaurant guidance** — "what should I order here?"
- [ ] **Recipe suggestions** — "what should I cook tonight given what's left?"
- [ ] **Grocery lists** — generated from selected recipes + staples
- [ ] **Progress tracking** — trend + projection + next action

## Phase 4 — Connective tissue
- [ ] Onboarding flow (goal, baseline macros, dietary constraints)
- [ ] Settings, account, data export, sign out
- [ ] Empty states across every screen
- [ ] Error & offline states
- [ ] Pilot plan flag — no tier gating, all features unlocked for pilot users

## Phase 5 — Quality
- [ ] Reducer tests for all 7 features
- [ ] Snapshot tests for key screens
- [ ] Critical-path UI tests (onboarding → log meal → see progress)
- [ ] Accessibility pass (VoiceOver, Dynamic Type, contrast)
- [ ] Performance: cold launch < 400ms, 60fps scrolling
- [ ] AI cost monitoring dashboard

## Phase 6 — Pilot ship
- [ ] TestFlight build uploaded
- [ ] 30 pilot users invited (list pulled from Founders 100 signups)
- [ ] In-app feedback channel (Linear or email)
- [ ] Crash reporting (Sentry or Apple)
- [ ] Analytics: feature usage and decision-engine engagement (did they follow the recommendation?)

## Phase 7 — Pilot → Founding 100 hardening
- [ ] Triage pilot feedback, fix top issues
- [ ] Introduce tier gating (Pro vs Premium) per Master_v2 matrix
- [ ] Stripe or RevenueCat for subscriptions
- [ ] Founders 100 lifetime pricing wired in
- [ ] Web ↔ app account linkage (signups from site land in app)
- [ ] App Store submission

---

*Phases run sequentially. Phase 0 must be fully checked before Phase 1 begins.*
