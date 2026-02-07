import { NextResponse } from 'next/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('tab_id')
      .order('section')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to fetch resources';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
