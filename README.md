# Paragon Global Investments

Student-run intercollegiate investment fund focused on value investing and algorithmic trading.

## Folder Structure

```
pgi/
├── public/               # Static assets
│   ├── icons/            # SVG and other icon files
│   ├── logos/            # Logo files
│   └── images/           # General images
│       └── universities/ # University logos
│
├── src/                  # Source code
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   └── shared/       # Shared components
│   │
│   └── lib/              # Utility functions and shared code
│       ├── database/     # Database connections and operations
│       ├── utils/        # Utility functions
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript types and interfaces
```

# Paragon Global Investments Website

This is a modern remake of the Paragon Global Investments website, built with Next.js, TypeScript, and Tailwind CSS. It features authentication via Clerk and uses MongoDB for data storage.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS

## Features

- Responsive design that works across all devices
- Authentication system with Clerk (sign-in, sign-up)
- Protected dashboard for members
- MongoDB integration for data persistence

## Project Structure

- `src/app`: All page components using the App Router
- `src/components`: Reusable UI components
- `src/lib`: Utility functions and database connections

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:

   - Create a `.env.local` file and add your Clerk and MongoDB credentials:

   ```
   # Clerk Auth Keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `MONGODB_URI`: Your MongoDB connection string
- `NEXT_PUBLIC_APP_URL`: The URL where your app is hosted

## Deployment

This site can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fparagon-global-investments)

Don't forget to add the environment variables in your Vercel project settings.

# PGI Portal - University Investment Club

This repository contains the code for Paragon Global Investments (PGI) portal, a platform for university investment club members to access internship listings and other club resources.

## Features

- **Authentication**: Secure sign-in with Clerk
- **Role-Based Access Control**: Admin, Lead, and Member roles with different permissions
- **Internship Board**: Searchable and filterable list of internship opportunities
- **MongoDB Integration**: Data storage for internships and other resources
- **Mobile-Responsive UI**: Clean interface that works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or Atlas)
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL
   ```

4. Set up Clerk JWT Templates and user metadata as described in [CLERK_SETUP.md](CLERK_SETUP.md)

5. Run the development server:

   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app` - Next.js 14 App Router pages
- `/src/components` - React components
- `/src/lib` - Utilities and helpers
  - `/lib/database` - MongoDB connection and models
  - `/lib/auth` - Authentication helpers
- `/public` - Static assets

## Authentication and Authorization

Authentication is handled by Clerk. The middleware in `src/middleware.ts` protects routes and enforces role-based access control:

- **Public Routes**: Landing page, sign in/up, etc.
- **Protected Routes**: Dashboard, internships, etc.
- **Role-Based Routes**: Admin and lead-only sections

For more details, see the [CLERK_SETUP.md](CLERK_SETUP.md) file.

## Database Schema

MongoDB is used to store data. The main collections are:

- **Internships**: Job opportunities with fields for title, company, deadline, etc.

## API Routes

- `GET /api/internships` - List internships with filtering options
- `POST /api/internships` - Create a new internship (admin/lead only)

## License

This project is proprietary software for Paragon Global Investments.
