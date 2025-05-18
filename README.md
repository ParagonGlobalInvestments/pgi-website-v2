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

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (typically, given the structure)
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose ODM
- **Linting/Formatting**: ESLint, Prettier

## Key Features

- Secure user authentication (sign-in, sign-up, profile management) via Clerk.
- Role-based access control (Admin, Lead, Member).
- Internship board with search and filtering.
- Member portal/dashboard with protected resources.
- Responsive design for all devices.

## Project Structure

The project follows a standard Next.js App Router structure, with some key conventions:

```
pgi/
├── .github/            # GitHub Actions, issue/PR templates
├── .husky/             # Git hooks (e.g., pre-commit checks)
├── docs/               # Project documentation (architecture, contributing, etc.)
├── public/             # Static assets (images, icons, logos)
├── scripts/            # Root-level utility/maintenance scripts (add new scripts here)
├── src/                # Main source code
│   ├── app/            # Next.js App Router (pages, layouts, API routes)
│   │   ├── (auth)/     # Authentication-related pages (signin, signup)
│   │   ├── (portal)/   # Member portal routes & layouts
│   │   ├── api/        # Backend API route handlers
│   │   └── ...         # Other public/app routes (e.g., landing page, about)
│   ├── components/     # React components
│   │   ├── ui/         # Core UI elements (Button, Card, Input - often from a library like Shadcn)
│   │   ├── shared/     # Custom shared components used across multiple features
│   │   └── features/   # (Recommended) Components specific to a feature/domain
│   ├── hooks/          # Custom React hooks (e.g., useUserData, useForm)
│   ├── lib/            # Core application modules and services
│   │   ├── auth/       # Authentication helpers, user synchronization
│   │   ├── database/   # MongoDB connection (Mongoose) and model definitions
│   │   │   ├── connection.ts # Mongoose connection utility
│   │   │   └── models/     # Mongoose schema definitions (User, Internship, etc.)
│   │   ├── context/    # React Context API providers
│   │   └── rss/        # RSS feed fetching library/utilities
│   ├── server/         # Custom server logic (e.g., Socket.IO, cron jobs)
│   │   ├── index.ts    # Custom Next.js server entry point
│   │   └── rssFetcher.ts # Server-side RSS fetching scheduler & Socket.IO integration
│   ├── types/          # Global TypeScript type definitions and interfaces
│   │   ├── index.ts    # Main export for shared types
│   │   └── jest.d.ts   # Jest specific type extensions
│   ├── utils/          # General-purpose utility functions (e.g., cn, formatDate)
│   ├── middleware.ts   # Next.js middleware (handles auth, redirects)
│   └── tailwind.css    # Tailwind CSS global styles/directives
├── .env.local.example  # Example environment variables file
├── .eslintrc.json      # ESLint configuration
├── .gitignore          # Files and directories ignored by Git
├── .prettierrc         # Prettier code formatter configuration
├── jest.config.js      # Jest testing configuration
├── jest.setup.js       # Jest setup file
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.mjs  # PostCSS configuration
├── tailwind.config.mjs # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

**Key Directory Explanations:**

- **`src/app/`**: Follows Next.js App Router conventions. Group routes using parentheses `(groupName)` for organization without affecting URL paths (e.g., `(auth)`, `(portal)`).
- **`src/components/ui/`**: Typically houses base UI components. If using a library like Shadcn/ui, these are often generated here.
- **`src/components/shared/`**: For custom components reused in multiple parts of the application.
- **`src/lib/`**: Contains foundational logic. `database/connection.ts` is the standard way to connect to MongoDB. Mongoose models are in `lib/database/models/`.
- **`src/hooks/`**: For custom React hooks to encapsulate reusable stateful logic.
- **`src/utils/`**: For small, stateless utility functions. `utils.ts` contains common helpers like `cn`.
- **`src/server/`**: If you need a custom server (e.g., for WebSockets or specific background tasks), this is where it lives. `server/index.ts` starts this custom server.
- **`scripts/` (root)**: Place any project-specific scripts here (e.g., database seeding, maintenance tasks).

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc` if present, or latest LTS)
- npm (comes with Node.js)
- MongoDB database (local instance or a cloud service like MongoDB Atlas)
- A Clerk account for authentication (see [Clerk Dashboard](https://dashboard.clerk.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd pgi
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Copy the `.env.local.example` file to `.env.local` and fill in your credentials:

    ```bash
    cp .env.local.example .env.local
    ```

    You'll need to provide:

    - Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
    - MongoDB connection string (`MONGODB_URI`)
    - Your application URL (`NEXT_PUBLIC_APP_URL`, e.g., `http://localhost:3000`)

    _(Self-note: Consider if `CLERK_SETUP.md` is still relevant or if its contents should be merged here or into `docs/`)._

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Authentication & Authorization

- Authentication is managed by [Clerk](https://clerk.com/).
- Middleware in `src/middleware.ts` protects routes and handles public/private access.
- User roles and permissions are typically managed via Clerk session claims and synchronized with the MongoDB user profile. Check `src/lib/auth/` for related logic.

## Deployment

This application is configured for easy deployment on Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Configure the environment variables in your Vercel project settings similar to your `.env.local` file.
    Vercel will automatically build and deploy your Next.js application.

## Contributing

Please refer to `docs/CONTRIBUTING.md` for guidelines on how to contribute to this project. Key documents in the `docs/` folder include:

- `ARCHITECTURE.md`: Overview of the project architecture.
- `CODEBASE_CLEANUP.md`: Checklist and guide for codebase maintenance (which you're currently using!).
- `DEVELOPMENT.md`: Notes on the development process and standards.

## License

This project is proprietary software for Paragon Global Investments.
