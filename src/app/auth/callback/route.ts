import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

// This route must be dynamic - it handles OAuth callbacks
export const dynamic = 'force-dynamic';

/**
 * Compute the correct origin for redirects, handling Vercel preview domains.
 * Uses forwarded headers when available (Vercel sets these), otherwise falls back to request URL.
 *
 * @param request - Next.js request object
 * @returns Absolute origin URL (e.g., 'https://example.vercel.app')
 */
function getRedirectOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  // Use forwarded headers if available (Vercel preview/production)
  if (forwardedHost) {
    const protocol = forwardedProto === 'http' ? 'http' : 'https';
    return `${protocol}://${forwardedHost}`;
  }

  // Fallback to request URL origin
  const requestUrl = new URL(request.url);
  return requestUrl.origin;
}

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
    const allowlist = adminEmails.split(',').map(e => e.trim().toLowerCase());
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
    console.warn(
      'members_public table check failed (table may not exist):',
      error
    );
  }

  return false;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Compute correct origin using forwarded headers (Vercel preview/production)
  const origin = getRedirectOrigin(request);

  // Default redirect depends on portal availability
  const defaultNext = portalEnabled ? '/portal/dashboard' : '/';
  let next = requestUrl.searchParams.get('next') || defaultNext;

  // Ensure next is always an absolute path (starts with /)
  if (!next.startsWith('/')) {
    next = `/${next}`;
  }

  // Debug logging (non-production only)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[OAuth Callback] Debug info:', {
      incomingUrl: request.url,
      forwardedHost: request.headers.get('x-forwarded-host'),
      forwardedProto: request.headers.get('x-forwarded-proto'),
      computedOrigin: origin,
      nextPath: next,
      hasCode: !!code,
    });
  }

  if (code) {
    const supabase = requireSupabaseServerClient();

    // Exchange code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/sign-in?error=auth_failed', origin)
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL('/sign-in?error=no_user', origin));
    }

    // Use admin client to check if user is a PGI member
    const adminClient = requireSupabaseAdminClient();

    // Check membership using comprehensive check
    const isMember = await isPGIMember(adminClient, user.email, user.id);

    if (!isMember) {
      // User authenticated but not a PGI member - sign them out
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', origin)
      );
    }

    // User is a PGI member - redirect to intended destination
    // If NEXT_PUBLIC_PORTAL_URL is set and destination is a portal route,
    // redirect to the portal subdomain with a clean URL
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
    let redirectOrigin = origin;
    if (portalUrl && next.startsWith('/portal/')) {
      redirectOrigin = portalUrl;
      next = next.replace(/^\/portal/, '') || '/';
    }
    const redirectUrl = new URL(next, redirectOrigin);
    return NextResponse.redirect(redirectUrl);
  }

  // No code provided - redirect to sign in
  return NextResponse.redirect(new URL('/sign-in', origin));
}
