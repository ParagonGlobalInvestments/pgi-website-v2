-- PGI Supabase Migration Script
-- This script migrates the MongoDB schema to Supabase PostgreSQL with proper RLS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE permission_level AS ENUM ('admin', 'lead', 'member');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE track_type AS ENUM ('quant', 'value');
CREATE TYPE project_type AS ENUM ('value', 'quant', 'other');
CREATE TYPE internship_track AS ENUM ('quant', 'value', 'both');

-- Create track_role type for the enum values
CREATE TYPE track_role AS ENUM (
    'QuantitativeResearchCommittee',
    'QuantitativeAnalyst', 
    'InvestmentCommittee',
    'ValueAnalyst',
    'PortfolioManager'
);

-- =====================================================
-- CHAPTERS TABLE
-- =====================================================
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT DEFAULT '',
    leaders UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for chapters
CREATE INDEX idx_chapters_slug ON chapters(slug);
CREATE INDEX idx_chapters_name ON chapters(name);

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information
    personal_name TEXT NOT NULL,
    personal_email TEXT NOT NULL UNIQUE,
    personal_bio TEXT DEFAULT '',
    personal_major TEXT DEFAULT '',
    personal_grad_year INTEGER NOT NULL,
    personal_is_alumni BOOLEAN DEFAULT FALSE,
    personal_phone TEXT DEFAULT '',
    
    -- Organization Information
    org_chapter_id UUID REFERENCES chapters(id),
    org_permission_level permission_level DEFAULT 'member',
    org_track track_type,
    org_track_roles track_role[] DEFAULT '{}',
    org_exec_roles TEXT[] DEFAULT '{}',
    org_join_date TIMESTAMPTZ DEFAULT NOW(),
    org_status user_status DEFAULT 'active',
    
    -- Profile Information
    profile_skills TEXT[] DEFAULT '{}',
    profile_projects JSONB DEFAULT '[]',
    profile_experiences JSONB DEFAULT '[]',
    profile_linkedin TEXT DEFAULT '',
    profile_resume_url TEXT DEFAULT '',
    profile_avatar_url TEXT DEFAULT '',
    profile_github TEXT DEFAULT '',
    profile_interests TEXT[] DEFAULT '{}',
    profile_achievements TEXT[] DEFAULT '{}',
    
    -- Activity Information
    activity_last_login TIMESTAMPTZ,
    activity_internships_posted INTEGER DEFAULT 0,
    
    -- System Information
    system_clerk_id TEXT UNIQUE, -- Keep for migration compatibility
    system_supabase_id UUID UNIQUE, -- Reference to auth.users
    system_first_login BOOLEAN DEFAULT TRUE,
    system_notifications_email BOOLEAN DEFAULT TRUE,
    system_notifications_platform BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (personal_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_grad_year CHECK (personal_grad_year > 1900 AND personal_grad_year < 2100)
);

-- Add indexes for users
CREATE INDEX idx_users_email ON users(personal_email);
CREATE INDEX idx_users_supabase_id ON users(system_supabase_id);
CREATE INDEX idx_users_clerk_id ON users(system_clerk_id);
CREATE INDEX idx_users_chapter_permission ON users(org_chapter_id, org_permission_level);
CREATE INDEX idx_users_track_alumni ON users(org_track, personal_is_alumni);
CREATE INDEX idx_users_skills ON users USING GIN(profile_skills);

-- =====================================================
-- INTERNSHIPS TABLE
-- =====================================================
CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    application_link TEXT NOT NULL,
    application_url TEXT,
    deadline TIMESTAMPTZ,
    track internship_track NOT NULL DEFAULT 'both',
    chapter TEXT NOT NULL,
    school_targets TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    is_paid BOOLEAN DEFAULT FALSE,
    is_remote BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    poster_url TEXT,
    company_logo_url TEXT,
    thread_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for internships
