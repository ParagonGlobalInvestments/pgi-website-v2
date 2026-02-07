import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import type { PeopleGroupSlug } from '@/lib/cms/types';
import { revalidatePeople } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

const VALID_GROUPS: PeopleGroupSlug[] = [
  'officers',
  'alumni-board',
  'founders',
  'chapter-founders',
  'investment-committee',
  'portfolio-managers',
  'value-analysts',
  'quant-research-committee',
  'quant-analysts',
  'recruitment-team',
];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const group = req.nextUrl.searchParams.get('group');
    const supabase = requireSupabaseAdminClient();

    let query = supabase
      .from('cms_people')
      .select('*')
      .order('sort_order', { ascending: true });

    if (group) {
      if (!VALID_GROUPS.includes(group as PeopleGroupSlug)) {
        return NextResponse.json(
          { error: `Invalid group: ${group}` },
          { status: 400 }
        );
      }
      query = query.eq('group_slug', group);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch people';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const {
      group_slug,
      name,
      title,
      school,
      company,
      linkedin,
      headshot_url,
      sort_order,
    } = body;

    if (!group_slug || !name) {
      return NextResponse.json(
        { error: 'group_slug and name are required' },
        { status: 400 }
      );
    }

    if (!VALID_GROUPS.includes(group_slug as PeopleGroupSlug)) {
      return NextResponse.json(
        { error: `Invalid group_slug: ${group_slug}` },
        { status: 400 }
      );
    }

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_people')
      .insert({
        group_slug,
        name: String(name).trim(),
        title: title ? String(title).trim() : null,
        school: school ? String(school).trim() : null,
        company: company ? String(company).trim() : null,
        linkedin: linkedin ? String(linkedin).trim() : null,
        headshot_url: headshot_url ? String(headshot_url).trim() : null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePeople(group_slug as PeopleGroupSlug);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create person';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
