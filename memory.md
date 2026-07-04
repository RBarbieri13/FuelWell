# FuelWell — Project Memory

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth:** Supabase Auth (Google OAuth + email/password)
- **Database:** Supabase (PostgreSQL) — 10 tables with RLS
- **Styling:** Tailwind CSS v4 with custom FuelWell design tokens
- **Icons:** Lucide React
- **Package Manager:** bun

## Architecture
- Route groups: `(marketing)`, `(auth)`, `(app)` for clean URL separation
- `src/proxy.ts` replaces `middleware.ts` (Next.js 16 convention)
- Supabase client/server split: `src/lib/supabase/{client,server}.ts`
- Macro calculator: `src/lib/macros.ts` (Mifflin-St Jeor equation)

## Current State (2026-03-26)
- **28 source files**, 12 routes, all compiling clean (0 errors)
- Foundation complete: auth, app shell, dashboard, onboarding wizard, macro engine
- Database migration SQL ready at `supabase/migration.sql`
- Dashboard wired to real Supabase data (profiles + daily_logs)
- 10-step onboarding wizard saves to profiles and calculates macros

## Next Steps
1. Run migration SQL in Supabase dashboard
2. Configure Google OAuth in Supabase Auth settings
3. Set `.env.local` with Supabase credentials
4. Build out Coach page (AI chat interface)
5. Build meal logging flow (search, photo, barcode)
6. Build recipe system
7. Build progress tracking with charts

## Key Decisions
- Used proxy.ts instead of middleware.ts (Next.js 16 deprecation)
- Macro splits: Lose (35/35/30), Maintain (30/40/30), Gain (30/45/25)
- Minimum 1200 calories enforced for safety
- Auto-profile trigger creates profile on auth.users insert
