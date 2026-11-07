# AGENTS.md — PGI Website

Guidance for AI coding agents working in this repo. `package.json`, `supabase/migrations/`, and the code itself are the source of truth for versions, schema, and file layout — check them rather than assuming.

---

## Stack

- **Next.js App Router**, TypeScript (strict), React
- **Supabase**: Auth (Google OAuth), Postgres with RLS, Storage
- **Tailwind CSS** + shadcn/ui + Radix UI; Framer Motion and GSAP for animation
- **Cloudflare Workers** via `@opennextjs/cloudflare`
- Jest for tests, ESLint (flat config, `eslint.config.mjs`) + Prettier

## Commands

```bash
npm run dev         # next dev on http://localhost:3000 (portal at /portal locally)
npm run build       # opennextjs-cloudflare build → .open-next/
npm run preview     # build + run in the local Workers runtime
npm run lint        # eslint .
npm run type-check  # tsc --noEmit
npm test            # jest
```

---

## Hosting & Deployment

Pushes to `main` deploy automatically through Cloudflare Workers Builds. Preview URLs are disabled, so `main` is production.

| Host                            | Behavior                                |
| ------------------------------- | --------------------------------------- |
| `paragoninvestments.org`        | Canonical public site                   |
| `portal.paragoninvestments.org` | Portal (subdomain routing in the proxy) |
| `www.paragoninvestments.org`    | 301 redirect to the bare domain         |

| File                  | Purpose                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `wrangler.jsonc`      | Worker bindings, runtime `vars`, cron trigger. Runtime `vars` overwrite dashboard values on deploy      |
| `open-next.config.ts` | OpenNext caching: R2 incremental cache, Durable Object queue and tag cache                              |
| `worker.ts`           | Custom Worker entry wrapping `.open-next/worker.js`; adds the `scheduled` handler (excluded from `tsc`) |

- `NEXT_PUBLIC_*` values are inlined at build time, so they must be Workers Builds **build variables** (and in `wrangler.jsonc` `vars` for runtime).
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `CMS_REVALIDATION_SECRET`) are Worker secrets.
- A daily cron calls `/api/cron/cleanup-observability` with `Authorization: Bearer $CRON_SECRET` to prune analytics tables.
- OpenNext refuses to build Next.js major versions that are past the Next.js team's 2-year support window. Keep Next on a supported major.

---

## Authentication

Supabase Auth only (no NextAuth).

1. `/login` starts Google OAuth; Supabase returns to `/auth/callback`.
2. The callback calls `checkMembership()` (`src/lib/auth/checkMembership.ts`), which accepts the `ADMIN_EMAILS` allowlist, an already-linked `supabase_id`, or a match on `email` / `alternate_emails` (auto-linking `supabase_id`).
3. Non-members are signed out and sent to `/resources?notMember=true`; members go to the portal.

Enforcement:

