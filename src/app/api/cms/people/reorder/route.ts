import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidatePeople } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array of { id, sort_order }' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id (string) and sort_order (number)' },
          { status: 400 }
        );
      }
    }

    const supabase = requireSupabaseAdminClient();

    const updates = items.map((item: { id: string; sort_order: number }) =>
      supabase
        .from('cms_people')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) {
      return NextResponse.json(
        { error: failed.error.message },
        { status: 500 }
      );
    }

    revalidatePeople(); // reorder can affect any group
    return NextResponse.json({
      success: true,
      data: { updated: items.length },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reorder people';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
