-- ============================================================================
-- Merge `alumni_people` into `users`
--
-- 1) Map every alumni_people row to a user:
--    - existing user with the same normalized LinkedIn URL, else
--    - existing user with the same normalized name (only if that name is unique
--      among users), else
--    - a new user row with status = 'alumni' and no email/login.
--    Rows for the same person (same name or LinkedIn) map to one user.
-- 2) Copy per-person display fields (title, company, headshot, banner, school)
--    onto each membership's cms_people source row, so public pages render the
--    same as before. Alumni values win, matching the current read path
--    (`alumni.x ?? source.x`).
-- 3) Move alumni_public_group_memberships into user_public_group_memberships.
--
-- Experience is intentionally not seeded: alumni_people has no job titles.
-- Old tables are left in place; they are dropped after the app stops reading
-- them (see 017).
-- Re-runnable: inserts key off users.legacy_alumni_person_id and the unique
-- (user_id, group_slug) membership constraint.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- Helpers (session-scoped temp functions)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.norm_linkedin(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(
    regexp_replace(
      regexp_replace(lower(btrim(value)), '^(https?://)?(www\.)?', ''),
      '/+$',
      ''
    ),
    ''
  )
  WHERE value IS NOT NULL
    AND btrim(value) <> ''
    AND value NOT LIKE '\_\_missing\_linkedin\_\_:%'
$$;

CREATE OR REPLACE FUNCTION pg_temp.norm_name(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(regexp_replace(btrim(value), '[[:space:]]+', ' ', 'g'))
$$;

CREATE OR REPLACE FUNCTION pg_temp.school_slug(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(btrim(coalesce(value, '')))
    WHEN 'brown' THEN 'brown'
    WHEN 'brown university' THEN 'brown'
    WHEN 'columbia' THEN 'columbia'
    WHEN 'columbia university' THEN 'columbia'
    WHEN 'barnard' THEN 'columbia'
    WHEN 'barnard college' THEN 'columbia'
    WHEN 'cornell' THEN 'cornell'
    WHEN 'cornell university' THEN 'cornell'
    WHEN 'nyu' THEN 'nyu'
    WHEN 'new york university' THEN 'nyu'
    WHEN 'princeton' THEN 'princeton'
    WHEN 'princeton university' THEN 'princeton'
    WHEN 'uchicago' THEN 'uchicago'
    WHEN 'university of chicago' THEN 'uchicago'
    WHEN 'the university of chicago' THEN 'uchicago'
    WHEN 'upenn' THEN 'upenn'
    WHEN 'penn' THEN 'upenn'
    WHEN 'university of pennsylvania' THEN 'upenn'
    WHEN 'yale' THEN 'yale'
    WHEN 'yale university' THEN 'yale'
    ELSE NULL
  END
$$;

-- --------------------------------------------------------------------------
-- 1) alumni_people → users mapping
-- --------------------------------------------------------------------------
CREATE TEMP TABLE alumni_user_map (
  alumni_person_id uuid PRIMARY KEY,
  user_id uuid,
  match_type text NOT NULL -- 'legacy' | 'linkedin' | 'name' | 'new'
) ON COMMIT DROP;

-- 1a) Already merged by a previous run
INSERT INTO alumni_user_map (alumni_person_id, user_id, match_type)
SELECT u.legacy_alumni_person_id, u.id, 'legacy'
FROM users u
WHERE u.legacy_alumni_person_id IS NOT NULL;

-- 1b) Existing user with the same LinkedIn URL
INSERT INTO alumni_user_map (alumni_person_id, user_id, match_type)
SELECT DISTINCT ON (ap.id) ap.id, u.id, 'linkedin'
FROM alumni_people ap
JOIN users u
  ON pg_temp.norm_linkedin(u.linkedin_url) = pg_temp.norm_linkedin(ap.linkedin)
WHERE pg_temp.norm_linkedin(ap.linkedin) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM alumni_user_map m WHERE m.alumni_person_id = ap.id
  )
ORDER BY ap.id, (u.status = 'active') DESC, u.created_at;

-- 1c) Existing user with the same name, when that name is unique among users
WITH unique_names AS (
  SELECT pg_temp.norm_name(name) AS norm_name, min(id::text)::uuid AS user_id
  FROM users
  WHERE name IS NOT NULL AND btrim(name) <> ''
  GROUP BY 1
  HAVING count(*) = 1
)
INSERT INTO alumni_user_map (alumni_person_id, user_id, match_type)
SELECT ap.id, un.user_id, 'name'
FROM alumni_people ap
JOIN unique_names un ON un.norm_name = pg_temp.norm_name(ap.name)
WHERE NOT EXISTS (
  SELECT 1 FROM alumni_user_map m WHERE m.alumni_person_id = ap.id
);

