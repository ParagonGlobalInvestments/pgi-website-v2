import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidateResources } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const allowed = [
      'title',
      'description',
      'url',
      'link_url',
      'type',
      'tab_id',
      'section',
      'sort_order',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    revalidateResources();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to update resource';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const supabase = requireSupabaseAdminClient();

    const { error } = await supabase.from('resources').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateResources();
    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to delete resource';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
