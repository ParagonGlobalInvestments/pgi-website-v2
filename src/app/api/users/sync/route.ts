import { NextRequest, NextResponse } from "next/server";
import { syncUserWithMongoDB } from "@/lib/auth/syncUser";
import { auth } from "@clerk/nextjs/server";
import User from "@/lib/database/models/User";
import connectDB from "@/lib/database/mongodb";

export const dynamic = "force-dynamic";

// Add a simple cache to avoid redundant syncs in a short time period
const lastSyncTimes = new Map<string, number>();
const SYNC_COOLDOWN_MS = 10000; // 10 seconds

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Check if we recently synced this user
    const lastSyncTime = lastSyncTimes.get(session.userId);
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      // Get existing user without syncing
      await connectDB();
      const existingUser = await User.findOne({ clerkId: session.userId });

      if (existingUser) {
        console.log("Using cached user data - sync skipped (cooldown active)");
        return NextResponse.json({
          success: true,
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            track: existingUser.track,
            chapter: existingUser.chapterId,
            isManager: existingUser.isManager,
            isAlumni: existingUser.isAlumni,
            bio: existingUser.bio,
            skills: existingUser.skills,
            gradYear: existingUser.gradYear,
          },
          cached: true,
        });
      }
    }

    // Update sync time
    lastSyncTimes.set(session.userId, now);

    // Parse request body
    const body = await req.json();
    const { gradYear, skills, bio, linkedin, resumeUrl, avatarUrl } = body;

    // Sync user with MongoDB
    const user = await syncUserWithMongoDB({
      gradYear,
      skills,
      bio,
      linkedin,
      resumeUrl,
      avatarUrl,
    });

    // Return user data without sensitive info
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        track: user.track,
        chapter: user.chapterId,
        isManager: user.isManager,
        isAlumni: user.isAlumni,
        bio: user.bio,
        skills: user.skills,
        gradYear: user.gradYear,
      },
    });
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}

// Also support GET requests to simply sync the current user without additional data
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

    // Check if we recently synced this user
    const lastSyncTime = lastSyncTimes.get(session.userId);
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      // Get existing user without syncing
      await connectDB();
      const existingUser = await User.findOne({ clerkId: session.userId });

      if (existingUser) {
        console.log("Using cached user data - sync skipped (cooldown active)");
        return NextResponse.json({
          success: true,
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            track: existingUser.track,
            chapter: existingUser.chapterId,
            isManager: existingUser.isManager,
            isAlumni: existingUser.isAlumni,
            bio: existingUser.bio,
            skills: existingUser.skills,
            gradYear: existingUser.gradYear,
          },
          cached: true,
        });
      }
    }

    // Update sync time
    lastSyncTimes.set(session.userId, now);

    // Sync user with default values
    const user = await syncUserWithMongoDB();

    // Return user data without sensitive info
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        track: user.track,
        chapter: user.chapterId,
        isManager: user.isManager,
        isAlumni: user.isAlumni,
        bio: user.bio,
        skills: user.skills,
        gradYear: user.gradYear,
      },
    });
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}
