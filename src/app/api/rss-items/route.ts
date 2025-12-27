import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createRSSDatabase } from '@/lib/supabase/rss';

// Ensure dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Add response caching headers
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
};

// GET handler for the RSS items
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const supabase = requireSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const source = searchParams.get('source');
    const limit = searchParams.get('limit');

    // Get RSS items from Supabase with optimized limit
    const rssDb = createRSSDatabase();
    const items = await rssDb.getRSSItems({
      source: source || undefined,
      limit: limit ? Math.min(parseInt(limit), 100) : 50, // Cap at 100 items max
    });

    // Transform snake_case to camelCase for frontend compatibility
    const transformedItems = items.map(item => ({
      _id: item.id,
      source: item.source,
      guid: item.guid,
      title: item.title,
      link: item.link,
      pubDate: item.pub_date, // Transform snake_case to camelCase
      contentSnippet: item.content_snippet,
      categories: item.categories || [],
      creator: item.creator,
      content: item.content,
      fetchedAt: item.fetched_at || item.created_at,
    }));

    return NextResponse.json(transformedItems, {
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    console.error('[RSS API] Error fetching RSS items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS items' },
      { status: 500 }
    );
  }
}
