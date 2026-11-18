-- ============================================================================
-- Investment pods (portal org chart)
--
-- Leadership is not stored here: the org chart reads the CMS `officers` group
-- (cms_people / user_public_group_memberships) and places people by title.
--
-- - `pods`: one row per pod. `number` matches the national directory sheet
--   (value 1–5, quant 11–15). `focus` is the sector (value) or strategy (quant).
-- - `pod_members`: who sits in each pod and in what seat:
--     committee → ICOMM (value) / QCOMM (quant) member assigned to the pod
--     pm        → pod leader (value pods)
--     analyst   → pod member
--
-- Rosters are loaded with `scripts/import-pods.ts` from the directory sheet,
-- not seeded here (the repo is public; member names stay out of git).
--
-- Access: service role only (RLS on, no policies), like `users` since 018.
-- The portal reads pods with the admin client after checkMembership(); the
-- import script writes with the service role.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Tables
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program text NOT NULL CHECK (program IN ('value', 'quant')),
  number int NOT NULL UNIQUE,
  focus text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pod_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id uuid NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seat text NOT NULL CHECK (seat IN ('committee', 'pm', 'analyst')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pod_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pod_members_pod_id ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user_id ON pod_members(user_id);

-- --------------------------------------------------------------------------
-- updated_at triggers
-- --------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_pods_updated_at ON pods;
CREATE TRIGGER set_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_pod_members_updated_at ON pod_members;
CREATE TRIGGER set_pod_members_updated_at
  BEFORE UPDATE ON pod_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- RLS
-- --------------------------------------------------------------------------
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
