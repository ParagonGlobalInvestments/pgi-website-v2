# AGENTS.md — PGI Portal Codebase Reference

Single source of truth for AI coding agents working in the PGI Website codebase. Human developers supervising agents should also reference this document.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.5 (strict mode) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage (resources) |
| Styling | Tailwind CSS 3 + shadcn/ui + Radix UI |
| Animation | Framer Motion, GSAP |
| Analytics | PostHog, Vercel Analytics, Vercel Speed Insights |
| Hosting | Vercel |
| CI | GitHub Actions |

---

## Dev Server

```bash
npm run dev
# Runs: next dev (plain HTTP on localhost:3000)
```

Dev server runs at `http://localhost:3000`. Portal is accessed via `/portal` path locally (subdomain routing only active in production).

---

## Project Structure

```
.codex/                          # Cursor IDE context configuration
scripts/                         # Development utilities (seed-cms.ts, import-members.ts)
supabase/
├── migrations/                  # Numbered SQL migrations (001_, 002_, etc.)
src/
├── app/                         # Next.js App Router pages
│   ├── (main)/                  # Route group: public marketing pages (home, privacy, terms)
│   ├── (site)/                  # Route group: public site pages with shared StandaloneLayout
│   │   ├── about/               # /about
│   │   ├── apply/               # /apply (recruitment — national + UChicago)
│   │   ├── contact/             # /contact
│   │   ├── education/           # /education
│   │   ├── investment-strategy/ # /investment-strategy
│   │   ├── members/             # /members, /quant-team, /value-team
│   │   ├── national-committee/  # /national-committee, /officers, /founders
│   │   ├── placements/          # /placements (company logos)
│   │   ├── resources/           # /resources (public, non-portal)
│   │   ├── sponsors/            # /sponsors
│   │   └── who-we-are/          # /who-we-are
│   ├── api/
│   │   ├── cms/                 # CMS API: people, sponsors, timeline, recruitment, statistics, upload
│   │   └── users/               # REST API: /api/users, /api/users/me
│   ├── auth/callback/           # OAuth callback route (Supabase)
│   ├── portal/                  # Authenticated portal
│   │   ├── (main)/              # Portal pages with shared sidebar layout
│   │   │   ├── directory/       # Member directory
│   │   │   ├── resources/       # Resource viewer (PDFs, spreadsheets)
│   │   │   ├── content/         # CMS admin (admin only)
│   │   │   └── settings/        # Profile settings
│   │   └── logout/              # Logout page
│   ├── login/                   # Login page (Google OAuth)
│   └── layout.tsx               # Root layout
├── components/
│   ├── analytics/               # PostHog trackers (company, form, PDF, university)
│   ├── cms/                     # CMS admin components (forms, editors)
│   ├── layout/                  # Header, Footer, StandaloneLayout
│   ├── portal/                  # Portal UI components (sidebar, mobile nav, loading)
│   ├── providers/               # PostHogProvider
│   ├── reactbits/               # Third-party animation components (CountUp, ShinyText, etc.)
│   └── ui/                      # shadcn/ui + custom (detail-panel, button, dialog, etc.)
├── hooks/
│   ├── useIsMobile.ts           # Mobile viewport detection (768px)
│   └── useSupabaseUser.ts       # Fetches user via /api/users/me
├── lib/
│   ├── auth/                    # Auth utilities (checkMembership, requireAdmin)
│   ├── cms/                     # CMS data fetching utilities
│   ├── constants/               # Static data (companies, universities, resources)
│   ├── supabase/                # Supabase clients (browser, server, admin, database)
│   ├── posthog.ts               # PostHog initialization
│   └── runtime.ts               # Portal availability (portalEnabled)
├── types/
│   └── index.ts                 # Core types: User, UserRole, UserProgram, ApiResponse
├── middleware.ts                 # Edge middleware: portal gating + subdomain routing
├── utils.ts                     # cn(), formatDate(), truncateText()
└── tailwind.css                 # Tailwind entry point
```

---

## Authentication Architecture