CREATE INDEX idx_internships_track ON internships(track);
CREATE INDEX idx_internships_chapter ON internships(chapter);
CREATE INDEX idx_internships_created_by ON internships(created_by);
CREATE INDEX idx_internships_deadline ON internships(deadline);
CREATE INDEX idx_internships_is_closed ON internships(is_closed);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERMISSION LEVEL TRIGGER (equivalent to MongoDB pre-save hook)
-- =====================================================
CREATE OR REPLACE FUNCTION set_permission_level()
RETURNS TRIGGER AS $$
DECLARE
    admin_emails TEXT[] := string_to_array(current_setting('app.admin_emails', true), ',');
BEGIN
    -- Set permission level based on email or roles
    IF NEW.personal_email = ANY(admin_emails) OR array_length(NEW.org_exec_roles, 1) > 0 THEN
        NEW.org_permission_level := 'admin';
    ELSIF array_length(NEW.org_track_roles, 1) > 0 AND (
        NEW.org_track_roles && ARRAY['QuantitativeResearchCommittee', 'InvestmentCommittee', 'PortfolioManager']::track_role[]
    ) THEN
        NEW.org_permission_level := 'lead';
    ELSE
        NEW.org_permission_level := 'member';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_user_permission_level BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_permission_level();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CHAPTERS RLS POLICIES
-- =====================================================

-- Anyone can read chapters (they're public information)
CREATE POLICY "Anyone can read chapters" ON chapters
    FOR SELECT USING (true);

-- Only admins can insert/update/delete chapters
CREATE POLICY "Admins can manage chapters" ON chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE system_supabase_id = auth.uid() 
            AND org_permission_level = 'admin'
        )
    );

-- =====================================================
-- USERS RLS POLICIES
-- =====================================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (system_supabase_id = auth.uid());

-- Users can update their own data (except permission levels and org info)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (system_supabase_id = auth.uid())
    WITH CHECK (
        system_supabase_id = auth.uid() AND
        -- Prevent users from changing their permission level or org status
        org_permission_level = (SELECT org_permission_level FROM users WHERE system_supabase_id = auth.uid()) AND
        org_status = (SELECT org_status FROM users WHERE system_supabase_id = auth.uid())
    );

-- Admins and leads can read all users in their chapter
CREATE POLICY "Leaders can read chapter users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.system_supabase_id = auth.uid() 
            AND u.org_permission_level IN ('admin', 'lead')
            AND (
                u.org_permission_level = 'admin' OR 
                u.org_chapter_id = users.org_chapter_id
            )
        )
    );

-- Admins can manage all users, leads can manage users in their chapter
CREATE POLICY "Leaders can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.system_supabase_id = auth.uid() 
            AND u.org_permission_level IN ('admin', 'lead')
            AND (
                u.org_permission_level = 'admin' OR 
                u.org_chapter_id = users.org_chapter_id
            )
        )
    );

-- Allow user creation during signup
CREATE POLICY "Allow user creation" ON users
    FOR INSERT WITH CHECK (system_supabase_id = auth.uid());

-- =====================================================
-- INTERNSHIPS RLS POLICIES
-- =====================================================

-- All authenticated users can read internships
CREATE POLICY "Authenticated users can read internships" ON internships
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can create internships
CREATE POLICY "Users can create internships" ON internships
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        created_by IN (SELECT id FROM users WHERE system_supabase_id = auth.uid())
    );

-- Users can update their own internships, admins and leads can update any
CREATE POLICY "Users can update own internships" ON internships
    FOR UPDATE USING (
        created_by IN (SELECT id FROM users WHERE system_supabase_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE system_supabase_id = auth.uid() 
            AND org_permission_level IN ('admin', 'lead')
        )
    );

-- Users can delete their own internships, admins and leads can delete any
CREATE POLICY "Users can delete own internships" ON internships
    FOR DELETE USING (
        created_by IN (SELECT id FROM users WHERE system_supabase_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE system_supabase_id = auth.uid() 
            AND org_permission_level IN ('admin', 'lead')
        )
    );

