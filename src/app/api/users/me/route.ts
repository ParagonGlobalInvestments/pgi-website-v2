import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';
import { syncUserWithSupabase } from '@/lib/supabase/syncUser';

export const dynamic = 'force-dynamic';

// Track last sync attempts to prevent excessive syncs
const lastSyncAttempts = new Map<string, number>();
const SYNC_COOLDOWN_MS = 5000; // 5 seconds

export async function GET() {
  try {
    // Check authentication
    const supabase = createClient();
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

    console.log(`Fetching user data for Supabase ID: ${supabaseUser.id}`);

    // Find the user by their Supabase ID
    const db = createDatabase();
    let user = await db.getUserBySupabaseId(supabaseUser.id);

    if (!user) {
      console.log(
        `User not found for Supabase ID: ${supabaseUser.id} - Not a PGI member`
      );
      // Do NOT auto-create users - only PGI members should be in the database
      return NextResponse.json(
        { error: 'User not found in database - Not a PGI member' },
        { status: 404 }
      );
    }

    // Log user data for debugging
    console.log(`User found: ${user.id}`);
    console.log(`  FirstLogin: ${user.system.firstLogin}`);
    console.log(
      `  Chapter: ${user.org.chapter ? user.org.chapter.name : 'Not set'}`
    );
    console.log(`  Track: ${user.org.track || 'Not set'}`);
    console.log(`  TrackRoles: ${user.org.trackRoles.join(', ') || 'Not set'}`);

    // Return user data - already formatted correctly
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// Update user data
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
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

    // Parse request body for updatable fields
    const body = await req.json();

    // Find the user
    const db = createDatabase();
    const user = await db.getUserBySupabaseId(supabaseUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};

    // Personal information
    if (body.personal) {
      if (body.personal.bio !== undefined)
        updates.personal_bio = body.personal.bio;
      if (body.personal.major !== undefined)
        updates.personal_major = body.personal.major;
      if (body.personal.gradYear !== undefined)
        updates.personal_grad_year = body.personal.gradYear;
      if (body.personal.phone !== undefined)
        updates.personal_phone = body.personal.phone;
    }

    // Profile information
    if (body.profile) {
      if (body.profile.skills !== undefined)
        updates.profile_skills = body.profile.skills;
      if (body.profile.linkedin !== undefined)
        updates.profile_linkedin = body.profile.linkedin;
      if (body.profile.resumeUrl !== undefined)
        updates.profile_resume_url = body.profile.resumeUrl;
      if (body.profile.avatarUrl !== undefined)
        updates.profile_avatar_url = body.profile.avatarUrl;
      if (body.profile.github !== undefined)
        updates.profile_github = body.profile.github;
      if (body.profile.interests !== undefined)
        updates.profile_interests = body.profile.interests;
      if (body.profile.achievements !== undefined)
        updates.profile_achievements = body.profile.achievements;

      // Handle experiences and projects arrays if provided
      if (body.profile.experiences)
        updates.profile_experiences = body.profile.experiences;
      if (body.profile.projects)
        updates.profile_projects = body.profile.projects;
    }

    // System information
    if (body.system) {
      if (body.system.firstLogin !== undefined)
        updates.system_first_login = body.system.firstLogin;
      if (body.system.notifications) {
        if (body.system.notifications.email !== undefined)
          updates.system_notifications_email = body.system.notifications.email;
        if (body.system.notifications.platform !== undefined)
          updates.system_notifications_platform =
            body.system.notifications.platform;
      }
    }

    // Update user if we have changes
    if (Object.keys(updates).length > 0) {
      await db.updateUser(user.id, updates);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user data' },
      { status: 500 }
    );
  }
}
