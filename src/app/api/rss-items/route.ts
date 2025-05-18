import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import mongoose from 'mongoose';

// Ensure dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Define the RSS item schema for MongoDB (matching the one in rssFetcher.ts)
const RssItemSchema = new mongoose.Schema({
  source: { type: String, required: true },
  guid: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  pubDate: { type: Date, required: true },
  contentSnippet: { type: String },
  categories: [String],
  creator: String,
  isoDate: Date,
  content: String,
  fetchedAt: { type: Date, default: Date.now },
});

// Initialize the model (or get it if it already exists)
const RssItem =
  mongoose.models.RssItem || mongoose.model('RssItem', RssItemSchema);

// GET handler for the RSS items
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source');

    // Build filter based on source parameter
    const filter: any = {};
    if (source) {
      filter.source = source;
    }

    // Get the most recent RSS items
    const items = await RssItem.find(filter)
      .sort({ pubDate: -1 })
      .limit(50)
      .lean(); // Use lean() for better performance since we don't need Mongoose methods

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching RSS items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS items' },
      { status: 500 }
    );
  }
}
