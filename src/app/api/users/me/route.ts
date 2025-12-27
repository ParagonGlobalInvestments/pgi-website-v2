import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

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

    // Find the user by their Supabase ID
    const db = createDatabase();
    const user = await db.getUserBySupabaseId(supabaseUser.id);

    if (!user) {
      // Do NOT auto-create users - only PGI members should be in the database
      return NextResponse.json(
        { error: 'User not found in database - Not a PGI member' },
        { status: 404 }
      );
    }

    // Return user data - already formatted correctly
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Update user data
export async function PATCH(req: NextRequest) {
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
    interface UserUpdates {
      personal_bio?: string;
      personal_major?: string;
      personal_grad_year?: number;
      personal_phone?: string;
      profile_skills?: string[];
      profile_linkedin?: string;
      profile_resume_url?: string;
      profile_avatar_url?: string;
      profile_github?: string;
      profile_interests?: string[];
      profile_achievements?: string[];
      profile_experiences?: unknown[];
      profile_projects?: unknown[];
      system_first_login?: boolean;
      system_notifications_email?: boolean;
      system_notifications_platform?: boolean;
    }
    const updates: UserUpdates = {};

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user data';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
