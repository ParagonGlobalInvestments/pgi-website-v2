import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { portalEnabled } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

/**
 * Compute correct origin for redirects (handles Vercel preview domains).
 */
function getRedirectOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    const protocol = forwardedProto === 'http' ? 'http' : 'https';
    return `${protocol}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

/**
 * Check if user is a PGI member:
 * 1. ADMIN_EMAILS allowlist
 * 2. users table by supabase_id
 * 3. users table by email OR alternate_emails → link supabase_id
 */
async function isPGIMember(
  userEmail: string | undefined,
  userId: string
): Promise<boolean> {
  if (!userEmail) return false;

  const normalized = userEmail.trim().toLowerCase();
  const isAdmin = (() => {
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails) return false;
    const allowlist = adminEmails.split(',').map(e => e.trim().toLowerCase());
    return allowlist.includes(normalized);
  })();

  // Use admin client (bypasses RLS) for membership checks
  const adminClient = requireSupabaseAdminClient();
  const db = createDatabase(adminClient);

  // 1. Check by supabase_id (already linked)
  const bySupabaseId = await db.getUserBySupabaseId(userId);
  if (bySupabaseId) return true;

  // 2. Check by email or alternate_emails, and link supabase_id
  const byEmail = await db.getUserByAnyEmail(normalized);
  if (byEmail) {
    await db.linkSupabaseId(byEmail.dbId, userId);
    return true;
  }

  // 3. Admin allowlist (user not in users table but is an admin)
  if (isAdmin) return true;

  return false;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = getRedirectOrigin(request);

  const defaultNext = portalEnabled ? '/portal/dashboard' : '/';
  let next = requestUrl.searchParams.get('next') || defaultNext;

  if (!next.startsWith('/')) {
    next = `/${next}`;
  }

  if (code) {
    const supabase = requireSupabaseServerClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/sign-in?error=auth_failed', origin)
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL('/sign-in?error=no_user', origin));
    }

    const isMember = await isPGIMember(user.email, user.id);

    if (!isMember) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', origin)
      );
    }

    // Redirect to portal (handle subdomain if configured)
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
    let redirectOrigin = origin;
    if (portalUrl && next.startsWith('/portal/')) {
      redirectOrigin = portalUrl;
      next = next.replace(/^\/portal/, '') || '/';
    }
    return NextResponse.redirect(new URL(next, redirectOrigin));
  }

  return NextResponse.redirect(new URL('/sign-in', origin));
}
