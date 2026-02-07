/**
 * PGI Member Import Script
 *
 * Reads the CSV directory, cleans data, and inserts into Supabase.
 * Run with: npx tsx scripts/import-members.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// School slug mapping
// ---------------------------------------------------------------------------

const SCHOOL_MAP: Record<string, string> = {
  Brown: 'brown',
  Columbia: 'columbia',
  Barnard: 'columbia', // Barnard → Columbia
  Cornell: 'cornell',
  NYU: 'nyu',
  Princeton: 'princeton',
  UChicago: 'uchicago',
  UPenn: 'upenn',
  Yale: 'yale',
};

// ---------------------------------------------------------------------------
// Role mapping
// ---------------------------------------------------------------------------

function mapRole(csvRole: string): string {
  const r = csvRole.trim();
  if (r === 'ICOMM' || r === 'QCOMM') return 'committee';
  if (r === 'Value PM') return 'pm';
  if (r.includes('Analyst')) return 'analyst';
  return 'analyst';
}

// ---------------------------------------------------------------------------
// Program mapping
// ---------------------------------------------------------------------------

function mapProgram(csvSide: string): string | null {
  const s = csvSide.trim().toLowerCase();
  if (s === 'value') return 'value';
  if (s === 'quant') return 'quant';
  return null;
}

// Admin roles are set directly in the users table (role = 'admin').
// No separate admin accounts file needed.

// ---------------------------------------------------------------------------
// Parse CSV
// ---------------------------------------------------------------------------

interface CsvRow {
  name: string;
  email: string;
  graduationYear: number | null;
  role: string;
  school: string;
  program: string | null;
}

function parseCSV(filepath: string): CsvRow[] {
  const raw = readFileSync(filepath, 'utf-8');
  const lines = raw.split('\n');

  // Find header row (contains "Name,Email")
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Name') && lines[i].includes('Email')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error('Could not find CSV header row');
  }

  const rows: CsvRow[] = [];
  const seenEmails = new Set<string>();

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ',,,,,,,') continue;

    // Split by comma (CSV is simple — no quoted commas in this data)
    const cols = line.split(',');
    // Columns: [empty], Name, Email, Graduation Year, Role, School, Side, Pod Number

    const name = (cols[1] || '').trim().replace(/^\t+/, ''); // Strip leading tabs
    const email = (cols[2] || '').trim().toLowerCase();
    const gradYearStr = (cols[3] || '').trim();
    const csvRole = (cols[4] || '').trim();
    const csvSchool = (cols[5] || '').trim();
    const csvSide = (cols[6] || '').trim();

    if (!name || !email || !csvRole || !csvSchool) continue;

    // Deduplicate (Mikul Saravanan appears twice)
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    const schoolSlug = SCHOOL_MAP[csvSchool];
    if (!schoolSlug) {
      console.warn(`Unknown school "${csvSchool}" for ${name}, skipping`);
      continue;
    }

    rows.push({
      name,
      email,
      graduationYear: gradYearStr ? parseInt(gradYearStr, 10) : null,
      role: mapRole(csvRole),
      school: schoolSlug,
      program: mapProgram(csvSide),
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const csvPath = resolve(__dirname, '../data/members.csv');
  console.log(`Reading CSV from: ${csvPath}`);

  const rows = parseCSV(csvPath);
  console.log(`Parsed ${rows.length} unique members from CSV`);

  interface InsertRecord {
    name: string;
    email: string;
    alternate_emails: string[];
    role: string;
    program: string | null;
    school: string;
    graduation_year: number | null;
  }

  const records: InsertRecord[] = rows.map(row => ({
    name: row.name,
    email: row.email,
    alternate_emails: [],
    role: row.role,
    program: row.program,
    school: row.school,
    graduation_year: row.graduationYear,
  }));

  console.log(`Total records to insert: ${records.length}`);

  // Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('users').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      // Try inserting one by one to find the problem record
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('users')
          .insert(record);
        if (singleError) {
          console.error(
            `  Failed: ${record.name} (${record.email}):`,
            singleError.message
          );
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`
      );
    }
  }

  console.log(`\nDone! Inserted ${inserted} of ${records.length} records.`);

  // Verification queries
  const { count: totalCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  console.log(`\nVerification:`);
  console.log(`  Total users in DB: ${totalCount}`);

  const { data: admins } = await supabase
    .from('users')
    .select('name, email')
    .eq('role', 'admin');
  console.log(
    `  Admins (${admins?.length}): ${admins?.map(a => a.name).join(', ')}`
  );

  const { count: committeeCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'committee');
  console.log(`  Committee members: ${committeeCount}`);

  const { count: pmCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'pm');
  console.log(`  PMs: ${pmCount}`);

  const { count: valueCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('program', 'value');
  console.log(`  Value program: ${valueCount}`);

  const { count: quantCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('program', 'quant');
  console.log(`  Quant program: ${quantCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
