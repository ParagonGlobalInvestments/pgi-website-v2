import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Pitch } from '@/lib/supabase/database';

/**
 * GET /api/pitches
 *
 * Fetch all pitches, optionally filtered by team
 *
 * Query params:
 * - team: 'value' | 'quant' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');

    // Build query
    let query = supabase
      .from('pitches')
      .select('*')
      .order('pitch_date', { ascending: false });

    // Filter by team if specified
    if (team && (team === 'value' || team === 'quant')) {
      query = query.eq('team', team);
    }

    const { data: pitches, error } = await query;

    if (error) {
      console.error('Error fetching pitches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pitches' },
        { status: 500 }
      );
    }

    return NextResponse.json(pitches || []);
  } catch (error: any) {
    console.error('Pitches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pitches
 *
 * Create a new pitch (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Validate required fields
    if (!ticker || !team || !pitch_date) {
      return NextResponse.json(
        { error: 'Missing required fields: ticker, team, pitch_date' },
        { status: 400 }
      );
    }

    // Validate team value
    if (team !== 'value' && team !== 'quant') {
      return NextResponse.json(
        { error: 'Team must be either "value" or "quant"' },
        { status: 400 }
      );
    }

    // Create pitch
    const { data: pitch, error: insertError } = await supabase
      .from('pitches')
      .insert({
        ticker: ticker.toUpperCase(),
        team,
        pitch_date,
        excel_model_path,
        pdf_report_path,
        github_url,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating pitch:', insertError);
      return NextResponse.json(
        { error: 'Failed to create pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json(pitch, { status: 201 });
  } catch (error: any) {
    console.error('Create pitch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