-- 1d) alumni_people lists some people twice (e.g. a chapter-founders row and a
-- quant-analysts row, or a founders row and an alumni-board row). Rows that
-- share a name or a LinkedIn URL form one cluster and become one user.
CREATE TEMP TABLE alumni_cluster ON COMMIT DROP AS
WITH k AS (
  SELECT
    id,
    pg_temp.norm_name(name) AS nn,
    pg_temp.norm_linkedin(linkedin) AS nl
  FROM alumni_people
),
r1 AS (
  SELECT k.*, min(id::text) OVER (PARTITION BY nn) AS c1 FROM k
),
r2 AS (
  SELECT
    r1.*,
    CASE
      WHEN nl IS NULL THEN c1
      ELSE min(c1) OVER (PARTITION BY nl)
    END AS c2
  FROM r1
)
SELECT id AS alumni_person_id, min(c2) OVER (PARTITION BY nn)::uuid AS cluster_id
FROM r2;

-- Rows whose cluster-mate is already mapped follow it
CREATE OR REPLACE FUNCTION pg_temp.map_cluster_duplicates()
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO alumni_user_map (alumni_person_id, user_id, match_type)
  SELECT DISTINCT ON (ac.alumni_person_id) ac.alumni_person_id, m.user_id, 'duplicate'
  FROM alumni_cluster ac
  JOIN alumni_cluster mate ON mate.cluster_id = ac.cluster_id
  JOIN alumni_user_map m ON m.alumni_person_id = mate.alumni_person_id
  WHERE NOT EXISTS (
    SELECT 1 FROM alumni_user_map x WHERE x.alumni_person_id = ac.alumni_person_id
  )
  ORDER BY ac.alumni_person_id, m.match_type <> 'duplicate' DESC, m.alumni_person_id;
$$;

DO $$ BEGIN PERFORM pg_temp.map_cluster_duplicates(); END $$;

-- 1e) Everyone else becomes a new alumni user (no email, no login yet): one
-- per cluster, from the row with a real LinkedIn and school when there is one
INSERT INTO users (
  name,
  email,
  school,
  linkedin_url,
  status,
  legacy_alumni_person_id
)
SELECT DISTINCT ON (ac.cluster_id)
  btrim(ap.name),
  NULL,
  (
    SELECT pg_temp.school_slug(mate_ap.school)
    FROM alumni_cluster mate
    JOIN alumni_people mate_ap ON mate_ap.id = mate.alumni_person_id
    WHERE mate.cluster_id = ac.cluster_id
      AND pg_temp.school_slug(mate_ap.school) IS NOT NULL
    LIMIT 1
  ),
  CASE
    WHEN pg_temp.norm_linkedin(ap.linkedin) IS NOT NULL THEN btrim(ap.linkedin)
  END,
  'alumni',
  ap.id
FROM alumni_people ap
JOIN alumni_cluster ac ON ac.alumni_person_id = ap.id
WHERE NOT EXISTS (
  SELECT 1 FROM alumni_user_map m WHERE m.alumni_person_id = ap.id
)
ORDER BY
  ac.cluster_id,
  pg_temp.norm_linkedin(ap.linkedin) IS NOT NULL DESC,
  pg_temp.school_slug(ap.school) IS NOT NULL DESC,
  ap.created_at,
  ap.id;

INSERT INTO alumni_user_map (alumni_person_id, user_id, match_type)
SELECT u.legacy_alumni_person_id, u.id, 'new'
FROM users u
WHERE u.legacy_alumni_person_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM alumni_user_map m
    WHERE m.alumni_person_id = u.legacy_alumni_person_id
  );

DO $$ BEGIN PERFORM pg_temp.map_cluster_duplicates(); END $$;

-- 1f) Matched existing users: fill an empty LinkedIn from the alumni record
UPDATE users u
SET linkedin_url = btrim(ap.linkedin)
FROM alumni_user_map m
JOIN alumni_people ap ON ap.id = m.alumni_person_id
WHERE u.id = m.user_id
  AND m.match_type IN ('linkedin', 'name', 'duplicate')
  AND (u.linkedin_url IS NULL OR btrim(u.linkedin_url) = '')
  AND pg_temp.norm_linkedin(ap.linkedin) IS NOT NULL;

-- --------------------------------------------------------------------------
-- 2) Carry display fields onto cms_people source rows
-- --------------------------------------------------------------------------

-- 2a) Existing source rows: alumni values win, as on the current read path.
-- Exception: alumni_people holds one title per person, so for people in
-- several groups each group keeps its own source title.
UPDATE cms_people cp
SET
  title = CASE
    WHEN (
      SELECT count(*)
      FROM alumni_public_group_memberships other
      WHERE other.alumni_person_id = apgm.alumni_person_id
    ) > 1 THEN coalesce(cp.title, ap.title)
    ELSE coalesce(ap.title, cp.title)
  END,
  company = coalesce(ap.company, cp.company),
  school = coalesce(ap.school, cp.school),
  headshot_url = coalesce(ap.headshot_url, cp.headshot_url),
  banner_url = coalesce(ap.banner_url, cp.banner_url)
FROM alumni_public_group_memberships apgm
JOIN alumni_people ap ON ap.id = apgm.alumni_person_id
WHERE cp.id = apgm.source_cms_person_id;

