import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const body = await req.json();

    const allowed = ['company', 'role', 'start_year', 'end_year', 'sort_order'];
    const updates: Record<string, unknown> = {};

    // Map camelCase input to snake_case DB fields
    if (body.company !== undefined)
      updates.company = String(body.company).trim();
    if (body.role !== undefined) updates.role = String(body.role).trim();
    if (body.startYear !== undefined)
      updates.start_year = body.startYear ? Number(body.startYear) : null;
    if (body.endYear !== undefined)
      updates.end_year = body.endYear ? Number(body.endYear) : null;
    if (body.sortOrder !== undefined)
      updates.sort_order = Number(body.sortOrder);

    // Also accept snake_case directly
    for (const key of allowed) {
      if (body[key] !== undefined && !(key in updates)) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const admin = requireSupabaseAdminClient();
    const { data, error } = await admin
      .from('experience')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // ownership check
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Experience entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, experience: data });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to update experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const admin = requireSupabaseAdminClient();

    const { error } = await admin
      .from('experience')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // ownership check

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to delete experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