-- =====================================================
-- INSERT INITIAL CHAPTERS DATA
-- =====================================================
INSERT INTO chapters (name, slug, logo_url) VALUES
('Princeton University', 'princeton', ''),
('Brown University', 'brown', ''),
('Columbia University', 'columbia', ''),
('Yale University', 'yale', ''),
('University of Pennsylvania', 'penn', ''),
('New York University', 'nyu', ''),
('University of Chicago', 'chicago', ''),
('Cornell University', 'cornell', '');

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View for user stats
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_members,
    COUNT(DISTINCT org_chapter_id) as total_chapters,
    COUNT(*) FILTER (WHERE personal_is_alumni = false) as current_students,
    COUNT(*) FILTER (WHERE personal_is_alumni = true) as alumni,
    COUNT(*) FILTER (WHERE org_permission_level = 'admin') as admins,
    COUNT(*) FILTER (WHERE org_permission_level = 'lead') as leads
FROM users;

-- View for internship stats  
CREATE OR REPLACE VIEW internship_stats AS
SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_closed = false) as active,
    COUNT(*) FILTER (WHERE is_closed = true) as closed,
    COUNT(*) FILTER (WHERE track = 'quant') as quant_track,
    COUNT(*) FILTER (WHERE track = 'value') as value_track,
    COUNT(*) FILTER (WHERE track = 'both') as both_tracks
FROM internships;

-- Grant permissions for the views
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON internship_stats TO authenticated;

-- =====================================================
-- FUNCTIONS FOR API COMPATIBILITY
-- =====================================================

-- Function to get user by supabase ID (equivalent to MongoDB findOne)
CREATE OR REPLACE FUNCTION get_user_by_supabase_id(user_id UUID)
RETURNS TABLE(
    id UUID,
    personal JSONB,
    org JSONB,
    profile JSONB,
    activity JSONB,
    system JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        jsonb_build_object(
            'name', u.personal_name,
            'email', u.personal_email,
            'bio', u.personal_bio,
            'major', u.personal_major,
            'gradYear', u.personal_grad_year,
            'isAlumni', u.personal_is_alumni,
            'phone', u.personal_phone
        ) as personal,
        jsonb_build_object(
            'chapter', CASE WHEN c.id IS NOT NULL THEN
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'slug', c.slug,
                    'logoUrl', c.logo_url
                )
            ELSE NULL END,
            'permissionLevel', u.org_permission_level,
            'track', u.org_track,
            'trackRoles', u.org_track_roles,
            'execRoles', u.org_exec_roles,
            'joinDate', u.org_join_date,
            'status', u.org_status
        ) as org,
        jsonb_build_object(
            'skills', u.profile_skills,
            'projects', u.profile_projects,
            'experiences', u.profile_experiences,
            'linkedin', u.profile_linkedin,
            'resumeUrl', u.profile_resume_url,
            'avatarUrl', u.profile_avatar_url,
            'github', u.profile_github,
            'interests', u.profile_interests,
            'achievements', u.profile_achievements
        ) as profile,
        jsonb_build_object(
            'lastLogin', u.activity_last_login,
            'internshipsPosted', u.activity_internships_posted
        ) as activity,
        jsonb_build_object(
            'firstLogin', u.system_first_login,
            'notifications', jsonb_build_object(
                'email', u.system_notifications_email,
                'platform', u.system_notifications_platform
            )
        ) as system,
        u.created_at,
        u.updated_at
    FROM users u
    LEFT JOIN chapters c ON u.org_chapter_id = c.id
    WHERE u.system_supabase_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_supabase_id(UUID) TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE chapters IS 'University chapters of PGI';
COMMENT ON TABLE users IS 'PGI members with personal, organizational, and profile information';
COMMENT ON TABLE internships IS 'Internship opportunities posted by members';

COMMENT ON COLUMN users.system_supabase_id IS 'References auth.users.id for Supabase authentication';
COMMENT ON COLUMN users.system_clerk_id IS 'Legacy Clerk ID for migration compatibility';
COMMENT ON COLUMN users.org_track_roles IS 'Array of track-specific roles';
COMMENT ON COLUMN users.org_exec_roles IS 'Array of executive roles';
COMMENT ON COLUMN users.profile_projects IS 'JSON array of project objects';
COMMENT ON COLUMN users.profile_experiences IS 'JSON array of experience objects';

