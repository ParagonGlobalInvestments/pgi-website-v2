# Exchange Field Migration

This migration adds the `exchange` field to the `pitches` table to store whether a stock is traded on NASDAQ or NYSE.

## SQL Migration

Run this in your Supabase SQL Editor:

```sql
-- Add exchange column to pitches table
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS exchange VARCHAR(10);

-- Update existing pitches (you can set a default or leave as NULL)
UPDATE pitches SET exchange = 'NASDAQ' WHERE exchange IS NULL;

-- Optional: Add constraint to ensure only valid exchanges
ALTER TABLE pitches ADD CONSTRAINT check_exchange CHECK (exchange IN ('NASDAQ', 'NYSE') OR exchange IS NULL);
```

## Usage

After running the migration, the pitch import script will automatically populate the `exchange` field based on the folder name structure.

Run the import script:

```bash
npx tsx scripts/import-pitches.ts
```

This will:

1. Scan `/public/portal-resources/pitches/` folders
2. Parse folder names to extract ticker, date, and exchange
3. Create or update pitch entries in Supabase
4. Populate the `exchange` field automatically
