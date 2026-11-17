import { NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { checkMembership } from '@/lib/auth/checkMembership';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

/**
 * Require a PGI member (or ADMIN_EMAILS allowlist) for portal API routes.
 *
 * A Supabase session alone is not membership: Google OAuth creates an auth
 * user for anyone, so routes must not trust `getUser()` by itself. Member
 * data is not readable through RLS; read it with the admin client after this
 * check passes.
 */
export async function requireMember(): Promise<{ error?: NextResponse }> {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return { error: portalCheck };

  const supabase = await requireSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { isMember } = await checkMembership(user.email, user.id);
  if (!isMember) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return {};
}
