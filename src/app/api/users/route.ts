import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

// Enable ISR with 60-second revalidation for better performance
export const revalidate = 60;

// Get all users for the directory
export async function GET(req: NextRequest) {
  try {
    // Add timestamp for better logging
    const timestamp = new Date().toISOString();

    // Check authentication
    const supabase = requireSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Connect to Supabase database
    const db = createDatabase();

    // Get filters from query params
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('permissionLevel');
    const track = searchParams.get('track');
    const chapter = searchParams.get('chapter');

    // Build filter object for Supabase
    interface UserFilters {
      permissionLevel?: string;
      track?: string;
      chapterName?: string;
    }
    const filters: UserFilters = {};
    if (role && role !== 'all') filters.permissionLevel = role;
    if (track && track !== 'all') filters.track = track;
    if (chapter && chapter !== 'all') filters.chapterName = chapter;

    // Parallel fetch: Get users and chapters simultaneously
    const [users, chaptersResponse] = await Promise.all([
      db.getUsers(filters),
      fetch(`${req.nextUrl.origin}/api/chapters`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null),
    ]);

    // Parse chapters if available
    let chapters = [];
    if (chaptersResponse && chaptersResponse.ok) {
      chapters = await chaptersResponse.json();
    }

    // Return combined payload with cache headers
    return NextResponse.json(
      {
        success: true,
        users,
        chapters,
        timestamp,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    return NextResponse.json(
      {
        error: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = requireSupabaseServerClient();
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
