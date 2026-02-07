import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

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

    const db = createDatabase(requireSupabaseAdminClient());
    const user = await db.getUserBySupabaseId(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const admin = requireSupabaseAdminClient();
    const { data, error } = await admin
      .from('experience')
      .select('*')
      .eq('user_id', user.id)
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

export async function POST(req: NextRequest) {
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

    const db = createDatabase(requireSupabaseAdminClient());
    const user = await db.getUserBySupabaseId(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { company, role, startYear, endYear } = body;

    if (!company || !role) {
      return NextResponse.json(
        { error: 'company and role are required' },
        { status: 400 }
      );
    }

    const admin = requireSupabaseAdminClient();

    // Get next sort_order
    const { data: existing } = await admin
      .from('experience')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSort =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await admin
      .from('experience')
      .insert({
        user_id: user.id,
        company: String(company).trim(),
        role: String(role).trim(),
        start_year: startYear ? Number(startYear) : null,
        end_year: endYear ? Number(endYear) : null,
        sort_order: nextSort,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, experience: data },
      { status: 201 }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to create experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
