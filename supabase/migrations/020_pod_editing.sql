-- ============================================================================
-- Editable org chart
--
-- Admins and pod leaders now edit pod rosters in the portal
-- (/portal/org-chart → /api/org-chart/*), so the database is the source of
-- truth. The sheet import script from 019 has been removed.
--
-- 1. At most one person per lead seat (PM, ICOMM/QCOMM) in each pod.
--    Existing duplicates are demoted to analyst first (oldest row keeps the
--    seat) so this applies cleanly to imported data.
-- 2. `pod_changes`: an append-only log of roster edits, shown to admins.
--    `summary` is written at edit time so entries stay readable after pods or
--    people are deleted.
--
-- Access: service role only (RLS on, no policies), like pods and pod_members.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. One holder per lead seat
-- --------------------------------------------------------------------------
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY pod_id, seat ORDER BY sort_order, created_at, id
         ) AS rn
  FROM pod_members
  WHERE pod_id IS NOT NULL AND seat IN ('committee', 'pm')
)
UPDATE pod_members pm
SET seat = 'analyst'
FROM ranked
WHERE pm.id = ranked.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS pod_members_one_lead_per_seat
  ON pod_members (pod_id, seat)
  WHERE pod_id IS NOT NULL AND seat IN ('committee', 'pm');

-- --------------------------------------------------------------------------
-- 2. Change log
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pod_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Null for ADMIN_EMAILS allowlist admins without a user record.
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  action text NOT NULL CHECK (
    action IN (
      'move',
      'add_member',
      'undo',
      'create_pod',
      'update_pod',
      'delete_pod'
    )
  ),
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pod_changes_created_at
  ON pod_changes (created_at DESC);

ALTER TABLE pod_changes ENABLE ROW LEVEL SECURITY;
