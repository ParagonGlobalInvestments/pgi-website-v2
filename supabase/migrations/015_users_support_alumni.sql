-- ============================================================================
-- Prepare `users` to hold alumni who have never logged in
--
-- - Alumni migrated from `alumni_people` (and historical imports) may have no
--   email on file and a school outside the 8 chapter slugs.
-- - Email keeps its UNIQUE constraint; Postgres allows multiple NULLs.
-- - `legacy_alumni_person_id` traces rows created from `alumni_people` so the
--   merge (016) is verifiable and safe to re-run. No FK: the source table is
--   dropped after the app cutover.
-- - `experience.role` becomes optional: historical data has firms without a
--   position, and those people should still appear in company search.
-- ============================================================================

ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN school DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_alumni_person_id uuid UNIQUE;

ALTER TABLE experience ALTER COLUMN role DROP NOT NULL;
