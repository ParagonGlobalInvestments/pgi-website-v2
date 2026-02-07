-- Add member status for alumni tracking
ALTER TABLE users ADD COLUMN status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'alumni'));
