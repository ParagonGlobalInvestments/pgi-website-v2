import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow sitemap.xml and robots.txt to pass through immediately
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return supabaseResponse;
  }

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith('/portal/dashboard') ||
    pathname.startsWith('/portal/signout');

  // Auth routes (sign-in, sign-up)
  const isAuthRoute =
    pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // If accessing protected route without authentication, redirect to sign-in
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user tries to access auth routes, redirect to portal
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
