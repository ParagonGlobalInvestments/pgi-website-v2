-- RSS Items Migration to Supabase
-- This creates the RSS items table matching the MongoDB schema

-- =====================================================
-- RSS ITEMS TABLE
-- =====================================================
CREATE TABLE rss_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core RSS fields (required)
    source TEXT NOT NULL,
    guid TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ NOT NULL,
    
    -- Optional RSS fields
    content_snippet TEXT,
    categories TEXT[] DEFAULT '{}',
    creator TEXT,
    iso_date TIMESTAMPTZ,
    content TEXT,
    
    -- System fields
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_rss_items_source ON rss_items(source);
CREATE INDEX idx_rss_items_pub_date ON rss_items(pub_date DESC);
CREATE INDEX idx_rss_items_fetched_at ON rss_items(fetched_at DESC);

-- Create compound unique index on source and guid (like MongoDB)
CREATE UNIQUE INDEX idx_rss_items_source_guid ON rss_items(source, guid);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE rss_items ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read RSS items
CREATE POLICY "Authenticated users can read RSS items" ON rss_items
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Only admins can insert/update/delete RSS items
CREATE POLICY "Admins can manage RSS items" ON rss_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE system_supabase_id = auth.uid() 
            AND org_permission_level = 'admin'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get RSS items with filtering
CREATE OR REPLACE FUNCTION get_rss_items(
    source_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    source TEXT,
    guid TEXT,
    title TEXT,
    link TEXT,
    pub_date TIMESTAMPTZ,
    content_snippet TEXT,
    categories TEXT[],
    creator TEXT,
    iso_date TIMESTAMPTZ,
    content TEXT,
    fetched_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.source,
        r.guid,
        r.title,
        r.link,
        r.pub_date,
        r.content_snippet,
        r.categories,
        r.creator,
        r.iso_date,
        r.content,
        r.fetched_at
    FROM rss_items r
    WHERE (source_filter IS NULL OR r.source = source_filter)
    ORDER BY r.pub_date DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_rss_items(TEXT, INTEGER) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE rss_items IS 'RSS feed items from various financial news sources';
COMMENT ON COLUMN rss_items.source IS 'RSS source identifier (e.g., marketwatch, nasdaq, seekingalpha)';
COMMENT ON COLUMN rss_items.guid IS 'Unique identifier from RSS feed';
COMMENT ON COLUMN rss_items.pub_date IS 'Publication date from RSS feed';
COMMENT ON COLUMN rss_items.fetched_at IS 'When this item was fetched and stored';
