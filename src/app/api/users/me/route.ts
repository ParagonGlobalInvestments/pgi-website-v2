import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/database/mongodb";
import User from "@/lib/database/models/User";
import { syncUserWithMongoDB } from "@/lib/auth/syncUser";

export const dynamic = "force-dynamic";

// Track last sync attempts to prevent excessive syncs
const lastSyncAttempts = new Map<string, number>();
const SYNC_COOLDOWN_MS = 5000; // 5 seconds

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the user in MongoDB by their Clerk ID
    let user = await User.findOne({ clerkId: session.userId }).populate(
      "chapterId"
    );

    // If user not found, sync and try again
    if (!user) {
      // Check if we've tried to sync recently
      const now = Date.now();
      const lastAttempt = lastSyncAttempts.get(session.userId);

      if (lastAttempt && now - lastAttempt < SYNC_COOLDOWN_MS) {
        return NextResponse.json(
          { error: "User not found and sync cooldown active" },
          { status: 404 }
        );
      }

      // Track this sync attempt
      lastSyncAttempts.set(session.userId, now);

      // Attempt to create/sync the user
      await syncUserWithMongoDB();
      user = await User.findOne({ clerkId: session.userId }).populate(
        "chapterId"
      );

      // If still not found, return error
      if (!user) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 404 }
        );
      }
    }

    // Return user data without sensitive info
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        track: user.track,
        chapter: user.chapterId
          ? {
              id: user.chapterId._id,
              name: user.chapterId.name,
              slug: user.chapterId.slug,
              logoUrl: user.chapterId.logoUrl,
            }
          : null,
        isManager: user.isManager,
        isAlumni: user.isAlumni,
        gradYear: user.gradYear,
        bio: user.bio || "",
        skills: user.skills || [],
        linkedin: user.linkedin || "",
        resumeUrl: user.resumeUrl || "",
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// Update user data
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse request body for updatable fields
    const body = await req.json();
    const { bio, skills, gradYear, linkedin, resumeUrl, avatarUrl } = body;

    // Find the user
    const user = await User.findOne({ clerkId: session.userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Update only allowed fields
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (gradYear !== undefined) user.gradYear = gradYear;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    // Save updated user
    await user.save();

    // Return updated user data
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user data" },
      { status: 500 }
    );
  }
}
