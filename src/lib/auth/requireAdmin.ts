import { NextResponse } from 'next/server';
import type { User as AuthUser } from '@supabase/supabase-js';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { checkMembership } from '@/lib/auth/checkMembership';
import { requirePortalEnabledOr404 } from '@/lib/runtime';
import type { User } from '@/types';

/**
 * Require admin role for CMS API routes.
 * Returns { user, portalUser } on success, or a NextResponse error.
 */
export async function requireAdmin(): Promise<
  | { user: AuthUser; portalUser: User; error?: undefined }
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
    const { user: portalUser, isMember, isAdminAllowlist } = await checkMembership(
      authUser.email,
      authUser.id
    );

    if (!isMember) {
      return {
        error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
      };
    }

    // Admin allowlist users get synthetic admin access (no database record)
    if (isAdminAllowlist && !portalUser) {
      const now = new Date().toISOString();
      return {
        user: authUser,
        portalUser: {
          id: 'admin-allowlist',
          email: authUser.email ?? '',
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Admin',
          role: 'admin' as const,
          program: null,
          school: '',
          graduationYear: null,
          linkedinUrl: null,
          githubUrl: null,
          createdAt: now,
          updatedAt: now,
        },
      };
    }

    if (!portalUser || portalUser.role !== 'admin') {
      return {
        error: NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 }),
      };
    }

    return { user: authUser, portalUser };
  } catch (err) {
    const msg = err instanceof Error ? (err.message || 'Auth check failed') : 'Auth check failed';
    return {
      error: NextResponse.json({ error: msg }, { status: 500 }),
    };
  }
}
