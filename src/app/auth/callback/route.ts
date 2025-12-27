import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This route must be dynamic - it handles OAuth callbacks
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/portal/dashboard';

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

    // Use admin client to check if user is a PGI member (bypasses RLS)
    const adminClient = requireSupabaseAdminClient();
    
    // First try by system_supabase_id
    const { data: pgiUser } = await adminClient
      .from('users')
      .select('id, personal_name, personal_email, system_supabase_id')
      .eq('system_supabase_id', user.id)
      .maybeSingle();

    // If not found by supabase_id, try by email (for migrated users)
    if (!pgiUser && user.email) {
      const { data: userByEmail } = await adminClient
        .from('users')
        .select('id, personal_name, personal_email, system_supabase_id')
        .eq('personal_email', user.email)
        .maybeSingle();

      if (userByEmail) {
        pgiUser = userByEmail;

        // Update the system_supabase_id for this user
        await adminClient
          .from('users')
          .update({ system_supabase_id: user.id })
          .eq('id', userByEmail.id);
      }
    }

    if (!pgiUser) {
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
