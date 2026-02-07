-- Internships table for member directory
CREATE TABLE internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role text NOT NULL,
  start_year int NOT NULL,
  end_year int,          -- NULL = ongoing
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX idx_internships_user_id ON internships(user_id);

-- RLS
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read internships (for directory)
CREATE POLICY "internships_select_authenticated"
  ON internships FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage their own internships
CREATE POLICY "internships_insert_own"
  ON internships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (
    SELECT id FROM users WHERE supabase_id = auth.uid()::text
  ));

CREATE POLICY "internships_update_own"
  ON internships FOR UPDATE
  TO authenticated
  USING (user_id = (
    SELECT id FROM users WHERE supabase_id = auth.uid()::text
  ));

CREATE POLICY "internships_delete_own"
  ON internships FOR DELETE
  TO authenticated
  USING (user_id = (
    SELECT id FROM users WHERE supabase_id = auth.uid()::text
  ));

-- Service role bypasses RLS, so admin API routes work without extra policies