Authentication uses **Supabase Auth** exclusively. There is no NextAuth in the codebase.

### Auth Flow

1. User clicks "Log In" → `/login` page
2. Supabase Auth initiates Google OAuth
3. Callback → `/auth/callback/route.ts`
4. Callback uses `checkMembership()` utility (`src/lib/auth/checkMembership.ts`) which checks in order:
   - `ADMIN_EMAILS` env var allowlist
   - `users` table by `supabase_id` (already linked)
   - `users` table by `email` or `alternate_emails` → auto-links `supabase_id`
5. Non-members: signed out, redirected to `/resources?notMember=true`
6. Members: redirected to `/portal` (or subdomain if configured)

### checkMembership Utility

The `checkMembership()` function centralizes membership verification logic:

```typescript
import { checkMembership } from '@/lib/auth/checkMembership';

const result = await checkMembership(email, supabaseId);
// Returns: { isMember, user, dbId, isAdminAllowlist }
```

Used by: auth callback, `/api/users/me`, and `requireAdmin()` middleware.

### Auth Enforcement

- **Edge middleware** (`src/middleware.ts`): Hard-blocks portal routes (404) when `NEXT_PUBLIC_PORTAL_ENABLED !== 'true'`. No Supabase imports — runs on Edge runtime.
- **Portal layout** (`src/app/portal/layout.tsx`): Server-side auth check. Redirects unauthenticated users to `/login?redirectTo=/portal`. This is the secure choke point.
- **API routes**: Each route calls `requireSupabaseServerClient()` + `supabase.auth.getUser()` independently.

### Subdomain Routing

Middleware detects `portal.*` hostname prefix:
- Non-portal paths on subdomain → rewritten to `/portal/*` (transparent to user)
- `/portal/*` paths on subdomain → 301 redirect to strip prefix (clean URLs)
- Auth/API routes (`/login`, `/auth/*`, `/api/*`, `/resources`) pass through unmodified

---

## Database Schema

Single `users` table in Supabase PostgreSQL:

```sql
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  alternate_emails text[] DEFAULT '{}',
  role            text NOT NULL DEFAULT 'analyst'
                  CHECK (role IN ('admin', 'committee', 'pm', 'analyst')),
  program         text CHECK (program IN ('value', 'quant') OR program IS NULL),
  school          text NOT NULL,
  graduation_year int,
  linkedin_url    text,
  github_url      text,
  supabase_id     text UNIQUE,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### Roles

| Role | Description |
|------|-------------|
| `admin` | Full access |
| `committee` | National committee member |
| `pm` | Portfolio manager |
| `analyst` | Default role for new members |

### Row Level Security (RLS)

- `SELECT`: Any authenticated user can view all members (directory)
- `UPDATE`: Users can update their own row only (`supabase_id` match)
- Service role key bypasses RLS (used in API routes with admin client)

**Performance Note:** RLS policies should use `(select auth.uid())` instead of `auth.uid()` directly. The subquery pattern is ~10x faster because PostgreSQL can optimize it as a constant. See migration `001_security_performance_fixes.sql`.

### Database Access Pattern

All database operations go through `SupabaseDatabase` class in `src/lib/supabase/database.ts`:

```typescript
import { createDatabase } from '@/lib/supabase/database';

const db = createDatabase();                          // Uses server client
const db = createDatabase(requireSupabaseAdminClient()); // Bypasses RLS
```

Available methods:
- `getUsers(filters?)` — Directory listing with optional school/program/role/search filters
- `getUserBySupabaseId(id)` — Auth lookup
- `getUserByEmail(email)` — Primary email lookup
- `getUserByAnyEmail(email)` — Primary + alternate emails lookup (returns `dbId` for linking)
- `updateUserProfile(id, updates)` — Update name, linkedin_url, github_url
- `linkSupabaseId(userId, supabaseId)` — Link auth ID to user row

---

## Supabase Client Usage

Three client factories, each with a build-safe (`get*`) and runtime-required (`require*`) variant:

### Browser (`'use client'` components)

```typescript
import { createClient } from '@/lib/supabase/browser';
const supabase = createClient(); // Build-safe on SSR, throws in browser if env missing
```

### Server (API routes, server components)

```typescript
// Build-safe (returns null if env vars missing):
import { getSupabaseServerClient } from '@/lib/supabase/server';
const supabase = getSupabaseServerClient();

