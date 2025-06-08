import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';

export async function POST(_req: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Find users with the same email as the current user
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Find all users with this email
    const usersWithSameEmail = await User.find({ email });

    if (usersWithSameEmail.length === 0) {
      return NextResponse.json(
        { error: 'No users found with this email' },
        { status: 404 }
      );
    }

    if (usersWithSameEmail.length === 1) {
      // If there's only one user, update their clerkId
      const existingUser = usersWithSameEmail[0];

      // Check if the user already has the correct clerkId
      if (existingUser.clerkId === user.id) {
        return NextResponse.json(
          { message: 'User already has the correct clerkId' },
          { status: 200 }
        );
      }

      // Update the clerkId
      existingUser.clerkId = user.id;
      await existingUser.save();

      return NextResponse.json(
        { message: 'Updated user with correct clerkId' },
        { status: 200 }
      );
    }

    // If there are multiple users with the same email
    console.log(`Found ${usersWithSameEmail.length} users with email ${email}`);

    // Find the one with a placeholder clerkId
    const placeholderUsers = usersWithSameEmail.filter(u =>
      u.clerkId.startsWith('placeholder_')
    );

    // Find the one with the real clerkId
    const realUsers = usersWithSameEmail.filter(
      u => !u.clerkId.startsWith('placeholder_')
    );

    if (realUsers.length > 0) {
      // If there's already a real user, delete the placeholder ones
      for (const placeholderUser of placeholderUsers) {
        await User.deleteOne({ _id: placeholderUser._id });
      }

      // Make sure the real user has the current clerkId
      if (realUsers[0].clerkId !== user.id) {
        realUsers[0].clerkId = user.id;
        await realUsers[0].save();
      }

      return NextResponse.json(
        {
          message: `Kept real user and deleted ${placeholderUsers.length} placeholder users`,
        },
        { status: 200 }
      );
    } else {
      // If they're all placeholder users, keep one and update it, delete the rest
      const keepUser = usersWithSameEmail[0];
      keepUser.clerkId = user.id;
      await keepUser.save();

      // Delete the other placeholder users
      for (let i = 1; i < usersWithSameEmail.length; i++) {
        await User.deleteOne({ _id: usersWithSameEmail[i]._id });
      }

      return NextResponse.json(
        {
          message: `Updated one placeholder user and deleted ${
            usersWithSameEmail.length - 1
          } others`,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error resolving duplicate email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve duplicate email' },
      { status: 500 }
    );
  }
}
