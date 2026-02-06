import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { assertPortalEnabledOrNotFound } from '@/lib/runtime';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import '@/tailwind.css';
import '@/app/globals.css';
import PortalLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Portal | Paragon Global Investments',
  description: 'PGI member portal — directory, resources, and team tools.',
  openGraph: {
    title: 'Portal | Paragon Global Investments',
    description: 'PGI member portal — directory, resources, and team tools.',
    images: [
      {
        url: '/api/og/portal',
        width: 1200,
        height: 630,
        alt: 'Paragon Global Investments Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal | Paragon Global Investments',
    description: 'PGI member portal — directory, resources, and team tools.',
    images: ['/api/og/portal'],
  },
};

/**
 * Check if the current path is an auth route that should bypass authentication.
 * Auth routes are served within the portal layout but don't require a session.
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.includes('/portal/login') || pathname.includes('/login');
}

/**
 * Server component wrapper - enforces portal availability and authentication.
 * This is the secure choke point for all portal routes.
 * Runs on Node runtime (not Edge) so we can use Supabase server client.
 *
 * Auth routes (/portal/login) are exempted from the redirect to allow
 * the unified portal shell to handle both login and dashboard views.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Assert portal is enabled (calls notFound() if disabled)
  assertPortalEnabledOrNotFound();

  // Get pathname and search params from headers (set by middleware) to detect auth routes
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const searchParams = headersList.get('x-search-params') || '';
  const isOnAuthRoute = isAuthRoute(pathname);

  // Check if this is a post-authentication redirect (needs to play animation)
  const isPostAuthRedirect = searchParams.includes('authenticated=true');

  // Server-side authentication check using Node runtime Supabase client
  const supabase = getSupabaseServerClient();

  // If Supabase is not configured, allow through (will fail gracefully at runtime)
  // This prevents build-time crashes while preserving runtime behavior
  if (!supabase) {
    return (
      <div className="antialiased bg-white min-h-screen">
        <PortalLayoutClient isAuthenticated={false}>
          {children}
        </PortalLayoutClient>
      </div>
    );
  }

  // Check authentication status
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If Supabase errored AND no user, redirect to login with error indicator
  if (authError && !user && !isOnAuthRoute) {
    redirect('/portal/login?error=auth_failed');
  }

  // If no authenticated user and not on auth route, redirect to portal login
  if (!user && !isOnAuthRoute) {
    const destination = pathname || '/portal';
    redirect(`/portal/login?redirectTo=${encodeURIComponent(destination)}`);
  }

  // If authenticated user is on login route (but NOT returning from OAuth), redirect to dashboard
  // This prevents showing login form with sidebar for already-authenticated users
  // Exception: allow ?authenticated=true through so the animation can play
  if (user && isOnAuthRoute && !isPostAuthRedirect) {
    redirect('/portal');
  }

  // Render portal layout - the client wrapper handles shell mode based on auth state
  // Pass isPostAuthRedirect so client can show login animation before dashboard
  return (
    <div className="antialiased bg-white min-h-screen">
      <PortalLayoutClient
        isAuthenticated={!!user}
        isPostAuthRedirect={isPostAuthRedirect}
      >
        {children}
      </PortalLayoutClient>
    </div>
  );
}
