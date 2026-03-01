import { NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

/** Bulk GET — fetch all experience entries (for directory search) */
export async function GET() {
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

    const admin = requireSupabaseAdminClient();

    const { data, error } = await admin
      .from('experience')
      .select('user_id, company, role')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, experience: data ?? [] },
      {
        headers: {
          'Cache-Control': 'private, max-age=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
