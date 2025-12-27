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

## Project Overview

This is the web platform for Paragon Global Investments, serving both public visitors and authenticated members. Public pages showcase the organization, while the member portal provides secure access to resources, directory, internships, pitches, and other internal tools. The application uses Supabase for authentication and data storage, with role-based access control for different member permission levels.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5.x
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Google OAuth**: NextAuth (used only for Google Drive access on `/resources` page)
- **Analytics**: PostHog (optional)
- **State Management**: SWR for data fetching
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: Socket.IO
- **Deployment**: Vercel

## Getting Started (Local Development)

### Prerequisites

- Node.js 20+ (LTS version recommended)
- npm (comes with Node.js)
- A Supabase account and project ([create one here](https://supabase.com/dashboard))
- (Optional) Google Cloud project with OAuth credentials for the `/resources` page

### Clone the Repository

```bash
git clone <repository-url>
cd pgi-website-v2
```

### Install Dependencies

```bash
npm install
```

### Environment Variable Setup

1. Copy the example environment file:

   ```bash
   cp docs/env.example .env.local
   ```

2. Fill in your Supabase credentials:

   - Get your project URL and keys from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Add `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, server-only)

3. (Optional) For the `/resources` page, add Google OAuth credentials:
   - Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET`
   - Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

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

**Google OAuth (required only if using `/resources` page):**

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_SECRET` - Random secret for NextAuth sessions (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (`http://localhost:3000` for dev, `https://paragoninvestments.org` for prod)
- `NEXTAUTH_BASE_PATH` - Set to `/api/nextauth`
- `PGI_REQUIRE_EDU` - Require `.edu` email for resources page (default: `true`)

### Optional Variables

**Feature Flags:**

- `NEXT_PUBLIC_SHOW_STATS` - Show dashboard statistics (default: `false`)
- `NEXT_PUBLIC_ENABLE_INTERNSHIPS` - Enable internships feature (default: `false`)
- `NEXT_PUBLIC_ENABLE_DIRECTORY` - Enable member directory feature (default: `false`)
- `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES` - Enable admin features (default: `true`)

**Analytics:**

- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (default: `https://us.i.posthog.com`)

**Legacy/Unused Variables (may be present but not actively used):**

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Legacy Clerk variable (not used, codebase uses Supabase Auth)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Legacy Clerk variable (not used)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Legacy Clerk variable (not used)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Legacy Clerk variable (not used)
- `ADMIN_EMAILS` - Comma-separated list of admin emails (currently not used in codebase)
- `NODE_ENV` - Automatically set by Next.js, do not manually set in `.env.local`

### What Breaks vs. What Degrades

**Missing Supabase variables:** The application will not function. Authentication and database operations will fail.

**Missing Google OAuth variables:** The `/resources` page will not work, but the rest of the application functions normally.

**Missing feature flags:** Features are hidden in production but automatically enabled in development mode (`NODE_ENV=development`).

**Missing analytics:** No analytics tracking, but the application works normally.

See `docs/env.example` for a complete template with all variables listed.

## Authentication & Authorization

### Supabase Auth

All user authentication is handled by Supabase Auth. Users sign up and sign in through Supabase, and sessions are managed via cookies using `@supabase/ssr`.

### Middleware

Route protection is handled by `src/middleware.ts`, which:

- Checks authentication status for protected routes
- Redirects unauthenticated users to `/sign-in`
- Redirects authenticated users away from auth pages
- Allows public routes to pass through

Protected routes include `/portal/dashboard/**` and related member-only areas.

### User Roles

User roles are stored in the Supabase `users` table with the `org_permission_level` field:

- `admin` - Full access to all features and admin panels
- `lead` - Elevated permissions for chapter/team management
- `member` - Standard member access

### Row Level Security (RLS)

Supabase Row Level Security policies enforce data access at the database layer. Users can only access data they're authorized to see based on their role and relationships (e.g., chapter membership). This provides defense-in-depth security beyond application-level checks.

### NextAuth Scope

NextAuth is used **only** for Google OAuth on the `/resources` page to access Google Drive. It is completely isolated from Supabase Auth and does not handle any other authentication. The `/resources` page uses NextAuth to verify users have `.edu` email addresses and grant read-only access to Drive metadata.

## Project Structure

```
pgi-website-v2/
├── .github/                # GitHub Actions workflows, issue/PR templates
├── docs/                   # Documentation and environment examples
├── public/                 # Static assets (images, icons, PDFs, etc.)
├── scripts/                # Utility scripts (migrations, sync, etc.)
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, API routes)
│   │   ├── (main)/         # Public website routes
│   │   ├── api/            # Backend API route handlers
│   │   ├── portal/         # Member portal routes
│   │   │   └── dashboard/  # Dashboard pages (directory, internships, pitches, etc.)
│   │   ├── sign-in/        # Authentication pages
│   │   └── sign-up/
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── layout/         # Layout components (header, footer)
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core application modules
│   │   ├── supabase/       # Supabase clients and database layer
│   │   │   ├── admin.ts    # Service role client (server-only)
│   │   │   ├── browser.ts  # Browser-side client
│   │   │   ├── server.ts   # Server-side SSR client
│   │   │   └── database.ts # Database operations layer
│   │   └── rss/            # RSS feed utilities
│   ├── middleware.ts        # Next.js middleware for route protection
│   ├── types/              # TypeScript type definitions
│   └── utils.ts            # General utility functions
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.mjs     # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Development Workflow

### Common Scripts

- `npm run dev` - Start development server at `http://localhost:3000`
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
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

The application is configured for deployment on Vercel:

1. Push code to your Git repository
2. Import the project in Vercel
3. Configure environment variables in Vercel project settings
4. Deploy (automatic builds on push to main branch)

The build process disables webpack persistent caching in production to prevent disk space issues during builds.

## Common Gotchas

### Missing Environment Variables

**Symptom:** Build succeeds but app crashes at runtime or features don't work.

**Solution:** Check that all required Supabase variables are set. The build process won't fail if env vars are missing, but runtime will. Check browser console and server logs for specific errors.

### Google OAuth Confusion

**Symptom:** Confusion about when NextAuth vs Supabase Auth is used.

**Clarification:**

- Supabase Auth handles **all** user authentication (sign-in, sign-up, member portal)
- NextAuth is **only** used for Google OAuth on the `/resources` page to access Google Drive
- These are completely separate systems with no interaction

If you're not working on the `/resources` page, you don't need to configure NextAuth.

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
