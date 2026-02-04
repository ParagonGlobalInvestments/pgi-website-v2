import { NextResponse, type NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

/**
 * Helper to create a response with x-pathname and x-search-params headers.
 * These headers allow server components to detect the current path and query params.
 */
function createResponseWithHeaders(
  pathname: string,
  searchParams: string,
  response?: NextResponse
): NextResponse {
  const res = response || NextResponse.next();
  res.headers.set('x-pathname', pathname);
  res.headers.set('x-search-params', searchParams);
  return res;
}

/**
 * Edge-clean middleware - routing, path gating, and subdomain detection.
 * No Supabase imports or Node.js APIs - runs on Edge runtime.
 * Authentication enforcement happens server-side in portal layout.
 *
 * Order of operations:
 * 1. Static file bypass
 * 2. Portal gating (404 when disabled)
 * 3. Subdomain detection + routing (portal.* → /portal/*)
 * 4. Pass through with x-pathname header
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.search;

  // Allow static files and Next.js internals to pass through immediately
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/site.webmanifest' ||
    pathname === '/browserconfig.xml' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Hard-block portal routes when portal is disabled (single source of truth: portalEnabled)
  if (!portalEnabled) {
    const isPortalRoute =
      pathname.startsWith('/portal') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/__tests__');

    if (isPortalRoute) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Subdomain detection: portal.paragoninvestments.org or portal.127.0.0.1.sslip.io:3000
  const host = request.headers.get('host') || '';
  const isPortalSubdomain = host.startsWith('portal.');

  // Redirect portal routes to portal subdomain when not already on it.
  // /auth/callback stays on the main domain (OAuth requires it).
  // Skip redirect if portal URL is same as current host (local dev).
  if (!isPortalSubdomain && portalEnabled) {
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
    const isPortalRoute =
      pathname.startsWith('/login') || pathname.startsWith('/portal');

    // Don't redirect if portal URL matches current host (prevents loop in local dev)
    const portalHost = portalUrl ? new URL(portalUrl).host : null;
    const isSameHost = portalHost === host;

    if (portalUrl && isPortalRoute && !isSameHost) {
      // Redirect to portal subdomain, preserving path + query string
      // /portal/* paths get cleaned (middleware on subdomain handles rewrite)
      // /login redirects to /login on subdomain (will be rewritten to /portal/login)
      const cleanPath = pathname.startsWith('/portal')
        ? pathname.replace(/^\/portal/, '') || '/'
        : pathname;
      const search = request.nextUrl.search;
      return NextResponse.redirect(`${portalUrl}${cleanPath}${search}`, 307);
    }
  }

  if (isPortalSubdomain && portalEnabled) {
    // API routes must NOT be rewritten to /portal/*
    if (pathname.startsWith('/api/')) {
      return createResponseWithHeaders(pathname, searchParams);
    }

    // Auth callback stays at root level
    if (pathname.startsWith('/auth/')) {
      return createResponseWithHeaders(pathname, searchParams);
    }

    // Legacy /login path → redirect to /portal/login (now under portal route)
    if (pathname === '/login' || pathname.startsWith('/login')) {
      const url = request.nextUrl.clone();
      // Rewrite to /portal/login (keeps /login in URL, serves /portal/login)
      url.pathname = `/portal${pathname}`;
      const response = NextResponse.rewrite(url);
      return createResponseWithHeaders(
        `/portal${pathname}`,
        searchParams,
        response
      );
    }

    // /portal/* on subdomain → redirect to strip prefix (clean URLs)
    if (pathname.startsWith('/portal')) {
      const cleanPath = pathname.replace(/^\/portal/, '') || '/';
      const url = request.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url, 301);
    }

    // Legacy path redirect: /home → / (prevents 404 from cached/stale links)
    if (pathname === '/home') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url, 301);
    }

    // All other paths → rewrite to /portal/* (transparent to user)
    const url = request.nextUrl.clone();
    url.pathname = `/portal${pathname}`;
    const response = NextResponse.rewrite(url);
    return createResponseWithHeaders(
      `/portal${pathname}`,
      searchParams,
      response
    );
  }

  // Default: pass through with x-pathname header
  return createResponseWithHeaders(pathname, searchParams);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
