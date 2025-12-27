import { NextResponse, type NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

/**
 * Edge-clean middleware - routing and path gating only.
 * No Supabase imports or Node.js APIs - runs on Edge runtime.
 * Authentication enforcement happens server-side in portal layout.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Hard-block portal routes in production (single source of truth: portalEnabled)
  if (!portalEnabled) {
    const isPortalRoute =
      pathname.startsWith('/portal') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/__tests__');

    if (isPortalRoute) {
      // Return 404 response - don't rewrite to avoid routing issues
      return new NextResponse(null, { status: 404 });
    }
  }

  // Allow static files and Next.js internals to pass through immediately
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/site.webmanifest' ||
    pathname === '/browserconfig.xml'
  ) {
    return NextResponse.next();
  }

  // All other routing logic (auth checks, redirects) happens server-side
  // in portal layout.tsx using Node runtime Supabase client
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
