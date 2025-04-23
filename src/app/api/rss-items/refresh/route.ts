import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/database/mongodb";
import {
  fetchMarketWatchRSS,
  fetchNasdaqRSS,
  fetchRSSBySource,
} from "@/lib/rss/rssFetcher";

// Ensure dynamic rendering for this route
export const dynamic = "force-dynamic";

// POST handler to refresh RSS feed
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user - only allow admins to refresh
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role and source from query params
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");
    const source = searchParams.get("source") || "marketwatch";

    // Only allow admins to refresh
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can refresh RSS feeds" },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectDB();

    // Execute the RSS feed fetch function based on source
    try {
      let newItems;

      // Source-specific fetching
      switch (source) {
        case "marketwatch":
          newItems = await fetchMarketWatchRSS();
          break;
        case "nasdaq":
          newItems = await fetchNasdaqRSS();
          break;
        default:
          // Use generic function if available
          newItems = await fetchRSSBySource(source);
      }

      return NextResponse.json({
        message: `${source} RSS feed refreshed successfully`,
        newItemsCount: newItems.length,
        items: newItems,
      });
    } catch (error) {
      console.error(`Error refreshing ${source} RSS feed:`, error);
      return NextResponse.json(
        { error: `Failed to refresh ${source} RSS feed` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in RSS refresh endpoint:", error);
    return NextResponse.json(
      { error: "Failed to refresh RSS feed" },
      { status: 500 }
    );
  }
}
