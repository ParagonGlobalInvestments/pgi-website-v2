-- ============================================================================
-- Backfill user_public_group_memberships from users role/program/status
--
-- Scope (automatic):
-- - committee + value  -> investment-committee
-- - pm                -> portfolio-managers
-- - analyst + value   -> value-analysts
-- - committee + quant -> quant-research-committee
-- - analyst + quant   -> quant-analysts
--
-- Explicitly out of scope (manual assignment):
-- - officers, alumni-board, founders, chapter-founders, recruitment-team
-- ============================================================================

BEGIN;

WITH mapped AS (
  SELECT
    u.id AS user_id,
    u.name,
    CASE
      WHEN u.status = 'active' AND u.role = 'committee' AND u.program = 'value'
        THEN 'investment-committee'
      WHEN u.status = 'active' AND u.role = 'pm'
        THEN 'portfolio-managers'
      WHEN u.status = 'active' AND u.role = 'analyst' AND u.program = 'value'
        THEN 'value-analysts'
      WHEN u.status = 'active' AND u.role = 'committee' AND u.program = 'quant'
        THEN 'quant-research-committee'
      WHEN u.status = 'active' AND u.role = 'analyst' AND u.program = 'quant'
        THEN 'quant-analysts'
      -- Program fallback for active users with non-standard roles (e.g. admin):
      -- if they are not committee/pm, treat as analysts for public team pages.
      WHEN u.status = 'active' AND u.program = 'value'
        THEN 'value-analysts'
      WHEN u.status = 'active' AND u.program = 'quant'
        THEN 'quant-analysts'
      ELSE NULL
    END AS group_slug
  FROM users u
),
missing AS (
  SELECT
    m.user_id,
    m.name,
    m.group_slug
  FROM mapped m
  LEFT JOIN user_public_group_memberships upgm
    ON upgm.user_id = m.user_id
   AND upgm.group_slug = m.group_slug
  WHERE m.group_slug IS NOT NULL
    AND upgm.id IS NULL
),
group_offsets AS (
  SELECT
    g.group_slug,
    COALESCE(MAX(upgm.sort_order), -1) AS max_sort
  FROM (
    VALUES
      ('investment-committee'::text),
      ('portfolio-managers'::text),
      ('value-analysts'::text),
      ('quant-research-committee'::text),
      ('quant-analysts'::text)
  ) AS g(group_slug)
  LEFT JOIN user_public_group_memberships upgm
    ON upgm.group_slug = g.group_slug
  GROUP BY g.group_slug
),
to_insert AS (
  SELECT
    m.user_id,
    m.group_slug,
    go.max_sort + ROW_NUMBER() OVER (
      PARTITION BY m.group_slug
      ORDER BY m.name, m.user_id
    ) AS sort_order
  FROM missing m
  JOIN group_offsets go
    ON go.group_slug = m.group_slug
)
INSERT INTO user_public_group_memberships (
  user_id,
  group_slug,
  sort_order,
  source_cms_person_id
)
SELECT
  ti.user_id,
  ti.group_slug,
  ti.sort_order,
  NULL
FROM to_insert ti
ON CONFLICT (user_id, group_slug) DO NOTHING;

COMMIT;
