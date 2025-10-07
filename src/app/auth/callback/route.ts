import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    // Use admin client to check if user is a PGI member (bypasses RLS)
    console.log('[AUTH CALLBACK] Authenticated user:', {
      id: user.id,
      email: user.email,
    });

    const adminClient = createAdminClient();
    
    // First try by system_supabase_id
    console.log('[AUTH CALLBACK] Looking up by system_supabase_id:', user.id);
    let { data: pgiUser, error: dbError } = await adminClient
      .from('users')
      .select('id, personal_name, personal_email, system_supabase_id')
      .eq('system_supabase_id', user.id)
      .maybeSingle();

    console.log('[AUTH CALLBACK] Lookup by supabase_id result:', {
      found: !!pgiUser,
      error: dbError,
    });

    // If not found by supabase_id, try by email (for migrated users)
    if (!pgiUser && user.email) {
      console.log('[AUTH CALLBACK] Looking up by email:', user.email);
      const { data: userByEmail, error: emailError } = await adminClient
        .from('users')
        .select('id, personal_name, personal_email, system_supabase_id')
        .eq('personal_email', user.email)
        .maybeSingle();

      console.log('[AUTH CALLBACK] Lookup by email result:', {
        found: !!userByEmail,
        error: emailError,
        userData: userByEmail,
      });

      if (userByEmail) {
        pgiUser = userByEmail;

        // Update the system_supabase_id for this user
        console.log(
          '[AUTH CALLBACK] Updating system_supabase_id from',
          userByEmail.system_supabase_id,
          'to',
          user.id
        );
        const { error: updateError } = await adminClient
          .from('users')
          .update({ system_supabase_id: user.id })
          .eq('id', userByEmail.id);

        if (updateError) {
          console.error('[AUTH CALLBACK] Error updating system_supabase_id:', updateError);
        } else {
          console.log(
            `[AUTH CALLBACK] Successfully updated system_supabase_id for ${userByEmail.personal_email}`
          );
        }
      }
    }

    if (!pgiUser) {
      console.log('[AUTH CALLBACK] User not found in PGI database:', user.email);
      // User authenticated but not a PGI member - sign them out
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL('/resources?notMember=true', requestUrl.origin)
      );
    }

    console.log('[AUTH CALLBACK] User found! Redirecting to:', next);

    // User is a PGI member - redirect to intended destination
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided - redirect to sign in
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}
