import { NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { checkMembership } from '@/lib/auth/checkMembership';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

/**
 * Require admin role for CMS API routes.
 * Returns { user, portalUser } on success, or a NextResponse error.
 */
export async function requireAdmin(): Promise<
  | { user: any; portalUser: any; error?: undefined }
  | { error: NextResponse }
> {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return { error: portalCheck };

  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    // Use consolidated membership check
    const { user: portalUser, isMember } = await checkMembership(
      authUser.email,
      authUser.id
    );

    if (!isMember || !portalUser) {
      return {
        error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
      };
    }

    if (portalUser.role !== 'admin') {
      return {
        error: NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 }),
      };
    }

    return { user: authUser, portalUser };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Auth check failed';
    return {
      error: NextResponse.json({ error: msg }, { status: 500 }),
    };
  }
}
