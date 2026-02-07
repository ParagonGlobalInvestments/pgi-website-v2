import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** Public GET — fetch experience for a given user (directory detail panel) */
export async function GET(_req: NextRequest, context: RouteContext) {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const admin = requireSupabaseAdminClient();

    const { data, error } = await admin
      .from('experience')
      .select('*')
      .eq('user_id', id)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, experience: data ?? [] });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
