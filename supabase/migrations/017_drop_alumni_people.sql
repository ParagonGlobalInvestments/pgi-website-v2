-- ============================================================================
-- Drop the alumni tables replaced by `users` (see 016)
--
-- Run only after the app has been deployed reading from `users` and the public
-- pages have been checked. This deletes data: take a backup first.
--
-- Aborts if any alumni membership never reached user_public_group_memberships,
-- unless it was a duplicate listing: a user with the same name already holds
-- that group (016 keeps the existing listing). Anything else is a row written
-- after 016 ran: re-run 016 first.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  unmoved int;
  person_rows int;
BEGIN
  SELECT count(*) INTO unmoved
  FROM alumni_public_group_memberships apgm
  WHERE NOT EXISTS (
    SELECT 1
    FROM user_public_group_memberships upgm
    WHERE upgm.source_cms_person_id = apgm.source_cms_person_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM alumni_people ap
    JOIN users u
      ON lower(btrim(u.name)) = lower(btrim(ap.name))
      OR u.legacy_alumni_person_id = ap.id
    JOIN user_public_group_memberships upgm
      ON upgm.user_id = u.id AND upgm.group_slug = apgm.group_slug
    WHERE ap.id = apgm.alumni_person_id
  );

  IF unmoved > 0 THEN
    RAISE EXCEPTION 'alumni cleanup: % memberships were not moved to users', unmoved;
  END IF;

  SELECT count(*) INTO person_rows FROM experience WHERE person_id IS NOT NULL;

  IF person_rows > 0 THEN
    RAISE EXCEPTION 'alumni cleanup: % experience rows still use person_id', person_rows;
  END IF;
END
$$;

DROP TABLE alumni_public_group_memberships;
DROP TABLE alumni_people;

-- Experience now always belongs to a user
ALTER TABLE experience DROP CONSTRAINT experience_owner_check;
ALTER TABLE experience DROP COLUMN person_id;
ALTER TABLE experience ALTER COLUMN user_id SET NOT NULL;

COMMIT;
