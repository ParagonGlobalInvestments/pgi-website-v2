import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createDatabase } from '@/lib/supabase/database';

export async function POST(request: Request) {
  try {
    console.log('Starting onboarding process...');

    // Get authenticated user from Supabase
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Authenticated user:', user.id);

    const body = await request.json();
    const { chapterId, major, track, trackRole, execRoles, permissionLevel } =
      body;
    console.log('Received onboarding data:', {
      chapterId,
      major,
      track,
      trackRole,
      execRoles,
      permissionLevel,
    });

    // Validate required fields
    if (!chapterId || !major || !track || !trackRole) {
      console.log('Missing required fields:', {
        chapterId,
        major,
        track,
        trackRole,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Connecting to Supabase database...');
    const db = createDatabase();
    console.log('Successfully connected to Supabase database');

    console.log('Updating user document via Supabase...');

    // Find user by Supabase ID
    const existingUser = await db.getUserBySupabaseId(user.id);

    if (!existingUser) {
      console.error('User not found in database for Supabase ID:', user.id);
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Update user with onboarding data
    const updatedUser = await db.updateUser(existingUser.id, {
      personal: {
        ...existingUser.personal,
        major,
      },
      org: {
        ...existingUser.org,
        chapterId,
        track,
        trackRoles: [trackRole],
        execRoles: execRoles || [],
        permissionLevel: permissionLevel || 'member',
      },
      system: {
        ...existingUser.system,
        firstLogin: false,
        updatedAt: new Date().toISOString(),
      },
    });

    if (!updatedUser) {
      console.error('Failed to update user document');
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('Successfully updated user document via Supabase');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error details:', {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
