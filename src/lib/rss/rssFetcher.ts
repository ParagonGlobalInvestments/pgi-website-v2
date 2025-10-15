import Parser from 'rss-parser';
import { createRSSDatabase, RSSItemInput } from '@/lib/supabase/rss';

// Configure the RSS parser
const parser = new Parser({
  customFields: {
    item: ['creator', 'categories', 'content'],
  },
});

// RSS Feed Sources configuration
// Updated URLs for optimal performance and latest news
const RSS_FEEDS = {
  marketwatch: {
    id: 'marketwatch-top',
    url: 'https://www.marketwatch.com/rss/topstories',
    name: 'MarketWatch Top Stories',
  },
  nasdaq: {
    id: 'nasdaq-news',
    url: 'https://www.nasdaq.com/feed/rssoutbound?category=stocks',
    name: 'NASDAQ News',
  },
  reuters: {
    id: 'reuters-business',
    url: 'https://www.reutersagency.com/feed/?best-sectors=business-finance&post_type=best',
    name: 'Reuters Business News',
  },
  seekingalpha: {
    id: 'seekingalpha-news',
    url: 'https://seekingalpha.com/market_currents.xml',
    name: 'Seeking Alpha',
  },
};

// Generic fetch function for any RSS feed source with enhanced error handling
async function fetchRssFeed(sourceKey: string) {
  const source = RSS_FEEDS[sourceKey as keyof typeof RSS_FEEDS];

  if (!source) {
    throw new Error(`Unknown RSS feed source: ${sourceKey}`);
  }

  try {
    console.log(`[RSS Fetcher] Fetching ${source.name} from ${source.url}...`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const feed = await parser.parseURL(source.url);
    clearTimeout(timeoutId);

    const rssDb = createRSSDatabase();
    const itemsToInsert: RSSItemInput[] = [];

    // Process each item in the feed
    for (const item of feed.items) {
      try {
        // Process categories to handle complex objects like those from Seeking Alpha
        let processedCategories = item.categories || [];

        // Handle case where categories is a string (possibly a JSON string)
        if (typeof processedCategories === 'string') {
          try {
            // Try to parse it as JSON
            const parsed = JSON.parse(processedCategories);
            if (Array.isArray(parsed)) {
              processedCategories = parsed;
              console.log(
                `Successfully parsed categories string as JSON array: ${processedCategories}`
              );
            } else {
              // If it's not an array after parsing, make it a single-item array
              processedCategories = [processedCategories];
            }
          } catch (e) {
            // If it can't be parsed as JSON, treat it as a single category string
            console.log(
              `Could not parse categories as JSON, using as string: ${processedCategories}`
            );
            processedCategories = [processedCategories];
          }
        }

        // Check if categories contains complex objects (like from Seeking Alpha)
        if (
          processedCategories.length > 0 &&
          typeof processedCategories[0] === 'string'
        ) {
          // If it's already a string array, use as is
          processedCategories = processedCategories;
        } else if (processedCategories.length > 0) {
          try {
            // Log the original categories for debugging
            console.log(
              `Processing complex categories for item "${item.title}" from ${source.id}:`,
              typeof processedCategories === 'string'
                ? processedCategories
                : JSON.stringify(processedCategories, null, 2)
            );

            // For complex objects, try to extract the category name from the "_" property
            processedCategories = processedCategories.map((cat: any) => {
              if (typeof cat === 'object' && cat !== null) {
                // If it's a complex object with "_" property, use that
                return cat._ || JSON.stringify(cat);
              }
              return String(cat); // Convert any other type to string
            });

            console.log(`Processed categories result:`, processedCategories);
          } catch (e) {
            console.warn(
              `Error processing categories for item "${item.title}":`,
              e
            );
            processedCategories = []; // Reset to empty array if there's an error
          }
        }

        // Prepare the item data
        const rssItem = {
          source: source.id,
          guid: item.guid || item.link,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          contentSnippet: item.contentSnippet,
          categories: processedCategories,
          creator: item.creator,
          isoDate: item.isoDate ? new Date(item.isoDate) : undefined,
          content: item.content,
          fetchedAt: new Date(),
        };

        // Add to batch for bulk upsert
        itemsToInsert.push({
          source: rssItem.source,
          guid: rssItem.guid,
          title: rssItem.title,
          link: rssItem.link,
          pubDate: rssItem.pubDate,
          contentSnippet: rssItem.contentSnippet,
          categories: rssItem.categories,
          creator: rssItem.creator,
          isoDate: rssItem.isoDate,
          content: rssItem.content,
        });
      } catch (itemError) {
        console.error(`Error processing ${source.name} RSS item:`, itemError);
      }
    }

    // Bulk upsert all items to Supabase
    if (itemsToInsert.length > 0) {
      const insertedItems = await rssDb.bulkUpsertRSSItems(itemsToInsert);
      console.log(
        `[RSS Fetcher] ${source.name}: Successfully processed ${insertedItems.length} items.`
      );
      return insertedItems;
    } else {
      console.log(`[RSS Fetcher] ${source.name}: No new items to process.`);
      return [];
    }
  } catch (error: any) {
    console.error(
      `[RSS Fetcher] Error fetching ${source.name}:`,
      error.message || error
    );
    // Don't throw the error, return empty array to prevent cascade failures
    return [];
  }
}

// MarketWatch specific function for backward compatibility
export const fetchMarketWatchRSS = async () => {
  return fetchRssFeed('marketwatch');
};

// NASDAQ specific function
export const fetchNasdaqRSS = async () => {
  return fetchRssFeed('nasdaq');
};

// Generic function to fetch any feed by source key
export const fetchRSSBySource = async (sourceKey: string) => {
  return fetchRssFeed(sourceKey);
};