// Runtime-required (throws if env vars missing):
import { requireSupabaseServerClient } from '@/lib/supabase/server';
const supabase = requireSupabaseServerClient();
```

### Admin (server-side only, bypasses RLS)

```typescript
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
const admin = requireSupabaseAdminClient(); // NEVER use in browser code
```

### Rules

- Never create Supabase clients directly — always use factory functions
- Never use admin client in browser code
- Never use browser client in server components
- Use `getSupabase*Client()` in pages/layouts that might be prerendered
- Use `requireSupabase*Client()` in API routes (safe to throw at runtime)

---

## API Routes

### `GET /api/users/me`

Returns the current authenticated user's profile. Auto-links `supabase_id` on first login via email/alternate_emails fallback.

### `PATCH /api/users/me`

Updates profile fields: `name`, `linkedinUrl`, `githubUrl`. Validates LinkedIn/GitHub URL format. Only the authenticated user can update their own profile.

### `GET /api/users`

Returns all users for the directory. Supports query params: `school`, `program`, `role`, `search`.

### Response Format

```typescript
{ success: boolean; data?: T; error?: string }
// Or for user endpoints:
{ success: boolean; user?: User; error?: string }
```

---

## Environment Variables

### Required

| Variable | Context | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + Runtime | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build + Runtime | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime only | Admin operations (server-side) |
| `NEXT_PUBLIC_PORTAL_ENABLED` | Build + Runtime | Must be `'true'` to enable portal |

### Optional

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL for redirects |
| `NEXT_PUBLIC_PORTAL_URL` | Subdomain URL (e.g., `https://portal.paragoninvestments.org`) |
| `ADMIN_EMAILS` | Comma-separated admin email allowlist |
| `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES` | Default `true` — set `'false'` to hide admin UI |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://us.i.posthog.com`) |

### Build Safety Rules

