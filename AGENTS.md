# Agent Development Guide

This document is the single source of truth for agentic-assisted development in the PGI Website codebase. All AI coding agents and human developers supervising agents must follow these rules.

## Purpose of Agent Usage

Agents are used in this repository to:

- Fix linting errors and warnings systematically
- Refactor code to improve maintainability without changing behavior
- Scaffold new features following established patterns
- Update dependencies safely
- Clean technical debt incrementally
- Assist with repetitive tasks that follow clear patterns

Agents are expected to solve problems that are:

- Repetitive and pattern-based
- Well-defined with clear success criteria
- Non-architectural (no auth system changes, no schema changes)
- Validatable through automated checks (lint, build, tests)

## Allowed Agent Actions

Agents may perform the following actions:

- **Lint fixes**: Fix ESLint errors and warnings, following existing patterns
- **Refactors**: Extract repeated code, improve type safety, optimize imports
- **Feature scaffolding**: Create new API routes, pages, or components following existing patterns
- **Dependency updates**: Update package versions with proper testing
- **Documentation edits**: Update README.md or AGENTS.md only
- **Build safety improvements**: Fix build failures, handle missing env vars gracefully
- **Code cleanup**: Remove unused code, fix TypeScript errors, improve type definitions

## Disallowed Agent Actions

Agents must NOT perform the following actions:

- **Creating new markdown files**: Only README.md and AGENTS.md may exist (deployment guides go in `docs/deploy/`)
- **Creating QA/test routes outside `__tests__` namespace**: All internal QA and testing routes must be under `src/app/__tests__/[feature-name]/` and must include production guards
- **Silent architectural changes**: No changes to auth system, database schema, or core architecture without explicit approval
- **Auth system modifications**: No changes to Supabase Auth setup, middleware logic, or NextAuth configuration without human sign-off
- **Database schema changes**: No SQL migrations, table alterations, or RLS policy changes without human review
- **Mass dependency removals**: No removing dependencies without verifying they're unused
- **Breaking API contracts**: No changes to API route response formats without coordination
- **Environment variable assumptions**: No code that assumes env vars exist at build time

## Core Architectural Rules (Agents Must Follow)

### Supabase Auth + RLS

- All user authentication uses Supabase Auth
- Row Level Security (RLS) policies enforce data access at the database layer
- Never bypass RLS unless using admin client in server-side API routes
- User roles (`admin`, `lead`, `member`) are stored in `users.org_permission_level`

### Middleware-Based Protection

- Route protection and subdomain routing are handled by `src/middleware.ts`
- Portal gating: routes return 404 when `NEXT_PUBLIC_PORTAL_ENABLED` is not `'true'`
- Subdomain routing: `portal.*` host prefix rewrites to `/portal/*` transparently
- Auth routes (`/sign-in`, `/sign-up`, `/auth/*`, `/api/*`) are exempt from subdomain rewriting
- Protected routes: `/portal/**`, `/dashboard/**`, `/sign-in`, `/sign-up`, `/__tests__/**`
- Do not add route protection logic in individual pages or components

### Supabase Client Usage Patterns

**Browser Components (`'use client'`):**

```typescript
import { createClient } from '@/lib/supabase/browser';
const supabase = createClient();
```

**Server Components / API Routes:**

```typescript
import { requireSupabaseServerClient } from '@/lib/supabase/server';
const supabase = requireSupabaseServerClient();
```

**Admin Operations (API Routes Only):**

```typescript
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
const adminClient = requireSupabaseAdminClient();
```

**Never:**

- Use admin client in browser code
- Use browser client in server components
- Create Supabase clients directly (always use factory functions)

### NextAuth Scope Limitation

- NextAuth is used **only** for Google OAuth on `/resources` page
- NextAuth routes: `/api/nextauth/**`
- NextAuth does NOT handle member portal authentication
- Do not extend NextAuth to other pages or features

### Database Operations

- Use `createDatabase()` from `@/lib/supabase/database` in API routes
- Database operations go through the `SupabaseDatabase` class
- Never write raw SQL in application code
- RLS policies handle authorization automatically

## Environment Variable Rules

### Required Variables

**Supabase (required for all features):**

- `NEXT_PUBLIC_SUPABASE_URL` - Build will fail if missing
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Build will fail if missing
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only, runtime failure if missing

**Application:**

- `NEXT_PUBLIC_APP_URL` - Used for redirects and links
- `NEXT_PUBLIC_PORTAL_ENABLED` - Must be `'true'` to enable portal, sign-in, sign-up routes

**Google OAuth (required only for `/resources` page):**

- `GOOGLE_CLIENT_ID` - Only needed if `/resources` page is used
- `GOOGLE_CLIENT_SECRET` - Only needed if `/resources` page is used
- `NEXTAUTH_SECRET` - Only needed if `/resources` page is used
- `NEXTAUTH_URL` - Only needed if `/resources` page is used
- `NEXTAUTH_BASE_PATH` - Set to `/api/nextauth`
- `PGI_REQUIRE_EDU` - Require `.edu` email for resources page (default: `true`)

