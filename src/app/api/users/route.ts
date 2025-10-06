import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

// Get all users for the directory
export async function GET(req: NextRequest) {
  try {
    // Add timestamp for better logging
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] API Request: /api/users`);

    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log(`[${timestamp}] Unauthorized request to /api/users`);
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    console.log(`[${timestamp}] User ${user.id} requested directory data`);

    // Connect to Supabase database
    const db = createDatabase();
    console.log(`[${timestamp}] Connected to Supabase database`);

    // Get filters from query params
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('permissionLevel');
    const track = searchParams.get('track');
    const chapter = searchParams.get('chapter');

    console.log(`[${timestamp}] Directory filters:`, { role, track, chapter });

    // Build filter object for Supabase
    const filters: any = {};
    if (role && role !== 'all') filters.permissionLevel = role;
    if (track && track !== 'all') filters.track = track;
    if (chapter && chapter !== 'all') filters.chapterName = chapter;

    console.log(
      `[${timestamp}] Using Supabase filters:`,
      JSON.stringify(filters)
    );

    // Get all users from Supabase with filters
    const users = await db.getUsers(filters);
    console.log(`Found ${users.length} users matching query`);

    if (users.length === 0) {
      console.log(`[${timestamp}] WARNING: No users found in the database!`);
    } else {
      // Log a sample of the first user to see its structure
      console.log(
        `[${timestamp}] First user sample:`,
        JSON.stringify(
          {
            id: users[0].id,
            personal: users[0].personal,
            org: users[0].org,
          },
          null,
          2
        )
      );
    }

    // Users are already formatted from the database layer
    return NextResponse.json({
      success: true,
      users,
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
    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin using Supabase database
    const db = createDatabase();
    const dbUser = await db.getUserBySupabaseId(user.id);

    if (!dbUser || dbUser.org.permissionLevel !== 'admin') {
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

    // Create new user using Supabase
    const newUser = await db.createUser({
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
        supabaseId: `manual_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}`, // Generate a unique ID for manual users
        firstLogin: false,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.id, // Store the admin who created this user
      },
    });

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
