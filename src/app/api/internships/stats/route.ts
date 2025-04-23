import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/database/mongodb";
import Internship from "@/lib/database/models/Internship";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Get total internships
    const total = await Internship.countDocuments({ isClosed: false });

    // Count internships by track
    const quantCount = await Internship.countDocuments({
      track: "quant",
      isClosed: false,
    });

    const valueCount = await Internship.countDocuments({
      track: "value",
      isClosed: false,
    });

    const bothCount = await Internship.countDocuments({
      track: "both",
      isClosed: false,
    });

    // Return stats
    return NextResponse.json({
      total,
      byTrack: {
        quant: quantCount,
        value: valueCount,
        both: bothCount,
      },
    });
  } catch (error) {
    console.error("Error fetching internship stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch internship stats" },
      { status: 500 }
    );
  }
}
