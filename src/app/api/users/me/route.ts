import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import { syncUserWithMongoDB } from '@/lib/auth/syncUser';

export const dynamic = 'force-dynamic';

// Track last sync attempts to prevent excessive syncs
const lastSyncAttempts = new Map<string, number>();
const SYNC_COOLDOWN_MS = 5000; // 5 seconds

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    console.log(`Fetching user data for Clerk ID: ${session.userId}`);

    // Find the user in MongoDB by their Clerk ID
    let user = await User.findOne({
      'system.clerkId': session.userId,
    }).populate('org.chapterId');

    if (!user) {
      console.log(
        `User not found for Clerk ID: ${session.userId}, attempting sync`
      );
      // Check if we've tried to sync recently
      const now = Date.now();
      const lastAttempt = lastSyncAttempts.get(session.userId);

      if (lastAttempt && now - lastAttempt < SYNC_COOLDOWN_MS) {
        return NextResponse.json(
          { error: 'User not found and sync cooldown active' },
          { status: 404 }
        );
      }

      // Track this sync attempt
      lastSyncAttempts.set(session.userId, now);

      // Attempt to create/sync the user
      await syncUserWithMongoDB();
      user = await User.findOne({ 'system.clerkId': session.userId }).populate(
        'org.chapterId'
      );

      // If still not found, return error
      if (!user) {
        console.log(
          `User still not found after sync for Clerk ID: ${session.userId}`
        );
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        );
      }
    }

    // Log user data for debugging
    console.log(`User found: ${user._id}`);
    console.log(`  FirstLogin: ${user.system.firstLogin}`);
    console.log(
      `  Chapter: ${user.org.chapterId ? user.org.chapterId.name : 'Not set'}`
    );
    console.log(`  Track: ${user.org.track || 'Not set'}`);
    console.log(`  TrackRoles: ${user.org.trackRoles.join(', ') || 'Not set'}`);

    // Return user data without sensitive info
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        personal: {
          name: user.personal.name,
          email: user.personal.email,
          bio: user.personal.bio || '',
          major: user.personal.major || '',
          gradYear: user.personal.gradYear,
          isAlumni: user.personal.isAlumni,
          phone: user.personal.phone || '',
        },
        org: {
          chapter: user.org.chapterId
            ? {
                id: user.org.chapterId._id,
                name: user.org.chapterId.name,
                slug: user.org.chapterId.slug,
                logoUrl: user.org.chapterId.logoUrl,
              }
            : null,
          permissionLevel: user.org.permissionLevel,
          track: user.org.track,
          trackRoles: user.org.trackRoles || [],
          execRoles: user.org.execRoles || [],
          status: user.org.status,
        },
        profile: {
          skills: user.profile.skills || [],
          projects: user.profile.projects || [],
          experiences: user.profile.experiences || [],
          linkedin: user.profile.linkedin || '',
          resumeUrl: user.profile.resumeUrl || '',
          avatarUrl: user.profile.avatarUrl || '',
          github: user.profile.github || '',
          interests: user.profile.interests || [],
          achievements: user.profile.achievements || [],
        },
        activity: {
          lastLogin: user.activity.lastLogin,
          internshipsPosted: user.activity.internshipsPosted || 0,
        },
        system: {
          firstLogin: user.system.firstLogin,
          notifications: user.system.notifications || {
            email: true,
            platform: true,
          },
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Parse request body for updatable fields
    const body = await req.json();

    // Find the user
    const user = await User.findOne({ 'system.clerkId': session.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Update fields based on the request
    // Personal information
    if (body.personal) {
      if (body.personal.bio !== undefined)
        user.personal.bio = body.personal.bio;
      if (body.personal.major !== undefined)
        user.personal.major = body.personal.major;
      if (body.personal.gradYear !== undefined)
        user.personal.gradYear = body.personal.gradYear;
      if (body.personal.phone !== undefined)
        user.personal.phone = body.personal.phone;
    }

    // Profile information
    if (body.profile) {
      if (body.profile.skills !== undefined)
        user.profile.skills = body.profile.skills;
      if (body.profile.linkedin !== undefined)
        user.profile.linkedin = body.profile.linkedin;
      if (body.profile.resumeUrl !== undefined)
        user.profile.resumeUrl = body.profile.resumeUrl;
      if (body.profile.avatarUrl !== undefined)
        user.profile.avatarUrl = body.profile.avatarUrl;
      if (body.profile.github !== undefined)
        user.profile.github = body.profile.github;
      if (body.profile.interests !== undefined)
        user.profile.interests = body.profile.interests;
      if (body.profile.achievements !== undefined)
        user.profile.achievements = body.profile.achievements;

      // Handle experiences and projects arrays if provided
      if (body.profile.experiences)
        user.profile.experiences = body.profile.experiences;
      if (body.profile.projects) user.profile.projects = body.profile.projects;
    }

    // System information
    if (body.system) {
      if (body.system.firstLogin !== undefined)
        user.system.firstLogin = body.system.firstLogin;
      if (body.system.notifications) {
        if (body.system.notifications.email !== undefined)
          user.system.notifications.email = body.system.notifications.email;
        if (body.system.notifications.platform !== undefined)
          user.system.notifications.platform =
            body.system.notifications.platform;
      }
    }

    // Save updated user
    await user.save();

    // Return updated user data
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
