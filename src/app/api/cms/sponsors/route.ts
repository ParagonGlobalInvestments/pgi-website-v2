import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import type { SponsorType } from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const VALID_TYPES: SponsorType[] = ['sponsor', 'partner'];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const type = req.nextUrl.searchParams.get('type');
    const supabase = requireSupabaseAdminClient();

    let query = supabase
      .from('cms_sponsors')
      .select('*')
      .order('sort_order', { ascending: true });

    if (type) {
      if (!VALID_TYPES.includes(type as SponsorType)) {
        return NextResponse.json(
          { error: `Invalid type: ${type}. Must be "sponsor" or "partner"` },
          { status: 400 }
        );
      }
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch sponsors';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { type, name, display_name, website, image_path, description, sort_order } = body;

    if (!type || !name || !display_name) {
      return NextResponse.json(
        { error: 'type, name, and display_name are required' },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type as SponsorType)) {
      return NextResponse.json(
        { error: `Invalid type: ${type}. Must be "sponsor" or "partner"` },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_sponsors')
      .insert({
        type,
        name: String(name).trim(),
        display_name: String(display_name).trim(),
        website: website ? String(website).trim() : null,
        image_path: image_path ? String(image_path).trim() : null,
        description: description ? String(description).trim() : null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create sponsor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
