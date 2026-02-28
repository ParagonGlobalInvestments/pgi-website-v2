-- ============================================================================
-- Public read policies for alumni/public membership tables
-- ============================================================================

DROP POLICY IF EXISTS "Public read alumni_people" ON alumni_people;
CREATE POLICY "Public read alumni_people"
  ON alumni_people FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read user_public_group_memberships" ON user_public_group_memberships;
CREATE POLICY "Public read user_public_group_memberships"
  ON user_public_group_memberships FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read alumni_public_group_memberships" ON alumni_public_group_memberships;
CREATE POLICY "Public read alumni_public_group_memberships"
  ON alumni_public_group_memberships FOR SELECT
  TO anon, authenticated
  USING (true);
