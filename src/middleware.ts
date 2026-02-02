import { NextResponse, type NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

/**
 * Edge-clean middleware - routing, path gating, and subdomain detection.
 * No Supabase imports or Node.js APIs - runs on Edge runtime.
 * Authentication enforcement happens server-side in portal layout.
 *
 * Order of operations:
 * 1. Static file bypass
 * 2. Portal gating (404 when disabled)
 * 3. Subdomain detection + routing (portal.* → /portal/*)
 * 4. Pass through
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow static files and Next.js internals to pass through immediately
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/site.webmanifest' ||
    pathname === '/browserconfig.xml'
  ) {
    return NextResponse.next();
  }

  // Hard-block portal routes when portal is disabled (single source of truth: portalEnabled)
  if (!portalEnabled) {
    const isPortalRoute =
      pathname.startsWith('/portal') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/__tests__');

    if (isPortalRoute) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Subdomain detection: portal.paragoninvestments.org or portal.localhost.nip.io:3000
  const host = request.headers.get('host') || '';
  const isPortalSubdomain = host.startsWith('portal.');

  if (isPortalSubdomain && portalEnabled) {
    // Auth/API routes live at root level — must NOT be rewritten to /portal/*
    const isRootRoute =
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/resources');

    if (isRootRoute) {
      return NextResponse.next();
    }

    // /portal/* on subdomain → redirect to strip prefix (clean URLs)
    if (pathname.startsWith('/portal')) {
      const cleanPath = pathname.replace(/^\/portal/, '') || '/';
      const url = request.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url, 301);
    }

    // All other paths → rewrite to /portal/* (transparent to user)
    const url = request.nextUrl.clone();
    url.pathname = `/portal${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