-- 2b) Memberships without a source row get one
CREATE TEMP TABLE missing_sources ON COMMIT DROP AS
SELECT
  gen_random_uuid() AS source_id,
  apgm.id AS membership_id,
  apgm.group_slug,
  apgm.sort_order,
  ap.name,
  ap.title,
  ap.school,
  ap.company,
  CASE WHEN pg_temp.norm_linkedin(ap.linkedin) IS NOT NULL THEN ap.linkedin END
    AS linkedin,
  ap.headshot_url,
  ap.banner_url
FROM alumni_public_group_memberships apgm
JOIN alumni_people ap ON ap.id = apgm.alumni_person_id
WHERE apgm.source_cms_person_id IS NULL;

INSERT INTO cms_people (
  id,
  group_slug,
  name,
  title,
  school,
  company,
  linkedin,
  headshot_url,
  banner_url,
  sort_order
)
SELECT
  source_id,
  group_slug,
  name,
  title,
  school,
  company,
  linkedin,
  headshot_url,
  banner_url,
  sort_order
FROM missing_sources;

UPDATE alumni_public_group_memberships apgm
SET source_cms_person_id = ms.source_id
FROM missing_sources ms
WHERE apgm.id = ms.membership_id;

-- --------------------------------------------------------------------------
-- 3) Move memberships
--
-- If the user already has a membership in the group, the existing row wins.
-- --------------------------------------------------------------------------
INSERT INTO user_public_group_memberships (
  user_id,
  group_slug,
  sort_order,
  source_cms_person_id
)
SELECT
  m.user_id,
  apgm.group_slug,
  apgm.sort_order,
  apgm.source_cms_person_id
FROM alumni_public_group_memberships apgm
JOIN alumni_user_map m ON m.alumni_person_id = apgm.alumni_person_id
WHERE NOT EXISTS (
  SELECT 1
  FROM user_public_group_memberships upgm
  WHERE upgm.source_cms_person_id = apgm.source_cms_person_id
)
ON CONFLICT (user_id, group_slug) DO NOTHING;

-- --------------------------------------------------------------------------
-- 4) Verification (aborts the transaction on failure)
-- --------------------------------------------------------------------------
DO $$
DECLARE
  unmapped int;
  unmoved int;
  name_collisions int;
  match_summary text;
BEGIN
  SELECT count(*) INTO unmapped
  FROM alumni_people ap
  WHERE NOT EXISTS (
    SELECT 1 FROM alumni_user_map m WHERE m.alumni_person_id = ap.id
  );

  IF unmapped > 0 THEN
    RAISE EXCEPTION 'alumni merge: % alumni_people rows were not mapped', unmapped;
  END IF;

  -- Memberships skipped because the user was already in that group
  SELECT count(*) INTO unmoved
  FROM alumni_public_group_memberships apgm
  WHERE NOT EXISTS (
    SELECT 1
    FROM user_public_group_memberships upgm
    WHERE upgm.source_cms_person_id = apgm.source_cms_person_id
  );

  SELECT string_agg(match_type || '=' || n, ', ' ORDER BY match_type)
  INTO match_summary
  FROM (
    SELECT match_type, count(*) AS n FROM alumni_user_map GROUP BY 1
  ) s;

  RAISE NOTICE 'alumni merge: mapped %', coalesce(match_summary, 'none');
  -- New alumni users sharing a name with another user: review for duplicates
  SELECT count(*) INTO name_collisions
  FROM users u
  WHERE u.legacy_alumni_person_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users other
      WHERE other.id <> u.id
        AND pg_temp.norm_name(other.name) = pg_temp.norm_name(u.name)
    );

  RAISE NOTICE 'alumni merge: % memberships skipped (user already in group)', unmoved;
  RAISE NOTICE 'alumni merge: % new alumni share a name with another user (review)', name_collisions;
END
$$;

COMMIT;

-- --------------------------------------------------------------------------
-- Manual checks
-- --------------------------------------------------------------------------
-- SELECT count(*) FROM users WHERE legacy_alumni_person_id IS NOT NULL;
-- SELECT group_slug, count(*) FROM user_public_group_memberships GROUP BY 1 ORDER BY 1;
-- -- New alumni sharing a name with another user:
-- SELECT u.name, u.status, u.email, u.school, u.legacy_alumni_person_id
-- FROM users u
-- WHERE lower(btrim(u.name)) IN (
--   SELECT lower(btrim(name)) FROM users
--   WHERE legacy_alumni_person_id IS NOT NULL
-- )
-- ORDER BY lower(btrim(u.name));
-- -- Skipped memberships (user already in group):
-- SELECT apgm.*, ap.name
-- FROM alumni_public_group_memberships apgm
-- JOIN alumni_people ap ON ap.id = apgm.alumni_person_id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM user_public_group_memberships upgm
--   WHERE upgm.source_cms_person_id = apgm.source_cms_person_id
-- );
