import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

/**
 * GET /api/pitches/[id]
 *
 * Fetch a single pitch by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Portal-only API - block in production
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: pitch, error } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    return NextResponse.json(pitch);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pitches/[id]
 *
 * Update a pitch (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Portal-only API - block in production
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_permission_level')
      .eq('system_supabase_id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    if (userData.org_permission_level !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      ticker,
      team,
      pitch_date,
      excel_model_path,
      pdf_report_path,
      github_url,
    } = body;

    // Build update object with only provided fields
    interface PitchUpdates {
      updated_at: string;
      ticker?: string;
      team?: 'value' | 'quant';
      pitch_date?: string;
      excel_model_path?: string | null;
      pdf_report_path?: string | null;
      github_url?: string | null;
    }
    const updates: PitchUpdates = { updated_at: new Date().toISOString() };

    if (ticker) updates.ticker = ticker.toUpperCase();
    if (team) {
      if (team !== 'value' && team !== 'quant') {
        return NextResponse.json(
          { error: 'Team must be either "value" or "quant"' },
          { status: 400 }
        );
      }
      updates.team = team;
    }
    if (pitch_date) updates.pitch_date = pitch_date;
    if (excel_model_path !== undefined)
      updates.excel_model_path = excel_model_path;
    if (pdf_report_path !== undefined)
      updates.pdf_report_path = pdf_report_path;
    if (github_url !== undefined) updates.github_url = github_url;

    // Update pitch
    const { data: pitch, error: updateError } = await supabase
      .from('pitches')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError || !pitch) {
      return NextResponse.json(
        { error: 'Failed to update pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json(pitch);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pitches/[id]
 *
 * Delete a pitch (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Portal-only API - block in production
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_permission_level')
      .eq('system_supabase_id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    if (userData.org_permission_level !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Delete pitch
    const { error: deleteError } = await supabase
      .from('pitches')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
