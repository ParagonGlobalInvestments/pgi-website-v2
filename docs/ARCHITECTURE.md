# PGI Architecture

This document outlines the architecture of the Paragon Global Investments application.

## System Overview

The PGI platform provides:

- Public website with information about Paragon Global Investments
- Member portal for internship listings and resources
- Admin only panel for organization management

## Technical Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose ODM
- **Hosting**: Vercel

## Architecture Layers

### 1. UI Layer

- **`src/app/`**: Routes and layouts using React Server Components and Client Components
  - Route groups: `(auth)`, `(portal)`, etc.
- **`src/components/`**: React components
  - **`ui/`**: Core UI elements (shadcn/ui-based)
  - **`shared/`**: Reusable components across features
- **Styling**: Tailwind CSS (configured in `tailwind.config.mjs`)

### 2. Application Logic Layer

- **`src/app/api/`**: Backend API route handlers
- **`src/lib/`**: Core application modules
  - **`auth/`**: Authentication helpers
  - **`database/`**: MongoDB connection and Mongoose schemas
  - **`context/`**: React Context providers
  - **`rss/`**: RSS feed processing logic
- **`src/utils.ts`**: General utility functions
- **`src/hooks/`**: Custom React hooks
- **`src/middleware.ts`**: Route protection via Clerk

### 3. Data Layer

- **MongoDB**: Primary database (users, internships, chapters)
- **Mongoose**: ODM for database interactions

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
│   │   ├── auth/       # Auth helpers
│   │   ├── database/   # Database connection
│   │   │   └── models/ # Mongoose schemas
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

1. Users authenticate via Clerk's UI
2. `syncUserWithMongoDB` creates/updates a MongoDB user profile
3. `middleware.ts` enforces route protection
4. Components display content based on user roles

### Data Flow (Example: Internships)

1. Component requests data via `fetch` to API route
2. API route connects to MongoDB via Mongoose models
3. Data is returned to client and rendered

## Performance Considerations

- Next.js features (Server Components, code splitting)
- Efficient MongoDB queries with proper indexes
- React memoization where appropriate

## Security Model

- Authentication via Clerk
- Authorization in middleware and API routes
- Environment variables for sensitive credentials