### Optional Variables

**Portal Subdomain:**

- `NEXT_PUBLIC_PORTAL_URL` - Portal subdomain URL for cross-domain redirects (e.g., `https://portal.paragoninvestments.org`)

**Feature Flags:**

- `NEXT_PUBLIC_SHOW_STATS` - Default: `false`
- `NEXT_PUBLIC_ENABLE_INTERNSHIPS` - Default: `false`
- `NEXT_PUBLIC_ENABLE_DIRECTORY` - Default: `false`
- `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES` - Default: `true`

**Analytics:**

- `NEXT_PUBLIC_POSTHOG_KEY` - Optional analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - Default: `https://us.i.posthog.com`

**Other:**

- `ADMIN_EMAILS` - Comma-separated admin email allowlist
- `NODE_ENV` - Automatically set by Next.js, do not set manually

### Build-Safe Patterns

**Correct (build-safe):**

```typescript
// Returns null if env vars missing, doesn't throw
const client = getSupabaseServerClient();
if (!client) {
  return <div>Configuration error</div>;
}
```

**Correct (runtime-only failure):**

```typescript
// Throws only at runtime, not during build
const client = requireSupabaseServerClient();
```

**Incorrect (build failure):**

```typescript
// Throws during build if env var missing
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
```

### Environment Variable Handling Rules

- Never assume env vars exist at build time
- Use `getSupabaseServerClient()` in server components (returns null if missing)
- Use `requireSupabaseServerClient()` in API routes (throws at runtime if missing)
- Feature flags degrade gracefully (features hidden, not broken)
- Missing optional vars should not crash the application

## Prompt Templates

### Fixing Lint/Build Failures

```
Fix all ESLint errors in the codebase.

Scope:
- Fix only errors (not warnings unless explicitly requested)
- Do not change runtime behavior
- Follow existing code patterns

Constraints:
- No new dependencies
- No architectural changes
- Preserve existing functionality

Validation:
- Run `npm run lint` and verify 0 errors
- Run `npm run build` and verify success
- No new markdown files created
```

### Refactoring a Component Safely

```
Refactor [component-path] to [specific improvement].

Scope:
- [Specific changes to make]
- [Files that may be affected]

Constraints:
- Maintain exact same functionality
- Preserve all props and behavior
- Follow existing component patterns
- Use TypeScript types from `src/types/`

Validation:
- Component renders identically
- All props work as before
- No TypeScript errors
- Lint passes
```

### Adding a New API Route

```
Create a new API route at `/api/[feature]/route.ts`.

Scope:
- Implement [GET/POST/PATCH/DELETE] handler
- Follow authentication pattern from existing routes
- Use `requireSupabaseServerClient()` for auth
- Use `createDatabase()` for database operations

Constraints:
- Require authentication (check `supabase.auth.getUser()`)
- Return proper HTTP status codes
- Handle errors gracefully
- Follow existing API response format: `{ success: boolean, data?: any, error?: string }`

Validation:
- Route responds correctly
- Authentication required
- Error handling works
- Lint passes
- No new markdown files
```

### Adding a New Dashboard Page

```
Create a new dashboard page at `/portal/dashboard/[feature]/page.tsx`.

Scope:
- Create page component
- Add navigation link in dashboard layout
- Follow existing page patterns

Constraints:
- Use `'use client'` if component needs interactivity
- Use `ProtectedPage` wrapper if auth required
- Follow existing styling patterns (Tailwind CSS)
- Use components from `@/components/ui`

Validation:
- Page renders correctly
- Navigation link works
- Authentication enforced (if needed)
- Responsive design works
- Lint passes
```

### Adding Internal QA Routes for a Feature

```
Create QA/test routes for [feature-name] under src/app/__tests__/[feature-name]/.

Scope:
- Create test pages under `src/app/__tests__/[feature-name]/`
- Add production guard: check `process.env.NODE_ENV === 'production'` and call `notFound()` if true
- Create index page at `src/app/__tests__/[feature-name]/page.tsx` for discoverability

Constraints:
- All QA routes MUST be under `__tests__` namespace (double underscore)
- All QA routes MUST include production guards (use `useEffect` in client components)
- Routes should be clearly labeled as internal/testing only
- Use `'use client'` directive for interactive test pages

Example structure:
- src/app/__tests__/[feature-name]/page.tsx (index)
- src/app/__tests__/[feature-name]/[test-name]/page.tsx (test pages)

Validation:
- Routes work in development mode
- Routes return 404/notFound in production builds
- Production guard properly implemented
- Lint passes
- Build succeeds
```

### Cleaning Technical Debt

```
Clean up technical debt in [specific area].

Scope:
- [Specific files or patterns to clean]
- [What to remove/refactor]

Constraints:
- Do not change runtime behavior
- Remove only unused code
- Improve type safety where possible
- Follow existing patterns

Validation:
- No functionality broken
- Lint passes
- Build passes
- No new markdown files
- No references to MongoDB
```

## Validation Checklist (Before Merge)

Before any agent-generated code is merged, verify:

