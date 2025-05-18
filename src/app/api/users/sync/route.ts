import { NextRequest, NextResponse } from 'next/server';
import { syncUserWithMongoDB } from '@/lib/auth/syncUser';
import { auth } from '@clerk/nextjs/server';
import User from '@/lib/database/models/User';
import { connectToDatabase } from '@/lib/database/connection';

export const dynamic = 'force-dynamic';

// Add a simple cache to avoid redundant syncs in a short time period
const lastSyncTimes = new Map<string, number>();
const SYNC_COOLDOWN_MS = 0; // Temporarily disable cooldown to allow all sync attempts

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body first for logging
    const body = await req.json();

    // Log full request body for debugging
    console.log('FULL SYNC REQUEST BODY:', JSON.stringify(body, null, 2));

    // Skip cooldown check temporarily
    /*
    // Check if we recently synced this user
    const lastSyncTime = lastSyncTimes.get(session.userId);
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      // Get existing user without syncing
      await connectDB();
      const existingUser = await User.findOne({
        'system.clerkId': session.userId,
      });

      if (existingUser) {
        console.log('Using cached user data - sync skipped (cooldown active)');
        return NextResponse.json({
          success: true,
          user: {
            id: existingUser._id,
            personal: {
              name: existingUser.personal.name,
              email: existingUser.personal.email,
              bio: existingUser.personal.bio || '',
              major: existingUser.personal.major || '',
              gradYear: existingUser.personal.gradYear,
              isAlumni: existingUser.personal.isAlumni,
            },
            org: {
              permissionLevel: existingUser.org.permissionLevel,
              track: existingUser.org.track,
              trackRoles: existingUser.org.trackRoles || [],
              execRoles: existingUser.org.execRoles || [],
            },
            profile: {
              skills: existingUser.profile.skills || [],
            },
            system: {
              firstLogin: existingUser.system.firstLogin,
            },
          },
          cached: true,
        });
      }
    }
    */

    // Update sync time
    const now = Date.now();
    lastSyncTimes.set(session.userId, now);

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

    // Log the sync options for debugging
    console.log(
      'Syncing user with options:',
      JSON.stringify(
        {
          track: syncOptions.track,
          chapterName: syncOptions.chapterName,
          trackRoles: syncOptions.trackRoles,
          firstLogin: syncOptions.firstLogin,
        },
        null,
        2
      )
    );

    // Sync user with MongoDB
    const user = await syncUserWithMongoDB(syncOptions);

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
        },
        org: {
          permissionLevel: user.org.permissionLevel,
          track: user.org.track,
          trackRoles: user.org.trackRoles || [],
          execRoles: user.org.execRoles || [],
        },
        profile: {
          skills: user.profile.skills || [],
        },
        system: {
          firstLogin: user.system.firstLogin,
        },
      },
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
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Check if we recently synced this user
    const lastSyncTime = lastSyncTimes.get(session.userId);
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      // Get existing user without syncing
      await connectToDatabase();
      const existingUser = await User.findOne({
        'system.clerkId': session.userId,
      });

      if (existingUser) {
        console.log('Using cached user data - sync skipped (cooldown active)');
        return NextResponse.json({
          success: true,
          user: {
            id: existingUser._id,
            personal: {
              name: existingUser.personal.name,
              email: existingUser.personal.email,
              bio: existingUser.personal.bio || '',
              major: existingUser.personal.major || '',
              gradYear: existingUser.personal.gradYear,
              isAlumni: existingUser.personal.isAlumni,
            },
            org: {
              permissionLevel: existingUser.org.permissionLevel,
              track: existingUser.org.track,
              trackRoles: existingUser.org.trackRoles || [],
              execRoles: existingUser.org.execRoles || [],
            },
            profile: {
              skills: existingUser.profile.skills || [],
            },
            system: {
              firstLogin: existingUser.system.firstLogin,
            },
          },
          cached: true,
        });
      }
    }

    // Update sync time
    lastSyncTimes.set(session.userId, now);

    // Sync user with default values
    const user = await syncUserWithMongoDB();

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
        },
        org: {
          permissionLevel: user.org.permissionLevel,
          track: user.org.track,
          trackRoles: user.org.trackRoles || [],
          execRoles: user.org.execRoles || [],
        },
        profile: {
          skills: user.profile.skills || [],
        },
        system: {
          firstLogin: user.system.firstLogin,
        },
      },
    });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    );
  }
}
