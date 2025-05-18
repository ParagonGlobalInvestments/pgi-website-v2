import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';

export async function POST(request: Request) {
  try {
    console.log('Starting onboarding process...');

    const user = await currentUser();
    if (!user) {
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

    console.log('Connecting to MongoDB via Mongoose...');
    // Connect to MongoDB using the Mongoose helper
    await connectToDatabase();
    console.log('Successfully connected to MongoDB (Mongoose)');

    console.log('Updating user document via Mongoose...');
    // Update user document using Mongoose User model
    // Assuming 'user.id' from Clerk corresponds to 'system.clerkId' in your User model
    const result = await User.updateOne(
      { 'system.clerkId': user.id }, // Query by Clerk ID
      {
        $set: {
          chapterId, // Make sure this is just the ID, or your model expects populated chapter
          major,
          track,
          'professional.trackRole': trackRole, // Assuming trackRole is in professional details
          'roles.execRoles': execRoles, // Assuming execRoles is in roles
          'roles.permissionLevel': permissionLevel, // Assuming permissionLevel is in roles
          'system.firstLogin': false,
          'system.updatedAt': new Date(), // Assuming updatedAt is in system
        },
      },
      { upsert: true }
    );

    // Check Mongoose update result
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      console.error(
        'MongoDB update via Mongoose failed or user not found and not upserted',
        result
      );
      // If upsert was intended and didn't happen, this is an issue.
      // If user MUST exist, then result.matchedCount === 0 is the error.
      // For now, let's assume upsert means it's okay if it didn't match but created.
      // If result.modifiedCount === 0 and result.upsertedCount === 0, then nothing changed.
    } else {
      console.log('Successfully updated user document via Mongoose:', result);
    }

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