- **Proxy** (`src/proxy.ts`, Next.js's renamed middleware): portal gating, subdomain rewriting, and Supabase session refresh.
- **Portal layout** (`src/app/portal/layout.tsx`): server-side auth check — the real security choke point.
- **API routes**: each authenticates itself (`supabase.auth.getUser()`); admin routes use `requireAdmin()`.

Subdomain routing (only when `NEXT_PUBLIC_PORTAL_URL` points at another host): on the main domain, `/login` and `/portal/*` redirect to the portal subdomain. On `portal.*`, `/api/*` and `/auth/*` pass through untouched, `/portal/*` redirects to the prefix-free URL, and every other path (including `/login`) is rewritten to `/portal/*`. `/auth/callback` must stay reachable on the main domain for OAuth.

---

## Supabase Clients

Always use the factories — never construct clients directly.

| Context                    | Import                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| Client components          | `createClient` from `@/lib/supabase/browser`                                   |
| Server, may be prerendered | `getSupabaseServerClient()` from `@/lib/supabase/server` (null if env missing) |
| API routes                 | `requireSupabaseServerClient()` (throws if env missing)                        |
| Server only, bypasses RLS  | `requireSupabaseAdminClient()` from `@/lib/supabase/admin`                     |

- Never use the admin client in browser code.
- User-table operations go through `createDatabase()` in `src/lib/supabase/database.ts`.
- In RLS policies, use `(select auth.uid())` rather than `auth.uid()` so Postgres evaluates it once.

---

## Portal Gating

`portalEnabled` in `src/lib/runtime.ts` is the single source of truth (`NEXT_PUBLIC_PORTAL_ENABLED === 'true'`). Never read the env var directly.

- The proxy returns 404 for portal routes when disabled.
- Server pages/layouts: `assertPortalEnabledOrNotFound()`.
- API routes: `requirePortalEnabledOr404()`.

---

## CMS & Cache Invalidation

Admins edit public-site content at `/portal/content`; the data lives in `cms_*` tables and is written through `/api/admin/*` routes guarded by `requireAdmin()`.

Public pages are cached. When CMS tables change, a database trigger (see the latest `cms_*` migrations) POSTs to `/api/revalidate` with `Authorization: Bearer $CMS_REVALIDATION_SECRET`; the route maps the changed table to paths in `src/lib/cms/revalidate.ts`. If you add a CMS-backed page, add its path there.

---

## Analytics

Custom, Supabase-backed (`obs_*` tables). `src/components/observability/VitalsCollector.tsx` posts to `/api/observability/*`; admins view it at `/portal/observability`. Collection endpoints must never break the app: they always return success, degrade gracefully if tables are missing, rate-limit per IP, and store no IP addresses.

---

## Environment Variables

| Variable                                                                | Notes                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                              | Required                                                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                                  | Required (`NEXT_PUBLIC_SUPABASE_ANON_KEY` is a legacy fallback) |
| `SUPABASE_SERVICE_ROLE_KEY`                                             | Required at runtime, server only                                |
| `NEXT_PUBLIC_PORTAL_ENABLED`                                            | `'true'` to enable the portal                                   |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PORTAL_URL` | Redirect and cross-site link bases                              |
| `ADMIN_EMAILS`                                                          | Comma-separated admin allowlist                                 |
| `CRON_SECRET`, `CMS_REVALIDATION_SECRET`                                | Bearer tokens for cron and CMS revalidation                     |

Build safety: never assume env vars exist at build time. Use `getSupabase*Client()` in code that may be prerendered, and let missing optional config hide features rather than crash.

---

## Conventions

**API routes**

- `export const dynamic = 'force-dynamic'`
- Call `requirePortalEnabledOr404()` for portal-only routes, then authenticate; return 401 when unauthenticated.
- Respond with `{ success: boolean, data?, error? }` (user endpoints use `user` instead of `data`). Don't change existing response shapes.
- Dynamic route `params` are a `Promise` — `await` them.

**Pages**

- Public pages live in the `src/app/(site)/` route group, which supplies the shared layout.
- Portal pages live in `src/app/portal/(main)/`, which supplies the sidebar layout. Client components get the current user from `usePortalUser()`.
- App Router page files may only export `default` and Next.js-recognized names (`metadata`, `generateStaticParams`, etc.); `tsc` checks this via `.next/types`.
- Brand: Montserrat; navy palette (`navy`, `darkNavy`, `pgi-dark-blue`, `pgi-light-blue` in the Tailwind config).

**Git**

- `main` is production; `live-version` is an emergency rollback snapshot.
- Branches: `feat/…`, `fix/…`, `refactor/…`. Commits: conventional (`fix:`, `feat:`, `refactor:`, `chore:`, `docs:`).

---

## CI

`.github/workflows/ci.yml` runs on pushes and PRs to `main`/`develop`: `npm ci` → `npm run lint` (non-blocking) → `npm run build` → `npm run type-check` (blocking). `next.config.mjs` sets `typescript.ignoreBuildErrors`, so type errors only surface in the `type-check` step.

Before finishing a change, run `npm run build`, `npm run type-check`, `npm run lint` (warnings are fine), and `npm test`.

---

## Do Not

- Modify the auth system (Supabase Auth setup, proxy logic, OAuth callback) without explicit approval.
- Change database schema or RLS policies without explicit approval.
- Use the admin client in browser code.
- Remove dependencies without confirming they're unused.
- Break API response formats.
- Create markdown files other than `AGENTS.md` and `README.md`.
- Make silent architectural changes.
