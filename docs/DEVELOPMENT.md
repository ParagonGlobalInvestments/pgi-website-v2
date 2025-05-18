# Development Guide

This guide contains setup instructions and development standards for the PGI platform.

## Getting Started

### Prerequisites

- Node.js v18+ (with npm)
- MongoDB (local or MongoDB Atlas)
- Git

### Setup

1. **Clone the repository**:

   ```bash
   git clone <repository_url>
   cd pgi
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in the required values in `.env.local` (Clerk keys, MongoDB URI, etc.)

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Application runs at `http://localhost:3000`

## Code Organization

- **`src/app/`**: Next.js pages and API routes
- **`src/components/`**: React components
  - `ui/`: Core UI elements
  - `shared/`: Reusable components
- **`src/lib/`**: Core modules
  - `database/`: MongoDB connection and models
  - `auth/`: Authentication helpers
- **`src/hooks/`**: Custom React hooks
- **`src/utils.ts`**: Utility functions
- **`src/middleware.ts`**: Route protection via Clerk
- **`src/types/`**: TypeScript type definitions

## Development Workflow

1. Create a feature branch from `main`: `git checkout -b feature/your-feature-name`
2. Implement changes following coding standards
3. Run linter and formatter: `npm run lint && npm run format`
4. Commit with clear messages
5. Open a Pull Request with detailed description

## Coding Standards

### TypeScript / JavaScript

- Use TypeScript for all new code
- Define shared types in `src/types/index.ts`
- Use modern JavaScript features (ES6+)
- Use async/await for asynchronous code

### React

- Use functional components with Hooks
- Follow patterns from shadcn/ui for components
- Ensure accessibility compliance

### Styling

- Use Tailwind CSS classes (no CSS files)
- Follow responsive design patterns
- Use the `cn()` utility for conditional classes

## Working with Authentication

### Client Components

```tsx
import { useUser } from '@clerk/nextjs';

function ProfileComponent() {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <NotSignedInMessage />;

  return <UserProfile user={user} />;
}
```

### API Routes

```tsx
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process request...
}
```

## Database Operations

```tsx
import { connectToDatabase } from '@/lib/database/connection';
import { User } from '@/lib/database/models/User';

// In API route or server component
await connectToDatabase();
const users = await User.find({ 'org.permissionLevel': 'member' }).lean();
```

## Common Tasks

### Adding a New Page

1. Create a file in `src/app/` directory (e.g., `src/app/portal/dashboard/new-page/page.tsx`)
2. Use React Server Component or add `'use client';` for Client Component
3. Export a default function component
4. Add to navigation if needed

### Creating a New API Endpoint

1. Create a route file (e.g., `src/app/api/new-feature/route.ts`)
2. Define HTTP method handlers (GET, POST, etc.)
3. Implement authentication checks, validation, and database operations
4. Document in `API.md`
