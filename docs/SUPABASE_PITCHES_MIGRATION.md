# Supabase Pitches Table Migration

This document contains the SQL migration needed to create the `pitches` table in your Supabase database.

## Migration SQL

Run the following SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new):

```sql
-- Create pitches table
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) NOT NULL,
  team VARCHAR(10) NOT NULL CHECK (team IN ('value', 'quant')),
  pitch_date DATE NOT NULL,
  excel_model_path VARCHAR(255),
  pdf_report_path VARCHAR(255),
  github_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on team for faster filtering
CREATE INDEX idx_pitches_team ON pitches(team);

-- Create index on pitch_date for sorting
CREATE INDEX idx_pitches_pitch_date ON pitches(pitch_date DESC);

-- Enable Row Level Security
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow authenticated users to read pitches
CREATE POLICY "Allow authenticated users to read pitches"
ON pitches
FOR SELECT
TO authenticated
USING (true);

-- Create policy: Allow admins to insert pitches
CREATE POLICY "Allow admins to insert pitches"
ON pitches
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.system_supabase_id = auth.uid()
    AND users.org_permission_level = 'admin'
  )
);

-- Create policy: Allow admins to update pitches
CREATE POLICY "Allow admins to update pitches"
ON pitches
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.system_supabase_id = auth.uid()
    AND users.org_permission_level = 'admin'
  )
);

-- Create policy: Allow admins to delete pitches
CREATE POLICY "Allow admins to delete pitches"
ON pitches
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.system_supabase_id = auth.uid()
    AND users.org_permission_level = 'admin'
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pitches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_pitches_updated_at
BEFORE UPDATE ON pitches
FOR EACH ROW
EXECUTE FUNCTION update_pitches_updated_at();
```

## How to Apply

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
3. Click "New query"
4. Copy and paste the SQL above
5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify the table was created by checking the Table Editor

## Verification

After running the migration, verify it worked:

1. Go to Table Editor in Supabase Dashboard
2. You should see a new `pitches` table with the following columns:

   - `id` (uuid, primary key)
   - `ticker` (varchar)
   - `team` (varchar)
   - `pitch_date` (date)
   - `excel_model_path` (varchar, nullable)
   - `pdf_report_path` (varchar, nullable)
   - `github_url` (varchar, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

3. Check the Policies tab to ensure RLS is enabled with the correct policies

## Next Steps

After running this migration:

1. Add your first pitch using the Admin interface at `/portal/dashboard/pitches/admin`
2. Upload pitch files to `/public/resources/pitches/value/` or `/public/resources/pitches/quant/`
3. Reference the file paths in the pitch entries (e.g., `/resources/pitches/value/AAPL-report.pdf`)

## Rollback (if needed)

If you need to remove the table:

```sql
-- Drop all policies first
DROP POLICY IF EXISTS "Allow authenticated users to read pitches" ON pitches;
DROP POLICY IF EXISTS "Allow admins to insert pitches" ON pitches;
DROP POLICY IF EXISTS "Allow admins to update pitches" ON pitches;
DROP POLICY IF EXISTS "Allow admins to delete pitches" ON pitches;

-- Drop trigger and function
DROP TRIGGER IF EXISTS set_pitches_updated_at ON pitches;
DROP FUNCTION IF EXISTS update_pitches_updated_at();

-- Drop the table
DROP TABLE IF EXISTS pitches;
```
