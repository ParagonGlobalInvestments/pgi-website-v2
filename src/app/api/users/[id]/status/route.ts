import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES = ['active', 'alumni'] as const;

/** Admin-only: update a user's status (e.g. graduate to alumni) */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const db = createDatabase(requireSupabaseAdminClient());
    const user = await db.updateUserStatus(id, status);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to update user status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
