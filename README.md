# PGI Website

The official web application for Paragon Global Investments. The site provides a public-facing website and a member portal where authenticated PGI members can access resources, internship listings, educational materials, and internal tools.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Authentication & Authorization](#authentication--authorization)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Production Build](#production-build)
- [Common Gotchas](#common-gotchas)
- [Portal & Subdomain Routing](#portal--subdomain-routing)

## Project Overview

This is the web platform for Paragon Global Investments, serving both public visitors and authenticated members. Public pages showcase the organization, while the member portal provides secure access to resources, directory, internships, pitches, and other internal tools. The application uses Supabase for authentication and data storage, with role-based access control for different member permission levels.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5.x
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Analytics**: Custom Supabase-backed pageviews, Web Vitals, and error collection
- **State Management**: SWR for data fetching
- **Form Handling**: React Hook Form
- **Deployment**: Cloudflare Workers (OpenNext)

## Getting Started (Local Development)

### Prerequisites

- Node.js 22.22+ (LTS version recommended)
- npm (comes with Node.js)
- A Supabase account and project ([create one here](https://supabase.com/home))

### Clone the Repository

```bash
git clone https://github.com/ParagonGlobalInvestments/pgi-website-v2.git
cd pgi-website-v2
```

### Install Dependencies

```bash
npm install
```

### Environment Variable Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - Get your project URL and keys from [Supabase Dashboard](https://supabase.com/home) → Project Settings → API
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Add `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, server-only)

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

### Required Variables

**Supabase (required for all features, contact CTO if needed):**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/publishable key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, never expose to client)

**Application:**

- `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., `http://localhost:3000` for dev)
- `NEXT_PUBLIC_PORTAL_ENABLED` - Must be explicitly set to `'true'` to enable the member portal and login route. When omitted or any other value, portal routes return 404 and the Log In button is hidden.

### Optional Variables

**Portal Subdomain:**

- `NEXT_PUBLIC_PORTAL_URL` - Full URL of the portal subdomain (e.g., `https://portal.paragoninvestments.org`). When set, auth callbacks redirect to this origin with clean URLs. Not needed for local dev or Workers previews.

**Feature Flags:**

- `NEXT_PUBLIC_SHOW_STATS` - Show home page statistics (default: `false`)
- `NEXT_PUBLIC_ENABLE_INTERNSHIPS` - Enable internships feature (default: `false`)
- `NEXT_PUBLIC_ENABLE_DIRECTORY` - Enable member directory feature (default: `false`)
- `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES` - Enable admin features (default: `true`)

**Other:**

- `ADMIN_EMAILS` - Comma-separated list of admin emails for the allowlist
- `NODE_ENV` - Automatically set by Next.js, do not manually set in `.env.local`

### What Breaks vs. What Degrades

**Missing Supabase variables:** The application will not function. Authentication and database operations will fail.

**Missing feature flags:** Features are hidden in production but automatically enabled in development mode (`NODE_ENV=development`).

See `.env.example` in the project root for a complete template with all variables listed.

## Authentication & Authorization

### Supabase Auth

All user authentication is handled by Supabase Auth. Users log in through Supabase (Google OAuth only — there is no self-service sign-up), and sessions are managed via cookies using `@supabase/ssr`. Only pre-existing PGI members in the database can access the portal.

### Middleware

Route protection and subdomain routing are handled by `src/middleware.ts`, which:

- Gates portal routes (404 when `NEXT_PUBLIC_PORTAL_ENABLED` is not `'true'`)
- Detects `portal.*` subdomain and rewrites requests to `/portal/*` transparently
- Exempts auth routes (`/login`, `/auth/*`, `/api/*`) from subdomain rewriting
- Redirects `/portal/*` paths on the subdomain to clean URLs (strips prefix)
- Allows public routes to pass through

Protected routes include `/portal/**`, `/login`, and `/__tests__/**`.

### User Roles

User roles are stored in the Supabase `users` table with the `org_permission_level` field:

- `admin` - Full access to all features and admin panels
- `lead` - Elevated permissions for chapter/team management
- `member` - Standard member access

### Row Level Security (RLS)

Supabase Row Level Security policies enforce data access at the database layer. Users can only access data they're authorized to see based on their role and relationships (e.g., chapter membership). This provides defense-in-depth security beyond application-level checks.

## Project Structure

```
pgi-website-v2/
├── .github/                # GitHub Actions workflows, issue/PR templates
├── docs/                   # Documentation and environment examples
├── public/                 # Static assets (images, icons, PDFs, etc.)
├── scripts/                # Utility scripts (migrations, sync, etc.)
├── supabase/               # Supabase migrations
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, API routes)
│   │   ├── (main)/         # Route group: home page, privacy, terms
│   │   ├── (site)/         # Route group: all public site pages with shared layout
│   │   ├── api/            # Backend API route handlers
│   │   │   ├── cms/        # CMS API (people, sponsors, timeline, upload)
│   │   │   └── users/      # User API (directory, profile)
│   │   ├── portal/         # Member portal routes
│   │   │   ├── (main)/     # Portal pages (directory, resources, content, settings)
│   │   │   └── logout/     # Logout handler
│   │   ├── login/          # Login page (Google OAuth)
│   │   └── auth/           # OAuth callback handler
│   ├── components/         # React components
│   │   ├── cms/            # CMS admin components (forms, editors)
│   │   ├── layout/         # Layout components (header, footer)
│   │   ├── portal/         # Portal UI (sidebar, mobile nav, loading skeleton)
│   │   ├── home/           # Homepage section components (client islands)
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core application modules
│   │   ├── auth/           # Auth utilities (checkMembership, requireAdmin)
│   │   ├── cms/            # CMS data fetching utilities
│   │   ├── supabase/       # Supabase clients and database layer
│   │   └── constants/      # Static data (companies, universities, resources)
│   ├── middleware.ts       # Next.js middleware for route protection
│   ├── types/              # TypeScript type definitions
│   └── utils.ts            # General utility functions
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.mjs     # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Workflow

### Common Scripts

- `npm run dev` - Start dev server at `http://localhost:3000`
- `npm run build` - Build Next.js and the Cloudflare Worker
- `npm run start` - Run the built Worker locally (after build)
- `npm run preview` - Build and run the Worker locally
- `npm run deploy` - Build and deploy the preview Worker to Cloudflare
- `npm run typegen` - Generate Wrangler binding types
- `npm run lint` - Run ESLint (warnings don't block, errors do)
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Linting

ESLint is configured to allow warnings but will fail on errors. The build process ignores linting errors (configured in `next.config.mjs`), but you should fix errors before committing. Warnings are acceptable and won't block builds or CI.

### Branching and Pull Requests

- Create feature branches from `main`: `git checkout -b feature/your-feature-name`
- Use conventional commit messages when possible
- Ensure `npm run lint` passes (no errors) before opening a PR
- PRs should have clear descriptions of changes

### AI-Assisted Development

AI code assistants (like Cursor, GitHub Copilot, etc.) can be helpful for this codebase, but use them carefully:

- **Plan agent tasks thoroughly** before execution
- **Review all generated code** - don't blindly accept suggestions
- **Verify environment variable handling** - ensure build-safe patterns are maintained
- **Do not create markdown files** - agents should only create `AGENTS.md` in the root directory (which will be created separately). All other documentation belongs in code comments or this README.
- **Test changes locally** - especially authentication flows and API routes
- **Check for Supabase patterns** - ensure generated code follows existing patterns for database access and auth

### Example: Adding a New Feature

When contributing a new feature, follow this structure:

1. **Create production components** in `src/components/` or `src/hooks/`
2. **Add internal QA routes** under `src/app/__tests__/[feature-name]/` for testing (these routes are automatically disabled in production)
3. **Add deployment documentation** in `docs/deploy/[feature-name].md` if needed
4. **Add helper scripts** in `scripts/dev/[feature-name]/` for development tooling

**Example:** The mobile document viewer feature demonstrates this pattern:

- Production code: `src/components/portal/MobileDocumentViewer.tsx`, `src/hooks/useIsMobile.ts`
- QA routes: `src/app/__tests__/mobile-document-viewer/*` (dev only)
- Deployment guide: `docs/deploy/mobile-document-viewer.md`
- Helper script: `scripts/dev/mobile-document-viewer/add-test-pitch-urls.ts`

## Production Build

### Building

```bash
npm run build
```

The build process:

- Compiles TypeScript
- Optimizes assets
- Generates static pages where possible
- Creates server-rendered routes for dynamic content
- Handles missing optional environment variables gracefully (build won't crash)

### Environment Parity

Ensure production environment variables match your local `.env.local` setup. The application is designed to be build-safe even if optional variables are missing, but required variables (Supabase) must be present for the application to function.

### Deployment

OpenNext targets the `pgi-website-v2` Worker on `workers.dev`, without production domains or cron. CI builds but does not deploy.

```bash
npm run preview       # Test locally at http://localhost:8787
npx wrangler login
npm run deploy        # Build and deploy to Cloudflare
```

Set public environment variables before building and server secrets in Cloudflare. For portal testing, use the preview URL as `NEXT_PUBLIC_APP_URL`, leave `NEXT_PUBLIC_PORTAL_URL` unset, and allow the callback URL in Supabase. The `IMAGES` binding needs availability/quota verification in Cloudflare.

Before deploying, enable R2 in the Cloudflare account and create a private bucket named `pgi-website-v2-cache`. OpenNext uses it for writable page caching; Wrangler creates the SQLite Durable Objects for revalidation automatically. For GitHub Builds, use `npm run build` and `npx opennextjs-cloudflare deploy` so the deployment also populates the cache. Local previews use emulated storage. CMS saves invalidate affected pages in their own environment; the database webhook described below also invalidates production when edits originate elsewhere. Social preview artwork refreshes on deployment.

OpenNext embeds local `.env*` values in the server bundle, so deploy from a clean build environment and keep `.open-next` private.

The build process disables webpack persistent caching in production to prevent disk space issues during builds.

## Database Migrations

SQL migrations are stored in `supabase/migrations/` with numbered prefixes (e.g., `001_`, `002_`).

### Applying Migrations

**Option 1: Supabase CLI (recommended)**

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Option 2: Manual SQL**
Copy the migration file contents and run in the Supabase SQL Editor (Dashboard → SQL Editor).

### Current Migrations

| File                                 | Purpose                                                  |
| ------------------------------------ | -------------------------------------------------------- |
| `001_security_performance_fixes.sql` | Users table, RLS policies, performance optimizations     |
| `002_observability_tables.sql`       | Analytics tables (obs_vitals, obs_pageviews, obs_errors) |

## Common Gotchas

### Missing Environment Variables

**Symptom:** Build succeeds but app crashes at runtime or features don't work.

**Solution:** Check that all required Supabase variables are set. The build process won't fail if env vars are missing, but runtime will. Check browser console and server logs for specific errors.

### Feature Flags Not Enabling Features

**Symptom:** Set `NEXT_PUBLIC_ENABLE_INTERNSHIPS=true` but feature still hidden.

**Solution:**

- Feature flags only control production behavior
- In development mode (`npm run dev`), features are automatically enabled regardless of flag values
- Ensure the flag is set to the string `"true"` (not boolean `true`)
- Redeploy after changing environment variables (they're baked into the build)
- Clear browser cache if needed

### Build Fails with Disk Space Errors

**Symptom:** `ENOSPC: no space left on device` during build.

**Solution:** The build configuration disables webpack persistent cache in production to prevent this. If you still encounter issues, free up disk space or check your system's available storage.

### TypeScript/ESLint Parser Warnings

**Symptom:** Warnings about TypeScript version mismatch with ESLint parser.

**Solution:** TypeScript is pinned to 5.5.4 for compatibility. If you see parser warnings, ensure `npm install` completed successfully and check that `package.json` specifies `typescript: "5.5.4"`.

## Portal & Subdomain Routing

The member portal supports three access patterns. Middleware handles all of them automatically.

### Production

Portal is accessed via subdomain with clean URLs:

```
portal.paragoninvestments.org/home
portal.paragoninvestments.org/settings
```

Middleware detects the `portal.` host prefix and rewrites requests to `/portal/*` internally. Auth routes (`/login`, `/auth/*`, `/api/*`) are exempt from rewriting since they live at the root level.

### Local Development

Access the portal via path-based routing:

```
http://localhost:3000/portal
```

Subdomain routing (`portal.*`) only activates in production.

**Important:** `NEXT_PUBLIC_PORTAL_ENABLED=true` must be in your `.env.local` for the portal to be accessible.

### Workers Preview Deployments

On the Worker’s `workers.dev` hostname, access the portal via path-based routing:

```
pgi-website-v2.paragon-national-group-account.workers.dev/portal
```

### How It Works

| Environment     | URL Pattern                           | Mechanism                            |
| --------------- | ------------------------------------- | ------------------------------------ |
| Production      | `portal.paragoninvestments.org/home`  | Middleware rewrites to `/portal`     |
| Local dev       | `portal.127.0.0.1.sslip.io:3000/home` | Same middleware rewrite via sslip.io |
| Local dev       | `localhost:3000/portal`               | Direct path, no rewrite needed       |
| Workers preview | `your-worker.workers.dev/portal`      | Direct path, no rewrite needed       |

If a user visits `portal.paragoninvestments.org/portal` (redundant prefix), middleware issues a 301 redirect to `portal.paragoninvestments.org/home` to enforce clean URLs.

## Analytics (Admin Only)

Admins can view site performance at `/portal/observability` (labeled "Analytics" in the sidebar). This includes:

- **Page Views & Visitors**: Traffic metrics with daily trends
- **Core Web Vitals**: LCP, FCP, CLS, TTFB, INP performance metrics
- **Error Tracking**: Client-side JavaScript errors

Data is collected automatically via the `VitalsCollector` component and stored in Supabase. See `supabase/migrations/002_observability_tables.sql` for the schema.

The cleanup handler remains at `/api/cron/cleanup-observability`; it requires `CRON_SECRET` and a replacement scheduler before production cutover. Set optional `NEXT_PUBLIC_DEPLOYMENT_ID` at build time to label collected metrics.

## CMS (Content Management)

Admins can manage dynamic site content via `/portal/content`. The CMS supports:

- **People**: Team members displayed on public pages (officers, founders, quant/value teams)
- **Sponsors**: Logo and link management with drag-and-drop image upload
- **Timeline**: Recruitment timeline events
- **Recruitment**: Key-value content for the application page
- **Statistics**: Homepage statistics (member count, AUM, etc.)

Content changes are saved to Supabase. CMS saves invalidate the current environment's page cache. Database notifications also invalidate production's cache, so edits made locally or directly in Supabase refresh the public site after notification delivery and the next page visit. Already-open browser tabs need a refresh.

### Database-driven cache invalidation

The database sends `POST /api/revalidate` after changes commit. This endpoint accepts only `INSERT`, `UPDATE`, and `DELETE` events from the supported public tables, authenticated with `Authorization: Bearer <CMS_REVALIDATION_SECRET>`. Event metadata is sent in `X-PGI-Schema`, `X-PGI-Table`, and `X-PGI-Event` headers so invalidation also works when the HTTP transport loses the POST body. JSON-only notifications remain supported. The endpoint does not depend on a portal login or on the portal feature flag. Notifications contain only schema, table, and event type; member records and email addresses are never sent.

Production setup (once per Supabase project):

1. Generate a random secret (at least 32 random bytes) in your password manager. Set it as the `CMS_REVALIDATION_SECRET` Worker secret in Cloudflare. Keep it out of `wrangler.jsonc`, public build variables, and source control.
2. Deploy the application with `/api/revalidate` before enabling database notifications.
3. In Supabase **Vault**, create `cms_revalidation_url` with value `https://paragoninvestments.org/api/revalidate` and `cms_revalidation_secret` with the same secret as Cloudflare. Use the Vault UI so the credential does not appear in SQL history.
4. Apply `supabase/migrations/013_cms_cache_invalidation.sql`, then `014_cms_webhook_metadata_headers.sql`, in the Supabase SQL Editor. These enable `pg_net` and Vault if necessary, install statement-level triggers on the ten tables below, and configure metadata headers. If 013 is already installed, apply only 014. Existing Vault secrets and triggers are reused. No additional Dashboard Database Webhooks are needed.

| Database tables                                                                                            | Pages invalidated                                     |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `cms_people`, `users`, `alumni_people`, `user_public_group_memberships`, `alumni_public_group_memberships` | Officers, founders, value team, quant team, and apply |
| `cms_recruitment`                                                                                          | Apply                                                 |
| `cms_statistics`                                                                                           | Home                                                  |
| `cms_timeline`                                                                                             | Who we are                                            |
| `cms_sponsors`                                                                                             | Home and sponsors                                     |
| `resources`                                                                                                | Resources API (already served dynamically)            |

People changes invalidate all people pages because profiles can be shared across groups, and deletes or moves must also refresh the previous group. Statement-level triggers queue a notification per table event, including bulk imports, rather than per row. `pg_net` delivers asynchronously after commit, so rolled-back edits do not send a notification. Existing CMS API invalidation remains in place.

Local `npm run dev` reads fresh data and invalidates its own cache on CMS saves. If it points at the production Supabase project, its edits automatically notify production through the same database triggers; it needs no production cache bindings or webhook secret. For local endpoint tests, set `CMS_REVALIDATION_SECRET` in `.env.local`. A separate staging database should configure its Vault URL to its own deployment.

All eight CMS-backed public pages inherit a 300-second fallback from their Supabase data requests. The interval is defined once as `CMS_REVALIDATE_SECONDS` in `src/lib/cms/queries.ts`; no per-page `revalidate` exports are needed. Development requests bypass the persistent data cache. This is request-driven ISR: the first request after expiry can receive the old page while regeneration runs. Missing configuration or queue failures never roll back an edit; they produce a database warning and rely on the timed fallback. HTTP failures and timeouts do not retry automatically. Inspect recent deliveries without exposing the authorization header:

```sql
SELECT id, status_code, timed_out, error_msg, created
FROM net._http_response
ORDER BY created DESC
LIMIT 20;
```

To verify setup, make a small CMS edit locally, wait for a `200` webhook response, and reload the affected production page. Use the production CMS or trigger another supported edit to invalidate content changed before the triggers were installed; deploying the new build also refreshes the page cache.
