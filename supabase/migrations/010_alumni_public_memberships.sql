-- ============================================================================
-- Alumni + Public Group Membership Split (Additive)
--
-- Goals:
-- 1) Keep `users` as source of truth for active member identity.
-- 2) Preserve public group membership data without coupling it to active `users`.
-- 3) Move CMS-only people into `alumni_people` and group membership join tables.
--
-- Notes:
-- - Additive only: does not remove or modify existing behavior.
-- - Existing public pages can keep reading `cms_people` until app cutover is ready.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1) Alumni identity table (for people present in public CMS but not in users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school text,
  title text,
  company text,
  -- Missing linkedin values are represented with an internal synthetic token:
  -- "__missing_linkedin__:<uuid>". This avoids collapsing distinct same-name rows.
  linkedin text NOT NULL DEFAULT '',
  headshot_url text,
  banner_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alumni_people_name_linkedin_unique UNIQUE (name, linkedin)
);

-- --------------------------------------------------------------------------
-- 2) Public group membership tables
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_public_group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_slug text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  -- Traceability back to the source CMS row for reconciliation/debugging
  source_cms_person_id uuid UNIQUE REFERENCES cms_people(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_public_group_unique UNIQUE (user_id, group_slug)
);

CREATE TABLE IF NOT EXISTS alumni_public_group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_person_id uuid NOT NULL REFERENCES alumni_people(id) ON DELETE CASCADE,
  group_slug text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  source_cms_person_id uuid UNIQUE REFERENCES cms_people(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alumni_public_group_unique UNIQUE (alumni_person_id, group_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_public_group_memberships_group
  ON user_public_group_memberships(group_slug, sort_order);

CREATE INDEX IF NOT EXISTS idx_alumni_public_group_memberships_group
  ON alumni_public_group_memberships(group_slug, sort_order);

-- --------------------------------------------------------------------------
-- 3) Secure defaults: keep new tables private until explicit policies are added
-- --------------------------------------------------------------------------
ALTER TABLE alumni_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_public_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_public_group_memberships ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 4) Optional updated_at triggers (if helper function exists)
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_alumni_people_updated_at ON alumni_people;
    CREATE TRIGGER set_alumni_people_updated_at
      BEFORE UPDATE ON alumni_people
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();

    DROP TRIGGER IF EXISTS set_user_public_group_memberships_updated_at ON user_public_group_memberships;
    CREATE TRIGGER set_user_public_group_memberships_updated_at
      BEFORE UPDATE ON user_public_group_memberships
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();

    DROP TRIGGER IF EXISTS set_alumni_public_group_memberships_updated_at ON alumni_public_group_memberships;
    CREATE TRIGGER set_alumni_public_group_memberships_updated_at
      BEFORE UPDATE ON alumni_public_group_memberships
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

-- --------------------------------------------------------------------------
-- 5) Backfill from cms_people
--
-- Matching rule:
-- - If cms name matches exactly one user by normalized name, map to user membership.
-- - Otherwise, classify as alumni and map to alumni membership.
--
-- This intentionally avoids ambiguous duplicate-name mappings into users.
-- --------------------------------------------------------------------------

-- 5a) Fill user_public_group_memberships from uniquely matched users
WITH cms_rows AS (
  SELECT
    cp.id AS cms_person_id,
    btrim(cp.name) AS name,
    cp.group_slug,
    cp.sort_order,
    lower(regexp_replace(btrim(cp.name), '[[:space:]]+', ' ', 'g')) AS norm_name
  FROM cms_people cp
  WHERE cp.name IS NOT NULL
    AND btrim(cp.name) <> ''
),
users_ranked AS (
  SELECT
    u.id AS user_id,
    lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g')) AS norm_name,
    count(*) OVER (
      PARTITION BY lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g'))
    ) AS name_count
  FROM users u
  WHERE u.name IS NOT NULL
    AND btrim(u.name) <> ''
),
users_unique AS (
  SELECT user_id, norm_name
  FROM users_ranked
  WHERE name_count = 1
),
matched AS (
  SELECT
    c.cms_person_id,
    u.user_id,
    c.group_slug,
    c.sort_order
  FROM cms_rows c
  JOIN users_unique u
    ON u.norm_name = c.norm_name
)
INSERT INTO user_public_group_memberships (
  user_id,
  group_slug,
  sort_order,
  source_cms_person_id
)
SELECT
  m.user_id,
  m.group_slug,
  coalesce(m.sort_order, 0),
  m.cms_person_id
