import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/portal/dashboard';

  if (code) {
    const supabase = createClient();

    // Exchange code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
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
      console.error('Error getting user after auth:', userError);
      return NextResponse.redirect(
        new URL('/sign-in?error=no_user', requestUrl.origin)
      );
    }

    // Check if user is a PGI member by querying Supabase database directly
    const { data: pgiUser, error: dbError } = await supabase
      .from('users')
      .select('id, full_name, personal_email')
      .eq('system_supabase_id', user.id)
      .single();

    if (dbError || !pgiUser) {
      console.log('User not found in PGI database:', user.email);
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
