-- ============================================================================
-- Lock member and analytics data to the service role
--
-- Google OAuth creates an auth user for anyone who signs in, and
-- /auth/callback signs non-members out only after their session already
-- exists. A session is therefore not membership, so RLS must not grant
-- anything to `authenticated` alone. The app reads and writes these tables
-- only through the service-role client, after `requireMember()` /
-- `requireAdmin()` / `checkMembership()`, so the policies below are unused
-- by the app and only open the data to direct PostgREST calls.
--
-- With RLS enabled and no policies, anon/authenticated see nothing; the
-- service role bypasses RLS.
-- ============================================================================

-- 1. users: any authenticated session could read every member, and members
--    could update their own row, including `role` (self-promotion to admin).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view all members" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 2. experience: readable by any authenticated session.
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experience_select_authenticated" ON experience;
DROP POLICY IF EXISTS "experience_insert_own" ON experience;
DROP POLICY IF EXISTS "experience_update_own" ON experience;
DROP POLICY IF EXISTS "experience_delete_own" ON experience;

-- 3. obs_*: the "Service role" policies had no TO clause, so they applied to
--    anon too (read/write/delete analytics with the publishable key).
DROP POLICY IF EXISTS "Service role full access obs_vitals" ON obs_vitals;
DROP POLICY IF EXISTS "Service role full access obs_pageviews" ON obs_pageviews;
DROP POLICY IF EXISTS "Service role full access obs_vitals_hourly" ON obs_vitals_hourly;
DROP POLICY IF EXISTS "Service role full access obs_pageviews_daily" ON obs_pageviews_daily;
DROP POLICY IF EXISTS "Service role full access obs_errors" ON obs_errors;

-- SECURITY DEFINER analytics functions were callable by anon via /rpc.
REVOKE EXECUTE ON FUNCTION get_vitals_summary(timestamptz, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_vitals_trends(timestamptz, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_page_analytics(timestamptz, timestamptz, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cleanup_observability_data() FROM PUBLIC, anon, authenticated;
