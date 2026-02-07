import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidateResources } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const {
      title,
      description,
      url,
      link_url,
      type,
      tab_id,
      section,
      sort_order,
    } = body;

    if (!title || !tab_id || !section) {
      return NextResponse.json(
        { error: 'title, tab_id, and section are required' },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: String(title).trim(),
        description: description ? String(description).trim() : '',
        url: url ? String(url).trim() : '',
        link_url: link_url ? String(link_url).trim() : '',
        type: type || 'pdf',
        tab_id: String(tab_id).trim(),
        section: String(section).trim(),
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateResources();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to create resource';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