- Never assume env vars exist at build time
- `getSupabase*Client()` returns `null` if env vars are missing (safe for prerendering)
- `requireSupabase*Client()` throws only at runtime (use in API routes)
- Feature flags degrade gracefully (features hidden, not broken)
- `next.config.mjs` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` as safety nets

---

## Portal Gating

Portal availability is controlled by a single source of truth:

```typescript
// src/lib/runtime.ts
export const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === 'true';
```

Three enforcement points:
1. **Middleware**: Returns 404 for `/portal/*`, `/login`, `/__tests__/*` when disabled
2. **Server layouts**: `assertPortalEnabledOrNotFound()` for page-level enforcement
3. **API routes**: `requirePortalEnabledOr404()` returns 404 JSON response when disabled

Never check `process.env.NEXT_PUBLIC_PORTAL_ENABLED` directly — import from `@/lib/runtime`.

---

## CI Pipeline

**File:** `.github/workflows/ci.yml`

Triggers: push to `main`/`develop`, PRs targeting `main`/`develop`

Steps (sequential):
1. `npm ci` — Install dependencies
2. `npm run lint` — ESLint (non-blocking, `continue-on-error: true`)
3. `npm run build` — Next.js build (generates `.next/types` for App Router validation)
4. `npm run type-check` — `tsc --noEmit` (blocking — must pass)

### TypeScript Strictness

`tsconfig.json` enforces:
- `strict: true`
- `noImplicitAny: true`
- `noImplicitReturns: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `forceConsistentCasingInFileNames: true`

The `include` array contains `.next/types/**/*.ts`, which means App Router export validation (generated by `next build`) is also checked by `tsc --noEmit`. Page files can only export `default` and Next.js-specific named exports (`metadata`, `generateStaticParams`, etc.).

---

## Key Patterns to Follow

### Adding a New Portal Home Page

1. Create `src/app/portal/[feature]/page.tsx`
2. Mark with `'use client'` if interactive
3. Use `useSupabaseUser()` hook for user data
4. Use components from `@/components/ui`
5. Follow existing styling (Tailwind + PGI brand colors)

### Adding a New API Route

1. Create `src/app/api/[feature]/route.ts`
2. Export `const dynamic = 'force-dynamic'`
3. Call `requirePortalEnabledOr404()` at top of handler
4. Call `requireSupabaseServerClient()` + `supabase.auth.getUser()`
5. Return 401 if not authenticated
6. Use `createDatabase()` for DB operations
7. Return `{ success: boolean, data?, error? }` format

### Adding a New Public Page

1. Create `src/app/[page-name]/page.tsx` and `layout.tsx`
2. Layout wraps with `StandaloneLayout` or the `(main)` route group layout
3. Use PGI brand colors: `navy` (#00172B), `darkNavy` (#000F1D), `pgi-dark-blue` (#0A192F), `pgi-light-blue` (#1F2A44)
4. Use Montserrat font (`font-montserrat` or `font-sans`)
5. Use Framer Motion for animations (`fadeIn`, `staggerContainer` patterns)

---

## What Agents Can Do

- Fix lint, type, and build errors
- Refactor code without changing behavior
- Add new pages/routes following existing patterns
- Update dependencies with proper testing
- Clean unused code and technical debt
- Improve type safety
- Fix build safety issues (missing env var handling)

## What Agents Must NOT Do

- Modify auth system (Supabase Auth setup, middleware logic, callback route)
- Change database schema (SQL migrations, RLS policies)
- Remove dependencies without verifying they're unused
- Break API response formats
- Use admin client in browser code
- Assume env vars exist at build time
- Create markdown files other than AGENTS.md and README.md
- Make silent architectural changes without explicit approval

---

## Validation Checklist

Before merging agent-generated code:

- [ ] `npm run build` completes successfully
- [ ] `npm run type-check` (`tsc --noEmit`) passes with 0 errors
- [ ] `npm run lint` passes (warnings acceptable)
- [ ] No admin client usage in browser code
- [ ] Supabase client usage follows factory patterns
- [ ] Environment variables handled safely (build won't crash if optional vars missing)
- [ ] Portal gating uses `@/lib/runtime` (not direct env var checks)
- [ ] API routes return expected response format
- [ ] No breaking changes to existing functionality

---

## Resources System

Resources are statically defined in `src/lib/constants/resources.ts` with URLs pointing to Supabase Storage:

```
Base URL: https://mgdwgpjqtzfzirfxaoun.supabase.co/storage/v1/object/public/resources/
```

**Categories:** Education (9 items), Recruitment (16 items), Pitches (10 items)

**Types:** `'pdf' | 'doc' | 'sheet' | 'folder'`

Mobile users get an in-app preview via `MobileDocumentViewer` for PDFs and spreadsheets. Desktop users open resources in a new tab.

---

## CMS (Content Management System)

The CMS enables admins to manage dynamic content via the portal at `/portal/content`.

### CMS Tables

| Table | Purpose |
|-------|---------|
| `cms_people` | Team members displayed on public pages (officers, founders, teams) |
| `cms_sponsors` | Sponsor logos and links for the sponsors page |
| `cms_timeline` | Recruitment timeline events |
| `cms_recruitment` | Key-value pairs for recruitment page content |
| `cms_statistics` | Key-value pairs for homepage statistics |

### CMS API Routes

All CMS routes require admin authentication (`requireAdmin()` middleware).

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/cms/people` | GET, POST | List/create people |
| `/api/cms/people/[id]` | PATCH, DELETE | Update/delete person |
| `/api/cms/people/reorder` | PATCH | Reorder display order |
| `/api/cms/sponsors` | GET, POST | List/create sponsors |
| `/api/cms/sponsors/[id]` | PATCH, DELETE | Update/delete sponsor |
| `/api/cms/timeline` | GET, POST | List/create timeline items |
| `/api/cms/timeline/[id]` | PATCH, DELETE | Update/delete timeline item |
| `/api/cms/recruitment` | GET, PUT | Get/update recruitment content |
| `/api/cms/statistics` | GET, PUT | Get/update homepage statistics |
| `/api/cms/upload` | POST | Upload images to Supabase Storage |

