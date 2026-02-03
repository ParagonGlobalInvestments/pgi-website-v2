-- ============================================================================
-- PGI Portal: Security & Performance Fixes
--
-- This migration fixes:
-- 1. update_updated_at() function with explicit search_path for security
-- 2. RLS policies using (select auth.*()) pattern for 10x performance
--
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================================

-- ============================================================================
-- 1. Fix update_updated_at() function with secure search_path
--
-- SECURITY: Without SET search_path, a malicious schema could shadow 'now()'
-- and execute arbitrary code when the trigger fires.
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. Fix RLS policies for performance
--
-- PERFORMANCE: Wrapping auth.*() calls in (select ...) prevents the function
-- from being re-evaluated for every row. This is a 10x performance improvement
-- for large tables.
--
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all members" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate with optimized (select auth.*()) pattern
CREATE POLICY "Authenticated users can view all members"
  ON users FOR SELECT
  USING ((select auth.role()) = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING ((select auth.uid())::text = supabase_id)
  WITH CHECK ((select auth.uid())::text = supabase_id);

-- ============================================================================
-- 3. Storage bucket for CMS assets
--
-- Create the bucket via Dashboard or CLI first, then apply these policies.
-- The bucket should be PUBLIC for read access (logos displayed on public pages).
-- ============================================================================

-- Public read access for CMS assets
CREATE POLICY "Public read cms-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-assets');

-- Admin-only upload (requires user to have admin role in users table)
CREATE POLICY "Admin upload cms-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cms-assets'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE supabase_id = (select auth.uid())::text
      AND role = 'admin'
    )
  );

-- Admin-only update
CREATE POLICY "Admin update cms-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cms-assets'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE supabase_id = (select auth.uid())::text
      AND role = 'admin'
    )
  );

-- Admin-only delete
CREATE POLICY "Admin delete cms-assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cms-assets'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE supabase_id = (select auth.uid())::text
      AND role = 'admin'
    )
  );

-- ============================================================================
-- Verification queries (run after migration to confirm):
--
-- Check update_updated_at function has search_path set:
--   SELECT proname, proconfig FROM pg_proc WHERE proname = 'update_updated_at';
--   Expected: proconfig = {search_path=public}
--
-- Check RLS policies use (select auth.*()) pattern:
--   SELECT policyname, qual::text FROM pg_policies WHERE tablename = 'users';
--   Expected: qual contains "(SELECT auth." instead of just "auth."
-- ============================================================================
