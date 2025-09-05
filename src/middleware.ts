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

  // Legal pages
  '/privacy-policy',

  // SEO files
  '/sitemap.xml',
  '/robots.txt',

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

  const pathname = req.nextUrl.pathname;

  // Allow sitemap.xml and robots.txt to pass through immediately
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    console.log(`Allowing ${pathname} to pass through middleware`);
    return NextResponse.next();
  }

  // Legacy route handling removed

  // In production, redirect auth/portal routes to landing page
  if (process.env.NODE_ENV === 'production' && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isPublicRoute(req)) {
    await auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
