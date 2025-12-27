import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

// This route must be dynamic - it handles OAuth callbacks
export const dynamic = 'force-dynamic';

/**
 * Check if user is a PGI member by:
 * 1. Checking ADMIN_EMAILS allowlist (if configured)
 * 2. Checking users table (by supabase_id or email)
 * 3. Checking members_public table (if exists)
 */
async function isPGIMember(
  adminClient: ReturnType<typeof requireSupabaseAdminClient>,
  userEmail: string | undefined,
  userId: string
): Promise<boolean> {
  if (!userEmail) {
    return false;
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  // Check ADMIN_EMAILS allowlist first (if configured)
  const adminEmails = process.env.ADMIN_EMAILS;
  if (adminEmails) {
    const allowlist = adminEmails.split(',').map((e) => e.trim().toLowerCase());
    if (allowlist.includes(normalizedEmail)) {
      return true;
    }
  }

  // Check users table by system_supabase_id
  let { data: pgiUser } = await adminClient
    .from('users')
    .select('id, personal_name, personal_email, system_supabase_id')
    .eq('system_supabase_id', userId)
    .maybeSingle();

  // If not found by supabase_id, try by email (for migrated users)
  if (!pgiUser && normalizedEmail) {
    const { data: userByEmail } = await adminClient
      .from('users')
      .select('id, personal_name, personal_email, system_supabase_id')
      .eq('personal_email', normalizedEmail)
      .maybeSingle();

    if (userByEmail) {
      pgiUser = userByEmail;

      // Update the system_supabase_id for this user
      await adminClient
        .from('users')
        .update({ system_supabase_id: userId })
        .eq('id', userByEmail.id);
    }
  }

  if (pgiUser) {
    return true;
  }

  // Check members_public table (if it exists)
  try {
    const { data: memberPublic } = await adminClient
      .from('members_public')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (memberPublic) {
      return true;
    }
  } catch (error) {
    // Table might not exist - that's okay, continue
    // eslint-disable-next-line no-console
    console.warn('members_public table check failed (table may not exist):', error);
  }

  return false;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Default redirect depends on portal availability
  const defaultNext = portalEnabled ? '/portal/dashboard' : '/';
  const next = requestUrl.searchParams.get('next') || defaultNext;

  if (code) {
    const supabase = requireSupabaseServerClient();

    // Exchange code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/sign-in?error=auth_failed', requestUrl.origin)
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/sign-in?error=no_user', requestUrl.origin)
      );
    }

    // Use admin client to check if user is a PGI member
    const adminClient = requireSupabaseAdminClient();

    // Check membership using comprehensive check
    const isMember = await isPGIMember(
      adminClient,
      user.email,
      user.id
    );

    if (!isMember) {
      // User authenticated but not a PGI member - sign them out
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', requestUrl.origin)
      );
    }

    // User is a PGI member - redirect to intended destination
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided - redirect to sign in
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}