FROM matched m
ON CONFLICT (user_id, group_slug)
DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 5b) Upsert alumni_people for unmatched CMS rows
WITH cms_rows AS (
  SELECT
    cp.id AS cms_person_id,
    btrim(cp.name) AS name,
    nullif(btrim(cp.school), '') AS school,
    nullif(btrim(cp.title), '') AS title,
    nullif(btrim(cp.company), '') AS company,
    coalesce(
      nullif(btrim(cp.linkedin), ''),
      '__missing_linkedin__:' || cp.id::text
    ) AS linkedin,
    nullif(btrim(cp.headshot_url), '') AS headshot_url,
    nullif(btrim(cp.banner_url), '') AS banner_url,
    cp.group_slug,
    cp.sort_order,
    lower(regexp_replace(btrim(cp.name), '[[:space:]]+', ' ', 'g')) AS norm_name
  FROM cms_people cp
  WHERE cp.name IS NOT NULL
    AND btrim(cp.name) <> ''
),
users_ranked AS (
  SELECT
    u.id AS user_id,
    lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g')) AS norm_name,
    count(*) OVER (
      PARTITION BY lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g'))
    ) AS name_count
  FROM users u
  WHERE u.name IS NOT NULL
    AND btrim(u.name) <> ''
),
users_unique AS (
  SELECT user_id, norm_name
  FROM users_ranked
  WHERE name_count = 1
),
matched_ids AS (
  SELECT c.cms_person_id
  FROM cms_rows c
  JOIN users_unique u
    ON u.norm_name = c.norm_name
),
unmatched AS (
  SELECT c.*
  FROM cms_rows c
  LEFT JOIN matched_ids m
    ON m.cms_person_id = c.cms_person_id
  WHERE m.cms_person_id IS NULL
),
alumni_seed AS (
  SELECT DISTINCT ON (u.name, u.linkedin)
    u.name,
    u.school,
    u.title,
    u.company,
    u.linkedin,
    u.headshot_url,
    u.banner_url
  FROM unmatched u
  ORDER BY
    u.name,
    u.linkedin,
    (u.headshot_url IS NOT NULL) DESC,
    (u.banner_url IS NOT NULL) DESC,
    coalesce(u.sort_order, 0) ASC
)
INSERT INTO alumni_people (
  name,
  school,
  title,
  company,
  linkedin,
  headshot_url,
  banner_url
)
SELECT
  s.name,
  s.school,
  s.title,
  s.company,
  s.linkedin,
  s.headshot_url,
  s.banner_url
FROM alumni_seed s
ON CONFLICT (name, linkedin)
DO UPDATE SET
  school = coalesce(alumni_people.school, EXCLUDED.school),
  title = coalesce(alumni_people.title, EXCLUDED.title),
  company = coalesce(alumni_people.company, EXCLUDED.company),
  headshot_url = coalesce(alumni_people.headshot_url, EXCLUDED.headshot_url),
  banner_url = coalesce(alumni_people.banner_url, EXCLUDED.banner_url),
  updated_at = now();

-- 5c) Fill alumni_public_group_memberships from unmatched CMS rows
WITH cms_rows AS (
  SELECT
    cp.id AS cms_person_id,
    btrim(cp.name) AS name,
    coalesce(
      nullif(btrim(cp.linkedin), ''),
      '__missing_linkedin__:' || cp.id::text
    ) AS linkedin,
    cp.group_slug,
    cp.sort_order,
    lower(regexp_replace(btrim(cp.name), '[[:space:]]+', ' ', 'g')) AS norm_name
  FROM cms_people cp
  WHERE cp.name IS NOT NULL
    AND btrim(cp.name) <> ''
),
users_ranked AS (
  SELECT
    u.id AS user_id,
    lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g')) AS norm_name,
    count(*) OVER (
      PARTITION BY lower(regexp_replace(btrim(u.name), '[[:space:]]+', ' ', 'g'))
    ) AS name_count
  FROM users u
  WHERE u.name IS NOT NULL
    AND btrim(u.name) <> ''
),
users_unique AS (
  SELECT user_id, norm_name
  FROM users_ranked
  WHERE name_count = 1
),
matched_ids AS (
  SELECT c.cms_person_id
  FROM cms_rows c
  JOIN users_unique u
    ON u.norm_name = c.norm_name
),
unmatched AS (
  SELECT c.*
  FROM cms_rows c
  LEFT JOIN matched_ids m
    ON m.cms_person_id = c.cms_person_id
  WHERE m.cms_person_id IS NULL
)
INSERT INTO alumni_public_group_memberships (
  alumni_person_id,
  group_slug,
  sort_order,
  source_cms_person_id
)
SELECT
  ap.id AS alumni_person_id,
  u.group_slug,
  coalesce(u.sort_order, 0),
  u.cms_person_id
FROM unmatched u
JOIN alumni_people ap
  ON ap.name = u.name
 AND ap.linkedin = u.linkedin
ON CONFLICT (alumni_person_id, group_slug)
DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- --------------------------------------------------------------------------
-- 6) Optional verification queries (run manually)
-- --------------------------------------------------------------------------
-- SELECT count(*) FROM user_public_group_memberships;
-- SELECT count(*) FROM alumni_people;
-- SELECT count(*) FROM alumni_public_group_memberships;
-- SELECT group_slug, count(*) FROM user_public_group_memberships GROUP BY 1 ORDER BY 1;
-- SELECT group_slug, count(*) FROM alumni_public_group_memberships GROUP BY 1 ORDER BY 1;
