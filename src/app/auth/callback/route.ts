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

  // Ensure path starts with single slash and prevent open redirect via //evil.com
  if (!next.startsWith('/')) {
    next = `/${next}`;
  }
  // Block protocol-relative URLs (//example.com) which browsers treat as same-protocol redirects
  if (next.startsWith('//')) {
    next = defaultNext;
  }

  if (code) {
    const supabase = requireSupabaseServerClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/portal/login?error=auth_failed', origin)
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/portal/login?error=no_user', origin)
      );
    }

    const { isMember } = await checkMembership(user.email, user.id);

    if (!isMember) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', origin)
      );
    }

    // Redirect to portal login page with authenticated param to show transition animation
    // The login page will then redirect to the final destination after animation
    // Using /portal/login keeps us in the same React tree for smooth CSS transitions
    const loginUrl = new URL('/portal/login', origin);
    loginUrl.searchParams.set('authenticated', 'true');
    loginUrl.searchParams.set('redirectTo', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL('/portal/login', origin));
}
