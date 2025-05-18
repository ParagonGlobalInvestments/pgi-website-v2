import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';

interface ClerkMetadata {
  role?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const authSession = await getAuth(request);
    if (!authSession.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const currentUser = await User.findOne({
      'system.clerkId': authSession.userId,
    });

    const metadata = authSession.sessionClaims?.metadata as
      | ClerkMetadata
      | undefined;
    const isClerkAdmin = metadata?.role === 'admin';

    if (
      !currentUser ||
      (!isClerkAdmin && currentUser.roles?.permissionLevel !== 'admin')
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    delete updateData._id;
    delete updateData.id;
    delete updateData['system.clerkId'];

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const authSession = await getAuth(request);
    if (!authSession.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const adminUser = await User.findOne({
      'system.clerkId': authSession.userId,
      'roles.permissionLevel': 'admin',
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
