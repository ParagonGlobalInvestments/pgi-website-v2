-- Rename internships → experience and expand schema for full work history
-- Supports both portal users (user_id) and CMS people (person_id)

-- Rename table
ALTER TABLE internships RENAME TO experience;

-- Rename index
ALTER INDEX idx_internships_user_id RENAME TO idx_experience_user_id;

-- Add new columns (all optional — company + role remain the core data)
ALTER TABLE experience ADD COLUMN person_id uuid REFERENCES cms_people(id) ON DELETE CASCADE;
ALTER TABLE experience ADD COLUMN start_month int;        -- 1-12, nullable
ALTER TABLE experience ADD COLUMN end_month int;          -- 1-12, nullable
ALTER TABLE experience ADD COLUMN employment_type text;   -- 'internship', 'full-time', 'part-time', 'contract'
ALTER TABLE experience ADD COLUMN location text;
ALTER TABLE experience ADD COLUMN source text DEFAULT 'manual';  -- 'manual' | 'linkedin'

-- Index for cms_people lookups
CREATE INDEX idx_experience_person_id ON experience(person_id);

-- Make start_year optional (dates are optional for experience entries)
ALTER TABLE experience ALTER COLUMN start_year DROP NOT NULL;

-- Constraint: must have either user_id or person_id
ALTER TABLE experience ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE experience ADD CONSTRAINT experience_owner_check
  CHECK (user_id IS NOT NULL OR person_id IS NOT NULL);

-- Rename RLS policies (drop old, create new with same logic)
DROP POLICY IF EXISTS "internships_select_authenticated" ON experience;
DROP POLICY IF EXISTS "internships_insert_own" ON experience;
DROP POLICY IF EXISTS "internships_update_own" ON experience;
DROP POLICY IF EXISTS "internships_delete_own" ON experience;

CREATE POLICY "experience_select_authenticated" ON experience FOR SELECT TO authenticated USING (true);
CREATE POLICY "experience_insert_own" ON experience FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
CREATE POLICY "experience_update_own" ON experience FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
CREATE POLICY "experience_delete_own" ON experience FOR DELETE TO authenticated
  USING (user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
