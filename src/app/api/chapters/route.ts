import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/database/mongodb";
import Chapter from "@/lib/database/models/Chapter";

// GET /api/chapters - Get all chapters
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Get all chapters
    const chapters = await Chapter.find({}).sort({ name: 1 });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Create a new chapter (admin only)
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create chapters
    const userRole = (sessionClaims?.role as string) || "member";
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create chapters" },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectDB();

    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Create the chapter
    const chapter = new Chapter(data);
    await chapter.save();

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);

    // Check if it's a MongoDB duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: "A chapter with this name or slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
