import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Build-safe Supabase browser client factory.
 * Returns null if env vars are missing (prevents build-time crashes).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if env vars are missing (build-safe)
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * Require Supabase browser client - throws runtime error if env vars are missing.
 * Use this in client components where Supabase is required.
 */
export function requireSupabaseBrowserClient(): SupabaseClient {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      'Supabase client unavailable: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set'
    );
  }
  return client;
}

/**
 * Legacy export for backward compatibility.
 * Build-safe: during SSR/prerender (no window), returns null when env vars
 * are missing. useEffect hooks — where the client is actually consumed —
 * never run during SSR, so the null is harmless.
 * In the browser, throws if env vars are missing.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return getSupabaseBrowserClient() as unknown as SupabaseClient;
  }
  return requireSupabaseBrowserClient();
}
