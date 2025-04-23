import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/database/mongodb";
import Internship from "@/lib/database/models/Internship";
import User from "@/lib/database/models/User";

// Define interface for session claims
interface SessionClaims {
  role?: string;
  track?: string;
  chapter?: string;
  isManager?: boolean;
  isAlumni?: boolean;
  [key: string]: any; // Allow other properties
}

// Helper function to safely parse session claims
function getSafeSessionClaims(req: NextRequest): SessionClaims {
  try {
    const { sessionClaims } = getAuth(req);
    return (sessionClaims as SessionClaims) || {};
  } catch (error) {
    console.error("Error getting session claims:", error);
    return {};
  }
}

// GET /api/internships - Get all internships with filtering
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const track = searchParams.get("track");
    const chapter = searchParams.get("chapter");
    const isClosed = searchParams.get("isClosed") === "true";

    console.log("Requested filters:", { track, chapter, isClosed });

    // Build filter object - only include isClosed as default filter
    const filter: any = { isClosed };

    // Get user data from MongoDB
    let userRole = "member";
    let userTrack = "value";

    // Find user in MongoDB by their Clerk ID
    const user = await User.findOne({ clerkId: userId });

    if (user) {
      userRole = user.role;
      userTrack = user.track;
      console.log(
        `Found user in MongoDB: ${user.name}, role: ${userRole}, track: ${userTrack}`
      );
    } else {
      console.log(`User not found in MongoDB. Using default role/track.`);
    }

    // OVERRIDE FOR TESTING - REMOVE IN PRODUCTION
    const forceAdmin = searchParams.get("forceAdmin") === "true";
    if (forceAdmin) {
      console.log("Forcing admin role for debugging");
      userRole = "admin";
      userTrack = "both";
    }

    // Handle track filtering based on role and selected filter
    if (userRole === "admin" || userRole === "lead") {
      // For admin/lead users, only apply track filter if specific track selected
      if (track && track !== "all") {
        filter.track = track;
      }
      // No track filter applied if "all" is selected - they see everything
    } else {
      // Regular members can only see internships from their track or "both"
      if (track && track !== "all" && track === userTrack) {
        // If they selected a specific track that matches their own
        filter.track = track;
      } else {
        // Otherwise show their assigned track and "both" track internships
        filter.track = { $in: [userTrack, "both"] };
      }
    }

    // If a specific chapter is requested
    if (chapter && chapter !== "all") {
      filter.chapter = chapter;
    }

    console.log("Filter applied:", JSON.stringify(filter)); // Debug the actual filter being used

    // Get internships matching the filter
    const internships = await Internship.find(filter)
      .sort({ deadline: 1, createdAt: -1 })
      .limit(100);

    console.log(`Found ${internships.length} matching internships`);

    // Log the tracks present in the result for debugging
    const trackCounts: Record<string, number> = {};
    internships.forEach((i) => {
      const track = i.track || "unknown";
      trackCounts[track] = (trackCounts[track] || 0) + 1;
    });
    console.log("Track distribution:", trackCounts);

    return NextResponse.json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    return NextResponse.json(
      { error: "Failed to fetch internships" },
      { status: 500 }
    );
  }
}

// POST /api/internships - Create a new internship
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Check if user has permission to create internships
    const user = await User.findOne({ clerkId: userId });
    const userRole = user?.role || "member";

    if (userRole !== "admin" && userRole !== "lead") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await req.json();

    // Create the internship
    const internship = await Internship.create({
      ...data,
      createdBy: userId,
    });

    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    console.error("Error creating internship:", error);
    return NextResponse.json(
      { error: "Failed to create internship" },
      { status: 500 }
    );
  }
}
