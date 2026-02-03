import type { Metadata } from 'next';
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
 * Server component wrapper - enforces portal availability and authentication.
 * This is the secure choke point for all portal routes.
 * Runs on Node runtime (not Edge) so we can use Supabase server client.
 */
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Assert portal is enabled (calls notFound() if disabled)
  assertPortalEnabledOrNotFound();

  // Server-side authentication check using Node runtime Supabase client
  const supabase = getSupabaseServerClient();
  
  // If Supabase is not configured, allow through (will fail gracefully at runtime)
  // This prevents build-time crashes while preserving runtime behavior
  if (!supabase) {
    // In production, this should not happen, but during build it's acceptable
    // Protected routes will fail at runtime with proper error handling
    return (
      <div className="antialiased bg-white min-h-screen">
        <PortalLayoutClient>{children}</PortalLayoutClient>
      </div>
    );
  }

  // Check authentication status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no authenticated user, redirect to login with redirectTo param
  if (!user) {
    redirect('/login?redirectTo=/portal');
  }

  // User is authenticated - render portal layout
  return (
    <div className="antialiased bg-white min-h-screen">
      <PortalLayoutClient>{children}</PortalLayoutClient>
    </div>
  );
}
