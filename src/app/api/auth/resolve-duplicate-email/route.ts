import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export async function POST(_req: NextRequest) {
  try {
    // Get the authenticated user from Supabase
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Use Supabase database to find user by email
    const db = createDatabase();
    const existingUser = await db.getUserByEmail(email);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }

    // For now, just return success since the user exists
    // The sync process handles Supabase ID management automatically

    // For now, just return success - the sync process will handle updating the Supabase ID
    // This endpoint is mainly for legacy Clerk cleanup which is no longer needed
    return NextResponse.json(
      { message: 'Email resolved - user sync will handle Supabase ID updates' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error resolving duplicate email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve duplicate email' },
      { status: 500 }
    );
  }
}
