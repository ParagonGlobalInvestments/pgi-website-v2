import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidateTimeline } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_timeline')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to fetch timeline events';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { title, description, event_date, sort_order } = body;

    if (!title || !description || !event_date) {
      return NextResponse.json(
        { error: 'title, description, and event_date are required' },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_timeline')
      .insert({
        title: String(title).trim(),
        description: String(description).trim(),
        event_date: String(event_date).trim(),
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTimeline();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to create timeline event';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
