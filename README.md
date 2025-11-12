# Paragon Global Investments (PGI) Portal

This is the official web application for Paragon Global Investments, a student-run intercollegiate investment fund. The portal serves as a central hub for members, providing access to resources, internship listings, and internal tools.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Clerk for authentication, and MongoDB with Mongoose for data storage.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Authentication & Authorization](#authentication--authorization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (built on Radix UI primitives)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: SWR for data fetching
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: Socket.IO
- **Linting/Formatting**: ESLint, Prettier
- **Additional**: NextAuth (Google OAuth for Drive access on resources page only)

## Key Features

- Secure user authentication (sign-in, sign-up, profile management) via Supabase
- Role-based access control (Admin, Lead, Member)
- Internship board with search and filtering
- Member portal/dashboard with protected resources
- Education and investment strategies section
- Member directory and profiles
- Responsive design for all devices

## Project Structure

The project follows the Next.js App Router structure, with routes defined by directory structure:

```
pgi/
├── .github/                # GitHub Actions, issue/PR templates
├── .husky.disabled/        # Git hooks (e.g., pre-commit checks)
├── docs/                   # Project documentation
├── public/                 # Static assets (images, icons, logos)
├── scripts/                # Utility/maintenance scripts
├── src/                    # Main source code
│   ├── app/                # Next.js App Router (pages, layouts, API routes)
│   │   ├── (main)/         # Main website routes
│   │   ├── about/          # About page route
│   │   ├── api/            # Backend API route handlers
│   │   ├── apply/          # Application process page
│   │   ├── contact/        # Contact page
│   │   ├── dashboard/      # Member dashboard
│   │   ├── globals.css     # Global CSS styles
│   │   ├── investment-strategy/ # Investment strategy page
│   │   ├── layout.tsx      # Root layout component
│   │   ├── members/        # Member directory
│   │   ├── national-committee/ # National committee page
│   │   ├── placements/     # Placements/internship listings
│   │   ├── portal/         # Member portal
│   │   │   ├── layout.tsx  # Portal layout wrapper
│   │   │   ├── page.tsx    # Portal home page
│   │   │   ├── dashboard/  # Member dashboard area
│   │   │   │   ├── layout.tsx    # Dashboard layout with navigation
│   │   │   │   ├── page.tsx      # Dashboard home
│   │   │   │   ├── directory/    # Member directory section
│   │   │   │   │   ├── page.tsx  # Directory main page
│   │   │   │   │   └── admin/    # Admin directory management
│   │   │   │   │       └── page.tsx # Admin directory view
│   │   │   │   ├── internships/  # Internship listings
│   │   │   │   │   ├── page.tsx  # Internships main page
│   │   │   │   │   └── new/      # Add new internship
│   │   │   │   │       └── page.tsx # New internship form
│   │   │   │   ├── news/         # News feed section
│   │   │   │   └── settings/     # User settings
│   │   │   │       ├── page.tsx  # Settings main page
│   │   │   │       └── profile/  # User profile settings
│   │   │   │           └── page.tsx # Profile editor
│   │   │   ├── sign-up/    # Portal sign-up flow
│   │   │   ├── signin/     # Portal sign-in flow
│   │   │   ├── signout/    # Sign-out handling
│   │   │   └── signup/     # Alternative sign-up path
│   │   ├── sign-in/        # Authentication sign-in page
│   │   ├── sign-up/        # Authentication sign-up page
│   │   ├── sponsors/       # Sponsors page
│   │   └── who-we-are/     # Who we are page
│   ├── components/         # React components
│   │   ├── auth/           # Authentication-related components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── layout/         # Layout components (header, footer, etc.)
│   │   └── ui/             # Shadcn UI components built on Radix primitives
│   │       ├── action-button.tsx  # Custom action button
│   │       ├── alert-dialog.tsx   # Alert dialog component
│   │       ├── alert.tsx          # Alert component
│   │       ├── AnimatedSection.tsx # Animated section component
│   │       ├── AnimatedText.tsx   # Animated text component
│   │       ├── avatar.tsx         # Avatar component
│   │       ├── badge.tsx          # Badge component
│   │       ├── button.tsx         # Button component
│   │       ├── card.tsx           # Card component
│   │       ├── checkbox.tsx       # Checkbox input
│   │       ├── combobox.tsx       # Combobox/autocomplete
│   │       ├── command.tsx        # Command component
│   │       ├── dialog.tsx         # Dialog/modal component
│   │       ├── dropdown-menu.tsx  # Dropdown menu
│   │       ├── index.ts           # Component exports
│   │       ├── input.tsx          # Input component
│   │       ├── label.tsx          # Form label
│   │       ├── navigation-menu.tsx # Navigation menu
│   │       ├── PageTransition.tsx # Page transition animations
│   │       ├── popover.tsx        # Popover component
│   │       ├── radio-group.tsx    # Radio group input
│   │       ├── ScrollButton.tsx   # Scroll button
│   │       ├── select.tsx         # Select dropdown
│   │       ├── SmoothTransition.tsx # Smooth transition component
│   │       ├── switch.tsx         # Toggle switch
│   │       ├── table.tsx          # Table component
│   │       ├── tabs.tsx           # Tabs component
│   │       ├── textarea.tsx       # Textarea input
│   │       ├── toast.tsx          # Toast notification
│   │       ├── toaster.tsx        # Toast container
│   │       ├── tooltip.tsx        # Tooltip component
│   │       └── use-toast.ts       # Toast hook
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core application modules and services
│   │   ├── auth/           # Authentication type definitions
│   │   ├── supabase/       # Supabase client and database layer
│   │   │   ├── admin.ts          # Admin client (service role)
│   │   │   ├── browser.ts        # Browser client
│   │   │   ├── server.ts         # Server-side client (SSR)
│   │   │   ├── database.ts       # Database operations layer
│   │   │   └── syncUser.ts       # User synchronization
│   │   └── rss/            # RSS feed utilities
│   ├── server/             # Custom server logic (Socket.IO, cron jobs)
│   ├── types/              # TypeScript type definitions and interfaces
│   ├── utils.ts            # General utility functions
│   ├── middleware.ts       # Next.js middleware for auth and redirects
│   └── tailwind.css        # Tailwind CSS directives
├── .env.local.example      # Example environment variables
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier code formatter configuration
├── jest.config.js          # Jest testing configuration
├── jest.setup.js           # Jest testing setup
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS version)
- npm (comes with Node.js)
- A Supabase account and project ([Supabase Dashboard](https://supabase.com/dashboard))
- (Optional) Google Cloud project with OAuth credentials for resources page

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd pgi-website-v2
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file based on `docs/env.example`:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Google OAuth (for resources page only)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   See `docs/env.example` for all available environment variables.

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Authentication & Authorization

- Authentication is managed by [Supabase Auth](https://supabase.com/auth).
- Middleware in `src/middleware.ts` protects routes using Supabase SSR and handles public/private access.
- User roles and permissions are stored in Supabase `users` table with role-based access control.
- NextAuth is used separately for Google OAuth (Drive access on resources page only).

## Deployment

This application is configured for deployment on Vercel:

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Configure environment variables in Vercel project settings.
4. Deploy with automatic build and CI/CD integration.

## Contributing

Please see the documentation in the `docs/` directory for contribution guidelines and development standards.

## License

This project is proprietary software for Paragon Global Investments.
