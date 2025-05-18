import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Get all users for the directory
export async function GET(req: NextRequest) {
  try {
    // Add timestamp and user ID for better logging
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] API Request: /api/users`);

    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      console.log(`[${timestamp}] Unauthorized request to /api/users`);
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    console.log(
      `[${timestamp}] User ${session.userId} requested directory data`
    );

    await connectToDatabase();
    console.log(`[${timestamp}] Connected to MongoDB`);

    // Log the raw query being executed
    console.log(`[${timestamp}] Finding users in MongoDB`);
    // Find all users without any filtering first to see what's in the database
    const allUsers = await User.find({}).lean();
    console.log(`[${timestamp}] Total users in database: ${allUsers.length}`);

    if (allUsers.length === 0) {
      console.log(`[${timestamp}] WARNING: No users found in the database!`);
    } else {
      // Log a sample of the first user to see its structure
      console.log(
        `[${timestamp}] First user sample:`,
        JSON.stringify(
          {
            id: allUsers[0]._id,
            personal: allUsers[0].personal,
            org: allUsers[0].org,
          },
          null,
          2
        )
      );
    }

    // Get filters from query params - support both nested and flat formats for backward compatibility
    const searchParams = req.nextUrl.searchParams;

    // Check for both old and new parameter formats
    const role =
      searchParams.get('org.permissionLevel') ||
      searchParams.get('permissionLevel');
    const track = searchParams.get('org.track') || searchParams.get('track');
    const chapter =
      searchParams.get('org.chapter.name') || searchParams.get('chapter');

    console.log(`[${timestamp}] Directory filters:`, { role, track, chapter });

    // Build query with new nested schema
    const query: any = {};
    if (role && role !== 'all') query['org.permissionLevel'] = role;
    if (track && track !== 'all') query['org.track'] = track;
    if (chapter && chapter !== 'all') {
      // The chapter can be in multiple places depending on data model
      query['$or'] = [
        { 'org.chapter.name': chapter }, // New schema with embedded chapter
        { 'chapterId.name': chapter }, // Old schema with populated chapter field
        { chapterId: { $exists: true } }, // Fallback for old schema without population
      ];
    }

    console.log(`[${timestamp}] Using MongoDB query:`, JSON.stringify(query));

    // Find all users with the new schema structure
    let users = await User.find(query)
      .sort({ 'personal.name': 1 }) // Sort by name
      .lean();

    console.log(`Found ${users.length} users matching query`);

    // Format user data for client with nested structure
    const formattedUsers = users.map((user: any) => {
      // Handle both old and new schema formats
      // First, check if this is using the older flat model
      const isOldSchema = !user.personal && (user.name || user.email);

      if (isOldSchema) {
        console.log(
          `[${timestamp}] Converting user from old schema to new schema:`,
          user._id
        );

        // Handle possibly populated chapter data (depends on how it was queried)
        let chapterData: any = { name: 'Unknown Chapter' };
        if (user.chapterId) {
          if (
            typeof user.chapterId === 'string' ||
            user.chapterId instanceof mongoose.Types.ObjectId
          ) {
            chapterData = {
              id: user.chapterId.toString(),
              name: 'Unknown Chapter',
            };
          } else if (user.chapterId.name) {
            // It's a populated chapter reference
            chapterData = {
              id: user.chapterId._id.toString(),
              name: user.chapterId.name,
            };
          }
        }

        return {
          id: user._id,
          personal: {
            name: user.name || '',
            email: user.email || '',
            bio: user.bio || '',
            major: user.major || '',
            gradYear: user.gradYear || null,
            isAlumni: user.isAlumni || false,
            phone: '',
          },
          org: {
            chapter: chapterData,
            permissionLevel: user.permissionLevel || 'member',
            track: user.track || '',
            trackRoles: user.trackRole ? [user.trackRole] : [],
            execRoles: user.execRoles || [],
            status: 'active',
          },
          profile: {
            skills: user.skills || [],
            linkedin: user.linkedin || '',
            avatarUrl: user.avatarUrl || '',
            github: '',
            resumeUrl: '',
          },
          system: {
            firstLogin: Boolean(user.firstLogin) || false,
          },
        };
      }

      // Return new schema format with fallbacks for missing fields
      return {
        id: user._id,
        personal: {
          name: user.personal?.name || '',
          email: user.personal?.email || '',
          bio: user.personal?.bio || '',
          major: user.personal?.major || '',
          gradYear: user.personal?.gradYear || null,
          isAlumni: user.personal?.isAlumni || false,
          phone: user.personal?.phone || '',
        },
        org: {
          chapter:
            typeof user.org?.chapter === 'string'
              ? { name: user.org.chapter } // Handle case where chapter is a string
              : user.org?.chapter || { name: 'Unknown Chapter' }, // Normal object case
          permissionLevel: user.org?.permissionLevel || 'member',
          track: user.org?.track || '',
          trackRoles: user.org?.trackRoles || [],
          execRoles: user.org?.execRoles || [],
          status: user.org?.status || 'active',
        },
        profile: {
          skills: user.profile?.skills || [],
          linkedin: user.profile?.linkedin || '',
          avatarUrl: user.profile?.avatarUrl || '',
          github: user.profile?.github || '',
          resumeUrl: user.profile?.resumeUrl || '',
        },
        system: {
          firstLogin: user.system?.firstLogin || false,
        },
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch users',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!session?.userId || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin using Clerk metadata
    if (user.publicMetadata.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const userData = await request.json();

    // Validate required fields
    if (!userData.personal?.email || !userData.personal?.name) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create new user with system fields
    const newUser = new User({
      id: userData.id || `manual_${Date.now()}`, // Generate temporary ID if not provided
      personal: {
        name: userData.personal.name,
        email: userData.personal.email,
        major: userData.personal.major,
        gradYear: userData.personal.gradYear,
        isAlumni: userData.personal.isAlumni || false,
        phone: userData.personal.phone,
      },
      org: {
        permissionLevel: userData.org.permissionLevel || 'member',
        track: userData.org.track,
        trackRoles: userData.org.trackRoles || [],
        execRoles: userData.org.execRoles || [],
        status: userData.org.status || 'pending',
        chapterId: userData.org.chapterId,
        joinDate: userData.org.joinDate || new Date().toISOString(),
      },
      profile: userData.profile || {},
      system: {
        clerkId: `manual_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}`, // Generate a unique ID for manual users
        firstLogin: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.id, // Store the admin who created this user
      },
    });

    await connectToDatabase();
    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create user',
      },
      { status: 500 }
    );
  }
}