- [ ] `npm run lint` passes with 0 errors (warnings acceptable)
- [ ] `npm run build` completes successfully
- [ ] `npm run type-check` passes (if applicable)
- [ ] No new markdown files created (except README.md or AGENTS.md updates)
- [ ] No references to MongoDB in code or comments
- [ ] Environment variables handled safely (build won't crash if optional vars missing)
- [ ] Authentication still works (test sign-in/sign-up flow)
- [ ] Protected routes still protected (test without auth)
- [ ] No admin client used in browser code
- [ ] Supabase client usage follows patterns (browser/server/admin)
- [ ] No silent architectural changes
- [ ] API routes return expected response format
- [ ] No breaking changes to existing functionality

## Commit & Branch Conventions

### Branch Naming

- `fix/[description]` - Bug fixes
- `feat/[description]` - New features
- `refactor/[description]` - Code refactoring
- `chore/[description]` - Maintenance tasks
- `agent/[description]` - Agent-assisted changes (optional, for clarity)

Examples:

- `fix/lint-errors`
- `feat/internship-filtering`
- `refactor/extract-api-client`
- `agent/cleanup-unused-imports`

### Commit Message Format

Use conventional commits:

- `fix: [description]` - Bug fix
- `feat: [description]` - New feature
- `refactor: [description]` - Refactoring
- `chore: [description]` - Maintenance
- `docs: [description]` - Documentation updates

Include agent attribution if significant:

```
fix: resolve ESLint errors in API routes

Agent-assisted cleanup of no-extra-semi errors.
```

### When to Squash vs Preserve Commits

**Squash:**

- Multiple small fixes in one PR
- Agent-generated cleanup commits
- Experimental commits that were reverted

**Preserve:**

- Logical feature additions
- Significant refactors with clear steps
- Commits that represent meaningful milestones

### Agent Involvement Attribution

If an agent performed significant work:

- Mention in PR description: "Agent-assisted: [what was done]"
- Include in commit message if agent did majority of work
- Do not attribute minor suggestions or autocomplete

## Security & Safety Notes

### Service Role Key Handling

- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- Never expose to client bundle
- Only use in API routes with `requireSupabaseAdminClient()`
- Never log or include in error messages
- Never pass to browser components

### Admin Client Usage

- Admin client bypasses RLS - use with extreme caution
- Only use in API routes, never in browser code
- Document why RLS bypass is necessary
- Prefer RLS policies over admin client when possible
- Admin client should only be used for:
  - User lookup by email (migration scenarios)
  - Bulk operations requiring elevated permissions
  - Operations that cannot be expressed in RLS

### RLS Expectations

- All tables have RLS enabled
- Policies enforce read/write permissions based on user roles
- Application code should assume RLS is active
- Test with non-admin users to verify RLS works
- Do not write code that assumes RLS is disabled

### OAuth Scope Limitations

**Google OAuth Scopes (NextAuth on `/resources` page only):**

- `https://www.googleapis.com/auth/drive.metadata.readonly` - Read-only Drive metadata
- `openid`, `email`, `profile` - Basic user info

**Redirect URIs:**

- Development: `http://localhost:3000/api/nextauth/callback/google`
- Production: `https://paragoninvestments.org/api/nextauth/callback/google`

**Limitations:**

- NextAuth only used for `/resources` page
- Does not handle member portal authentication
- Do not extend OAuth to other features
- `.edu` email requirement enforced by `PGI_REQUIRE_EDU` flag

### Build Safety

- Build must complete even if optional env vars are missing
- Use `getSupabaseServerClient()` in server components (returns null)
- Use `requireSupabaseServerClient()` in API routes (throws at runtime)
- Feature flags degrade gracefully (hide features, don't crash)
- Webpack cache disabled in production builds to prevent ENOSPC errors

### Code Safety Patterns

**Safe pattern (server component):**

```typescript
const client = getSupabaseServerClient();
if (!client) {
  return <div>Configuration required</div>;
}
```

**Safe pattern (API route):**

```typescript
const supabase = requireSupabaseServerClient(); // Throws at runtime if missing
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Unsafe pattern (do not use):**

```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Crashes build if missing
```

## Additional Guidelines

### TypeScript Usage

- Use TypeScript for all new code
- Avoid `any` types - use `unknown` and narrow, or create proper types
- Types are defined in `src/types/index.ts`
- Use generated Supabase types when available

### Component Patterns

- Use functional components with hooks
- Mark client components with `'use client'` directive
- Use shadcn/ui components from `@/components/ui`
- Follow existing component structure and naming

### API Route Patterns

- All routes require authentication (check `supabase.auth.getUser()`)
- Return consistent response format: `{ success: boolean, data?: any, error?: string }`
- Use proper HTTP status codes (401 for unauthorized, 403 for forbidden, etc.)
- Handle errors gracefully with try/catch
- Log errors server-side, never expose sensitive details to client

### Testing Considerations

- Test with authenticated and unauthenticated users
- Test with different user roles (admin, lead, member)
- Verify RLS policies work correctly
- Test feature flags in both dev and production modes
- Verify build completes with missing optional env vars
