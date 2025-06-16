import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

const isPublicRoute = createRouteMatcher([
  // Home page
  '/',

  // Main navigation routes
  '/who-we-are',
  '/members',
  '/members/value-team',
  '/members/quant-team',
  '/placements',
  '/apply',
  '/contact',

  // About section dropdown routes
  '/investment-strategy',
  '/education',
  '/sponsors',

  // National Committee routes
  '/national-committee',
  '/national-committee/(.*)',
  '/national-committee/officers',
  '/national-committee/founders',

  // API routes
  '/api/webhooks(.*)',

  // Portal auth routes (for development)
  '/portal/signin',
  '/portal/signin/(.*)',
  '/portal/signup',
  '/portal/signup/(.*)',
  '/portal/sign-up',
  '/portal/sign-up/(.*)',
]);

// Routes that should redirect to landing page in production
const isAuthRoute = createRouteMatcher([
  '/sign-in',
  '/sign-in/(.*)',
  '/sign-up',
  '/sign-up/(.*)',
  '/sign-up/verify',
  '/portal',
  '/portal/(.*)',
  '/dashboard',
  '/dashboard/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  console.log(`Middleware: ${req.method} ${req.nextUrl.pathname}`);

  // In production, redirect auth/portal routes to landing page
  if (process.env.NODE_ENV === 'production' && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublicRoute(req)) {
    await auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
