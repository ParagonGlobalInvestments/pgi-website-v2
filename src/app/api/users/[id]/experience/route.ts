import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireMember } from '@/lib/auth/requireMember';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** Public GET — fetch experience for a given user (directory detail panel) */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireMember();
    if (auth.error) return auth.error;

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
