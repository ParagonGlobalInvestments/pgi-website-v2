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
