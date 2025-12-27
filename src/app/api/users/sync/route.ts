import { NextRequest, NextResponse } from 'next/server';
import { syncUserWithSupabase } from '@/lib/supabase/syncUser';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

// Add a simple cache to avoid redundant syncs in a short time period
const lastSyncTimes = new Map<string, number>();
const SYNC_COOLDOWN_MS = 0; // Temporarily disable cooldown to allow all sync attempts

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Update sync time
    const now = Date.now();
    lastSyncTimes.set(supabaseUser.id, now);

    // Parse request body
    const syncOptions = {
      gradYear: body.gradYear,
      skills: body.skills,
      bio: body.bio,
      linkedin: body.linkedin,
      resumeUrl: body.resumeUrl,
      avatarUrl: body.avatarUrl,
      major: body.major,
      github: body.github,
      trackRoles: body.trackRoles,
      track: body.track,
      chapterName: body.chapter,
      firstLogin: body.firstLogin,
      experiences: body.experiences,
      interests: body.interests,
      achievements: body.achievements,
      phone: body.phone,
    };

    // Sync user with Supabase
    const user = await syncUserWithSupabase(syncOptions);

    // Return user data - already formatted correctly
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}

// Also support GET requests to simply sync the current user without additional data
export async function GET() {
  try {
    // Check authentication
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Check if we recently synced this user
    const lastSyncTime = lastSyncTimes.get(supabaseUser.id);
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      // Get existing user without syncing
      const db = createDatabase();
      const existingUser = await db.getUserBySupabaseId(supabaseUser.id);

      if (existingUser) {
        return NextResponse.json({
          success: true,
          user: existingUser,
          cached: true,
        });
      }
    }

    // Update sync time
    lastSyncTimes.set(supabaseUser.id, now);

    // Sync user with default values
    const user = await syncUserWithSupabase();

    // Return user data - already formatted correctly
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync user';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
