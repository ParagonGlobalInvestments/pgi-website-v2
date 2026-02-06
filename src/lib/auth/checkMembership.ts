import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import type { User } from '@/types';

/**
 * Result of membership check
 */
export interface MembershipResult {
  /** Whether the user is a PGI member (or admin allowlist) */
  isMember: boolean;
  /** User data if found in database */
  user: User | null;
  /** Database ID for linking operations */
  dbId: string | null;
  /** Whether membership was granted via ADMIN_EMAILS allowlist */
  isAdminAllowlist: boolean;
}

/**
 * Check if a user is a PGI member.
 *
 * Consolidates the membership checking logic used in:
 * - /auth/callback/route.ts (login flow)
 * - /api/users/me (user data fetch)
 * - requireAdmin.ts (CMS protection)
 *
 * Check order:
 * 1. Look up by supabase_id (already linked)
 * 2. Look up by email/alternate_emails and auto-link supabase_id
 * 3. Check ADMIN_EMAILS allowlist (grants access but no user record)
 *
 * Uses admin client (bypasses RLS) for reliable membership checks.
 */
export async function checkMembership(
  email: string | undefined,
  supabaseId: string
): Promise<MembershipResult> {
  // Normalize email
  const normalizedEmail = email?.trim().toLowerCase();

  // Check admin allowlist
  const isAdminAllowlist = (() => {
    if (!normalizedEmail) return false;
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails) return false;
    const allowlist = adminEmails.split(',').map(e => e.trim().toLowerCase());
    return allowlist.includes(normalizedEmail);
  })();

  // Use admin client (bypasses RLS) for membership checks
  const adminClient = requireSupabaseAdminClient();
  const db = createDatabase(adminClient);

  // Run both lookups in parallel for faster auth (-100-150ms)
  // We'll use bySupabaseId first if found, otherwise fall back to byEmail
  const [bySupabaseId, byEmail] = await Promise.all([
    db.getUserBySupabaseId(supabaseId),
    normalizedEmail
      ? db.getUserByAnyEmail(normalizedEmail)
      : Promise.resolve(null),
  ]);

  // 1. Check by supabase_id (already linked) - highest priority
  if (bySupabaseId) {
    return {
      isMember: true,
      user: bySupabaseId,
      dbId: bySupabaseId.id,
      isAdminAllowlist: false,
    };
  }

  // 2. Check by email or alternate_emails, and link supabase_id
  if (byEmail) {
    const { dbId, ...userData } = byEmail;
    // Link for future fast lookups (fire-and-forget, non-blocking)
    db.linkSupabaseId(dbId, supabaseId).catch(err =>
      console.error('[linkSupabaseId] Failed:', err?.message)
    );
    return {
      isMember: true,
      user: userData,
      dbId,
      isAdminAllowlist: false,
    };
  }

  // 3. Admin allowlist grants access but no user record
  if (isAdminAllowlist) {
    return {
      isMember: true,
      user: null,
      dbId: null,
      isAdminAllowlist: true,
    };
  }

  // Not a member
  return {
    isMember: false,
    user: null,
    dbId: null,
    isAdminAllowlist: false,
  };
}
