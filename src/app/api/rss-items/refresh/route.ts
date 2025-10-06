import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';
import {
  fetchMarketWatchRSS,
  fetchNasdaqRSS,
  fetchRSSBySource,
} from '@/lib/rss/rssFetcher';

// Ensure dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST handler to refresh RSS feed
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user from Supabase
    const supabase = createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin using Supabase database
    const db = createDatabase();
    const currentUser = await db.getUserBySupabaseId(authUser.id);

    if (!currentUser || currentUser.org.permissionLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can refresh RSS feeds' },
        { status: 403 }
      );
    }

    // Get source from query params
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source') || 'marketwatch';

    // Execute the RSS feed fetch function based on source
    try {
      let newItems;

      // Source-specific fetching
      switch (source) {
        case 'marketwatch':
          newItems = await fetchMarketWatchRSS();
          break;
        case 'nasdaq':
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
    console.error('Error in RSS refresh endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to refresh RSS feed' },
      { status: 500 }
    );
  }
}
