import { NextResponse } from 'next/server';
import { checkMembership } from '@/lib/auth/checkMembership';
import { EditError, type Editor } from '@/lib/org-chart-edit';
import { isAdminMembership } from '@/lib/org-chart-rules';
import { requirePortalEnabledOr404 } from '@/lib/runtime';
import { requireSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Require a signed-in member for org chart edit routes and describe them as
 * an editor. Whether they may make a given edit (admin, or leader of the
 * pods involved) is checked by the edit itself in org-chart-edit.
 */
export async function requireOrgChartEditor(): Promise<
  { editor: Editor; error?: undefined } | { error: NextResponse }
> {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return { error: portalCheck };

  const supabase = await requireSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: editErrorResponse(new EditError('Unauthorized', 401)) };
  }

  const membership = await checkMembership(user.email, user.id);
  if (!membership.isMember) {
    return { error: editErrorResponse(new EditError('Forbidden', 403)) };
  }

  return {
    editor: {
      userId: membership.user?.id ?? null,
      name:
        membership.user?.name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Admin',
      isAdmin: isAdminMembership(membership),
    },
  };
}

/** `{ success: false, error }` with the error's status (500 if unknown). */
export function editErrorResponse(err: unknown): NextResponse {
  if (err instanceof EditError) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status }
    );
  }
  console.error('Org chart edit failed:', err);
  return NextResponse.json(
    { success: false, error: 'Something went wrong' },
    { status: 500 }
  );
}
