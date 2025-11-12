# PGI Architecture

This document outlines the architecture of the Paragon Global Investments application.

## System Overview

The PGI platform provides:

- Public website with information about Paragon Global Investments
- Member portal for internship listings and resources
- Admin only panel for organization management

## Technical Stack

- **Framework**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Additional**: NextAuth (Google OAuth for Drive access on resources page only)

## Architecture Layers

### 1. UI Layer

- **`src/app/`**: Routes and layouts using React Server Components and Client Components
  - Route groups: `(auth)`, `(portal)`, etc.
- **`src/components/`**: React components
  - **`ui/`**: Core UI elements (shadcn/ui-based)
  - **`shared/`**: Reusable components across features
- **Styling**: Tailwind CSS (configured in `tailwind.config.mjs`)

### 2. Application Logic Layer

- **`src/app/api/`**: Backend API route handlers (Next.js Route Handlers)
- **`src/lib/`**: Core application modules
  - **`auth/`**: Authentication type definitions
  - **`supabase/`**: Supabase clients and database layer
    - `admin.ts` - Service role client (bypasses RLS)
    - `browser.ts` - Browser-side client
    - `server.ts` - Server-side SSR client
    - `database.ts` - Complete database operations layer
    - `syncUser.ts` - User synchronization logic
  - **`rss/`**: RSS feed processing logic
- **`src/utils.ts`**: General utility functions
- **`src/hooks/`**: Custom React hooks
- **`src/middleware.ts`**: Route protection using `@supabase/ssr`

### 3. Data Layer

- **Supabase (PostgreSQL)**: Primary database for all data
  - Users, chapters, internships, pitches tables
  - Row Level Security (RLS) for authorization
  - Database operations through `SupabaseDatabase` class
- **Supabase Auth**: Built-in authentication with session management

## Directory Structure

```
pgi/
├── docs/               # Project documentation
├── public/             # Static assets
├── scripts/            # Utility scripts
├── src/                # Main source code
│   ├── app/            # Next.js App Router
│   │   ├── (auth)/     # Auth pages
│   │   ├── (portal)/   # Member portal
│   │   ├── api/        # API routes
│   ├── components/     # React components
│   │   ├── ui/         # Core UI elements
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Core modules
│   │   ├── auth/       # Auth type definitions
│   │   ├── supabase/   # Supabase clients & DB layer
│   │   │   ├── admin.ts, browser.ts, server.ts
│   │   │   ├── database.ts  # Main DB operations
│   │   │   └── syncUser.ts  # User sync logic
│   ├── server/         # Custom server logic
│   ├── types/          # TypeScript definitions
│   ├── utils.ts        # Utility functions
│   ├── middleware.ts   # Auth middleware
├── next.config.mjs     # Next.js configuration
├── package.json        # Dependencies
└── README.md           # Main project README
```

## Key Workflows

### Authentication

1. Users authenticate via Supabase Auth (sign-up/sign-in UI)
2. `syncUserWithSupabase` creates/updates user record in Supabase `users` table
3. `middleware.ts` enforces route protection using `@supabase/ssr`
4. Components display content based on user roles from Supabase

### Data Flow (Example: Internships)

1. Component requests data via `fetch` to API route
2. API route uses `createDatabase()` to get Supabase database instance
3. Database layer queries Supabase with RLS automatically enforced
4. Data is returned to client and rendered

## Performance Considerations

- Next.js 14 features (Server Components, code splitting, streaming)
- Efficient Supabase queries with database indexes
- Row Level Security (RLS) for automatic authorization
- React memoization where appropriate
- SWR for client-side caching

## Security Model

- **Authentication**: Supabase Auth with secure session management
- **Authorization**: Row Level Security (RLS) policies in Supabase
- **API Protection**: Middleware checks authentication before allowing access
- **Environment Variables**: Secure credential storage (never in client bundle)
- **Service Role Key**: Admin operations only, never exposed to client
