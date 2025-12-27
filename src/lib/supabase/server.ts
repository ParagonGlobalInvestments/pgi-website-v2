import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Build-safe Supabase server client factory.
 * Returns null if env vars are missing (prevents build-time crashes).
 * Only creates client when actually called (lazy initialization).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if env vars are missing (build-safe)
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  // Only access cookies when client is actually created
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Require Supabase server client - throws runtime error if env vars are missing.
 * Use this ONLY in API routes or server actions where Supabase is required.
 * DO NOT use in pages/layouts that might be prerendered.
 */
export function requireSupabaseServerClient(): SupabaseClient {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      'Supabase client unavailable: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set'
    );
  }
  return client;
}

/**
 * Legacy export for backward compatibility.
 * @deprecated Use getSupabaseServerClient() or requireSupabaseServerClient() instead
 */
export function createClient() {
  return requireSupabaseServerClient();
}