### CMS Patterns

**Upsert Pattern:** Recruitment and statistics routes use Supabase's `upsert()` with `onConflict: 'key'` for atomic updates. Old keys are selectively deleted rather than delete-all + insert.

**Image Uploads:** Sponsor logos can be uploaded to Supabase Storage (`cms-assets` bucket) via `/api/cms/upload`. The `SponsorForm` component supports drag-and-drop with preview.

**Backward Compatibility:** Image URLs support both legacy `/sponsors/logo.png` paths and full Supabase Storage URLs via the `getImageSrc()` helper.

---

## Company & University Data

Static constants in `src/lib/constants/`:
- `companies.ts` — Investment Banking, Quant/Tech, Asset Mgmt/Consulting, Sponsors, Partners
- `universities.ts` — Chapter data for 8 universities
- `resources.ts` — Education, Recruitment, and Pitch resources

---

## Portal Components

The portal sidebar and navigation are extracted into reusable components in `src/components/portal/`:

| Component | Purpose |
|-----------|---------|
| `PortalSidebar` | Desktop collapsible sidebar with navigation and user info |
| `PortalMobileNav` | Mobile navigation bar + full-screen overlay menu |
| `PortalLoadingSkeleton` | Loading skeleton matching sidebar + content layout |
| `constants.ts` | NAV_ITEMS, SCHOOL_LABELS, ROLE_LABELS, SIDEBAR_VARIANTS |
| `types.ts` | PortalNavItem, PortalUserInfo, PortalSidebarProps, PortalMobileNavProps |

The main portal layout (`src/app/portal/(main)/layout.tsx`) manages state and composes these components.

---

## Analytics / Observability System

A custom analytics system for tracking Core Web Vitals, page views, and errors. Admin-only page at `/portal/observability` (labeled "Analytics" in the portal sidebar).

### Components

| File | Purpose |
|------|---------|
| `src/components/observability/VitalsCollector.tsx` | Client-side collector using web-vitals package |
| `src/app/api/observability/vitals/route.ts` | Core Web Vitals collection endpoint |
| `src/app/api/observability/pageviews/route.ts` | Page view tracking endpoint |
| `src/app/api/observability/errors/route.ts` | Client-side error collection endpoint |
| `src/app/api/observability/stats/route.ts` | Admin analytics data API |
| `src/app/portal/(main)/observability/page.tsx` | Admin analytics UI |

### Database Tables

| Table | Purpose | Retention |
|-------|---------|-----------|
| `obs_vitals` | Raw Core Web Vitals (LCP, FCP, CLS, TTFB, INP) | 30 days |
| `obs_pageviews` | Page views and custom events | 30 days |
| `obs_errors` | Client-side JavaScript errors | 7 days |
| `obs_vitals_hourly` | Aggregated hourly metrics | 90 days |
| `obs_pageviews_daily` | Daily traffic aggregates | 1 year |

### Design Principles

- **Zero cost**: Uses Supabase free tier (500MB limit)
- **Graceful degradation**: Never breaks the app if tables missing
- **Non-blocking**: Collection endpoints always return success
- **Rate limited**: Prevents abuse (100 vitals, 50 pageviews, 20 errors per minute per IP)
- **Privacy-first**: No IP addresses stored, anonymous session IDs

Migration file: `supabase/migrations/002_observability_tables.sql`

---

## Branch & Commit Conventions

**Branches:**
- `main` — Production source of truth
- `live-version` — Emergency rollback snapshot
- Feature branches: `feat/[description]`, `fix/[description]`, `refactor/[description]`

**Commits:** Use conventional commit format (`fix:`, `feat:`, `refactor:`, `chore:`, `docs:`)

**Agent attribution:** Include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` for significant agent work.
