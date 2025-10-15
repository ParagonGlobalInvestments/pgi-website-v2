import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// RSS Item type matching Supabase schema
export interface RSSItem {
  id?: string;
  source: string;
  guid: string;
  title: string;
  link: string;
  pub_date: string; // ISO string
  content_snippet?: string;
  categories?: string[];
  creator?: string;
  iso_date?: string;
  content?: string;
  fetched_at?: string;
  created_at?: string;
  updated_at?: string;
}

// RSS Item input type for creating new items
export interface RSSItemInput {
  source: string;
  guid: string;
  title: string;
  link: string;
  pubDate: Date; // Will be converted to pub_date
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
  isoDate?: Date;
  content?: string;
}

/**
 * RSS operations using Supabase
 */
export class SupabaseRSS {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient();
  }

  /**
   * Get RSS items with optional filtering
   */
  async getRSSItems(filters?: {
    source?: string;
    limit?: number;
  }): Promise<RSSItem[]> {
    try {
      let query = this.supabase
        .from('rss_items')
        .select('*')
        .order('pub_date', { ascending: false })
        .order('created_at', { ascending: false }); // Secondary sort by created_at

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100); // Increased default limit for better news coverage
      }

      const { data, error } = await query;

      if (error) {
        console.error('[RSS DB] Error fetching RSS items:', error);
        throw error;
      }

      console.log(`[RSS DB] Successfully fetched ${data?.length || 0} items for source: ${filters?.source || 'all'}`);
      return data || [];
    } catch (error) {
      console.error('[RSS DB] Error in getRSSItems:', error);
      throw error;
    }
  }

  /**
   * Create or update RSS item (upsert based on source + guid)
   */
  async upsertRSSItem(item: RSSItemInput): Promise<RSSItem> {
    try {
      // Convert the input format to Supabase format
      const supabaseItem = {
        source: item.source,
        guid: item.guid,
        title: item.title,
        link: item.link,
        pub_date: item.pubDate.toISOString(),
        content_snippet: item.contentSnippet || null,
        categories: item.categories || [],
        creator: item.creator || null,
        iso_date: item.isoDate?.toISOString() || null,
        content: item.content || null,
        updated_at: new Date().toISOString(),
      };

      // Use upsert to handle duplicates (based on unique constraint on source + guid)
      const { data, error } = await this.supabase
        .from('rss_items')
        .upsert(supabaseItem, {
          onConflict: 'source,guid',
          ignoreDuplicates: false, // Update if exists
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error upserting RSS item:', error);
      throw error;
    }
  }

  /**
   * Bulk upsert RSS items
   */
  async bulkUpsertRSSItems(items: RSSItemInput[]): Promise<RSSItem[]> {
    try {
      // Convert all items to Supabase format
      const supabaseItems = items.map(item => ({
        source: item.source,
        guid: item.guid,
        title: item.title,
        link: item.link,
        pub_date: item.pubDate.toISOString(),
        content_snippet: item.contentSnippet || null,
        categories: item.categories || [],
        creator: item.creator || null,
        iso_date: item.isoDate?.toISOString() || null,
        content: item.content || null,
        updated_at: new Date().toISOString(),
      }));

      // Use upsert for bulk insert/update
      const { data, error } = await this.supabase
        .from('rss_items')
        .upsert(supabaseItems, {
          onConflict: 'source,guid',
          ignoreDuplicates: false,
        })
        .select();

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error bulk upserting RSS items:', error);
      throw error;
    }
  }

  /**
   * Delete old RSS items (cleanup)
   */
  async deleteOldRSSItems(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await this.supabase
        .from('rss_items')
        .delete()
        .lt('fetched_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error deleting old RSS items:', error);
      throw error;
    }
  }
}

// Export a function that creates a new instance
export function createRSSDatabase() {
  return new SupabaseRSS();
}
