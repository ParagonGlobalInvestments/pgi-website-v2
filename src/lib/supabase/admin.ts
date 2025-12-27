import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Build-safe admin client factory.
 * Returns null if env vars are missing (prevents build-time crashes).
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Return null if env vars are missing (build-safe)
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Require admin client - throws runtime error if env vars are missing.
 * ONLY use this for server-side operations that require admin access.
 * NEVER expose this client to the browser.
 */
export function requireSupabaseAdminClient(): SupabaseClient {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error(
      'Supabase admin client unavailable: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    );
  }
  return client;
}

/**
 * Legacy export for backward compatibility.
 * @deprecated Use getSupabaseAdminClient() or requireSupabaseAdminClient() instead
 */
export function createAdminClient() {
  return requireSupabaseAdminClient();
}
