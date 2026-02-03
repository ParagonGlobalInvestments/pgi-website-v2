import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { checkMembership } from '@/lib/auth/checkMembership';
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

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = getRedirectOrigin(request);

  const defaultNext = portalEnabled ? '/portal' : '/';
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
        new URL('/login?error=auth_failed', origin)
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login?error=no_user', origin));
    }

    const { isMember } = await checkMembership(user.email, user.id);

    if (!isMember) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', origin)
      );
    }

    // Redirect to portal (handle subdomain if configured)
    // Only use portal URL redirect in production, not on localhost
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    let redirectOrigin = origin;
    if (portalUrl && next.startsWith('/portal/') && !isLocalhost) {
      redirectOrigin = portalUrl;
      next = next.replace(/^\/portal/, '') || '/';
    }
    return NextResponse.redirect(new URL(next, redirectOrigin));
  }

  return NextResponse.redirect(new URL('/login', origin));
}
