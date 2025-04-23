import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/database/mongodb";
import User from "@/lib/database/models/User";

export const dynamic = "force-dynamic";

// Get all users for the directory
export async function GET(req: NextRequest) {
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

    // Get filters from query params
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");
    const track = searchParams.get("track");
    const chapter = searchParams.get("chapter");

    // Build query
    const query: any = {};
    if (role && role !== "all") query.role = role;
    if (track && track !== "all") query.track = track;

    // Find all users, populate chapters
    let users = await User.find(query)
      .populate("chapterId")
      .sort({ createdAt: -1 })
      .lean();

    // Filter by chapter if needed (do this after population)
    if (chapter && chapter !== "all") {
      users = users.filter(
        (user) => user.chapterId && user.chapterId.name === chapter
      );
    }

    // Format user data for client
    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      track: user.track,
      chapter: user.chapterId ? user.chapterId.name : null,
      chapterId: user.chapterId ? user.chapterId._id : null,
      isManager: user.isManager,
      isAlumni: user.isAlumni,
      gradYear: user.gradYear,
      skills: user.skills || [],
      bio: user.bio || "",
      linkedin: user.linkedin || "",
      avatarUrl: user.avatarUrl || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
