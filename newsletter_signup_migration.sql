-- Newsletter Signup Migration
-- Creates table for collecting interested users who aren't PGI members

-- =====================================================
-- NEWSLETTER SIGNUPS TABLE
-- =====================================================
CREATE TABLE newsletter_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Required field
    email TEXT NOT NULL UNIQUE,
    
    -- Automatically extracted data (no user input required)
    email_domain TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN email ~ '@(.+)$' THEN 
                regexp_replace(email, '^[^@]+@(.+)$', '\1')
            ELSE NULL 
        END
    ) STORED,
    
    is_edu_email BOOLEAN GENERATED ALWAYS AS (
        email ILIKE '%.edu'
    ) STORED,
    
    -- Metadata we can derive
    signup_source TEXT DEFAULT 'resources_page', -- where they signed up from
    user_agent TEXT, -- browser info
    ip_address INET, -- for geographic insights (anonymized)
    referrer TEXT, -- how they found us
    
    -- Engagement tracking
    signup_method TEXT DEFAULT 'email_form', -- email_form, google_oauth, etc.
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    verification_sent_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Soft delete for GDPR compliance
    deleted_at TIMESTAMPTZ,
    
    -- Marketing preferences
    marketing_consent BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_newsletter_signups_email ON newsletter_signups(email);
CREATE INDEX idx_newsletter_signups_domain ON newsletter_signups(email_domain);
CREATE INDEX idx_newsletter_signups_created_at ON newsletter_signups(created_at DESC);
CREATE INDEX idx_newsletter_signups_is_edu ON newsletter_signups(is_edu_email);
CREATE INDEX idx_newsletter_signups_source ON newsletter_signups(signup_source);

-- Partial index for active subscribers
CREATE INDEX idx_newsletter_signups_active ON newsletter_signups(email) 
WHERE deleted_at IS NULL AND unsubscribed_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for public signup)
CREATE POLICY "Anyone can sign up for newsletter" ON newsletter_signups
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Policy: Only admins can read/update/delete
CREATE POLICY "Admins can manage newsletter signups" ON newsletter_signups
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

-- Function to get newsletter signup stats
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE (
    total_signups BIGINT,
    edu_signups BIGINT,
    non_edu_signups BIGINT,
    verified_signups BIGINT,
    active_subscribers BIGINT,
    top_domains TEXT[],
    signups_last_30_days BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_signups,
        COUNT(*) FILTER (WHERE is_edu_email = true) as edu_signups,
        COUNT(*) FILTER (WHERE is_edu_email = false) as non_edu_signups,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_signups,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND unsubscribed_at IS NULL) as active_subscribers,
        ARRAY(
            SELECT email_domain 
            FROM newsletter_signups 
            WHERE email_domain IS NOT NULL 
            GROUP BY email_domain 
            ORDER BY COUNT(*) DESC 
            LIMIT 10
        ) as top_domains,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as signups_last_30_days
    FROM newsletter_signups;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_newsletter_stats() TO authenticated;

-- Function to safely add newsletter signup with metadata
CREATE OR REPLACE FUNCTION add_newsletter_signup(
    p_email TEXT,
    p_signup_source TEXT DEFAULT 'resources_page',
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    signup_id UUID
) 
SECURITY DEFINER
AS $$
DECLARE
    v_signup_id UUID;
    v_existing_email TEXT;
BEGIN
    -- Check if email already exists
    SELECT email INTO v_existing_email 
    FROM newsletter_signups 
    WHERE email = p_email AND deleted_at IS NULL;
    
    IF v_existing_email IS NOT NULL THEN
        RETURN QUERY SELECT false, 'Email already subscribed', NULL::UUID;
        RETURN;
    END IF;
    
    -- Insert new signup
    INSERT INTO newsletter_signups (
        email, 
        signup_source, 
        user_agent, 
        ip_address, 
        referrer,
        verification_token
    ) VALUES (
        LOWER(TRIM(p_email)),
        p_signup_source,
        p_user_agent,
        p_ip_address,
        p_referrer,
        encode(gen_random_bytes(32), 'hex')
    ) RETURNING id INTO v_signup_id;
    
    RETURN QUERY SELECT true, 'Successfully subscribed to newsletter', v_signup_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION add_newsletter_signup(TEXT, TEXT, TEXT, INET, TEXT) TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE newsletter_signups IS 'Newsletter signups from interested users who are not PGI members';
COMMENT ON COLUMN newsletter_signups.email_domain IS 'Automatically extracted domain from email for analytics';
COMMENT ON COLUMN newsletter_signups.is_edu_email IS 'Automatically detected if email is from educational institution';
COMMENT ON COLUMN newsletter_signups.signup_source IS 'Page/feature where user signed up (resources_page, apply_page, etc.)';
COMMENT ON COLUMN newsletter_signups.user_agent IS 'Browser/device info for analytics (anonymized)';
COMMENT ON COLUMN newsletter_signups.ip_address IS 'IP address for geographic insights (anonymized, GDPR compliant)';
