import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/database/mongodb";
import User from "@/lib/database/models/User";
import Chapter from "@/lib/database/models/Chapter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Get total members
    const totalMembers = await User.countDocuments({});

    // Get active members (non-alumni)
    const activeMembers = await User.countDocuments({ isAlumni: false });

    // Get total chapters
    const totalChapters = await Chapter.countDocuments({});

    // Get user counts by role
    const adminCount = await User.countDocuments({ role: "admin" });
    const leadCount = await User.countDocuments({ role: "lead" });
    const memberCount = await User.countDocuments({ role: "member" });

    // Get user counts by track
    const quantCount = await User.countDocuments({ track: "quant" });
    const valueCount = await User.countDocuments({ track: "value" });
    const bothCount = await User.countDocuments({ track: "both" });

    // Return stats
    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalChapters,
      byRole: {
        admin: adminCount,
        lead: leadCount,
        member: memberCount,
      },
      byTrack: {
        quant: quantCount,
        value: valueCount,
        both: bothCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
