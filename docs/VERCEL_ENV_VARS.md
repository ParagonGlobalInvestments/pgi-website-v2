# Vercel Environment Variables

Production and preview environment variable configuration for the PGI portal Vercel deployment.

## Environment-Specific Settings

### Production (`paragoninvestments.org`)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_PORTAL_ENABLED` | `false` | Set to `true` when portal is ready for public launch |
| `NEXT_PUBLIC_PORTAL_URL` | `https://portal.paragoninvestments.org` | Only set when portal is enabled |
| `NEXT_PUBLIC_APP_URL` | `https://paragoninvestments.org` | Used for metadata, redirects, sitemap |

### Preview (`*.vercel.app`)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_PORTAL_ENABLED` | `true` | Always enabled on previews for testing |
| `NEXT_PUBLIC_PORTAL_URL` | _(leave unset)_ | Subdomain routing does not work on Vercel previews |
| `NEXT_PUBLIC_APP_URL` | _(leave unset)_ | Falls back to `https://paragoninvestments.org` |

## Required Variables (All Environments)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hgowpluxzagdzctxbagw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# NextAuth (for /resources page)
NEXTAUTH_SECRET=<generated secret>
NEXTAUTH_URL=https://paragoninvestments.org
NEXTAUTH_BASE_PATH=/api/nextauth
PGI_REQUIRE_EDU=true

# Google OAuth (for /resources page)
GOOGLE_CLIENT_ID=<client id>
GOOGLE_CLIENT_SECRET=<client secret>

# Admin
ADMIN_EMAILS=ap7564@nyu.edu,aalonso20@uchicago.edu,mylesspiess@uchicago.edu
```

## Optional Variables

```
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=<posthog key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Feature Flags
NEXT_PUBLIC_SHOW_STATS=false
NEXT_PUBLIC_ENABLE_INTERNSHIPS=false
NEXT_PUBLIC_ENABLE_DIRECTORY=false
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
```

## DNS Setup (NameSilo)

After adding domains in Vercel project settings, configure DNS:

1. **Root domain**: Follow Vercel's instructions (typically A record or CNAME for `www`)
2. **Portal subdomain**: `portal CNAME cname.vercel-dns.com`

## Supabase Redirect URLs

Add to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs:

- `https://paragoninvestments.org/auth/callback`
- `https://portal.paragoninvestments.org/auth/callback`

## Variables NOT to Set

- `NODE_ENV` -- Automatically set by Vercel
- `VERCEL_ENV` -- Automatically set by Vercel
- Any `NEXT_PUBLIC_CLERK_*` variables -- Clerk is no longer used
