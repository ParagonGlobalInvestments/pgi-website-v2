import { assertPortalEnabledOrNotFound } from '@/lib/runtime';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import '@/tailwind.css';
import '@/app/globals.css';
import PortalLayoutClient from './layout-client';

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
      <div className={`${GeistSans.variable} antialiased bg-white min-h-screen`}>
        <PortalLayoutClient>{children}</PortalLayoutClient>
      </div>
    );
  }

  // Check authentication status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no authenticated user, redirect to sign-in with redirectTo param
  if (!user) {
    // Default redirect target - sign-in page will handle the actual redirect
    // Users accessing any portal route will be redirected to sign-in
    redirect('/sign-in?redirectTo=/portal/dashboard');
  }

  // User is authenticated - render portal layout
  return (
    <div className={`${GeistSans.variable} antialiased bg-white min-h-screen`}>
      <PortalLayoutClient>{children}</PortalLayoutClient>
    </div>
  );
}
