-- ==============================
-- PGI Portal: Fresh Start Migration
-- Drops all old tables and creates simplified users table
-- Run this in Supabase SQL Editor or via psql
-- ==============================

-- Drop old views first (they depend on tables)
DROP VIEW IF EXISTS user_stats CASCADE;
DROP VIEW IF EXISTS internship_stats CASCADE;

-- Drop all old tables
DROP TABLE IF EXISTS rss_items CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS pitches CASCADE;
DROP TABLE IF EXISTS members_public CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;

-- ==============================
-- New simplified users table
-- ==============================
CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  alternate_emails text[] DEFAULT '{}',
  role            text NOT NULL DEFAULT 'analyst'
                  CHECK (role IN ('admin', 'committee', 'pm', 'analyst')),
  program         text CHECK (program IN ('value', 'quant') OR program IS NULL),
  school          text NOT NULL,
  graduation_year int,
  linkedin_url    text,
  github_url      text,
  supabase_id     text UNIQUE,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Indexes for auth lookup
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_supabase_id ON users (supabase_id);

-- ==============================
-- Row Level Security
-- ==============================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all members (directory)
CREATE POLICY "Authenticated users can view all members"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own row
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = supabase_id)
  WITH CHECK (auth.uid()::text = supabase_id);

-- Service role bypasses RLS automatically in Supabase

-- ==============================
-- Updated_at trigger
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
