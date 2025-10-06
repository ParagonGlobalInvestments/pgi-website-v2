import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

// GET /api/internships - Get all internships with filtering
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to Supabase database
    const db = createDatabase();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const track = searchParams.get('track');
    const chapter = searchParams.get('chapter');
    const isClosed = searchParams.get('isClosed') === 'true';

    console.log('Requested filters:', { track, chapter, isClosed });

    // Get user data from Supabase
    const dbUser = await db.getUserBySupabaseId(user.id);

    let userRole = 'member';
    let userTrack = 'value';

    if (dbUser) {
      // If user exists in database, use their stored values
      userRole = dbUser.org?.permissionLevel || 'member';
      userTrack = dbUser.org?.track || 'value';
      console.log(
        `Found user in database: ${dbUser.personal.name}, role: ${userRole}, track: ${userTrack}`
      );
    } else {
      // If user not found in database, log that we're using defaults
      console.log(
        `User not found in database. Using defaults - role: ${userRole}, track: ${userTrack}`
      );
    }

    // OVERRIDE FOR TESTING - REMOVE IN PRODUCTION
    const forceAdmin = searchParams.get('forceAdmin') === 'true';
    if (forceAdmin) {
      console.log('Forcing admin role for debugging');
      userRole = 'admin';
      userTrack = 'both';
    }

    // Build filter object based on user permissions
    const filters: any = { is_closed: isClosed };

    // Handle track filtering based on role and selected filter
    if (userRole === 'admin' || userRole === 'lead') {
      // For admin/lead users, only apply track filter if specific track selected
      if (track && track !== 'all') {
        filters.track = track;
      }
      // No track filter applied if "all" is selected - they see everything
    } else {
      // Regular members can only see internships from their track or "both"
      if (track && track !== 'all' && track === userTrack) {
        // If they selected a specific track that matches their own
        filters.track = track;
      } else {
        // Otherwise show their assigned track and "both" track internships
        // For now, just show their track - the database method may need enhancement for "both"
        filters.track = userTrack;
      }
    }

    // If a specific chapter is requested
    if (chapter && chapter !== 'all') {
      filters.chapter = chapter;
    }

    console.log('Filter applied:', JSON.stringify(filters));

    // Get internships matching the filter from Supabase
    const internships = await db.getInternships(filters);

    console.log(`Found ${internships.length} matching internships`);

    // Log the tracks present in the result for debugging
    const trackCounts: Record<string, number> = {};
    internships.forEach(i => {
      const track = i.track || 'unknown';
      trackCounts[track] = (trackCounts[track] || 0) + 1;
    });
    console.log('Track distribution:', trackCounts);

    return NextResponse.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}

// POST /api/internships - Create a new internship
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to Supabase database
    const db = createDatabase();

    // Check if user has permission to create internships
    const dbUser = await db.getUserBySupabaseId(user.id);
    const userRole = dbUser?.org?.permissionLevel || 'member';

    if (!['admin', 'moderator', 'officer'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await req.json();

    // Create the internship using Supabase
    const internship = await db.createInternship({
      ...data,
      createdBy: user.id,
    });

    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}
