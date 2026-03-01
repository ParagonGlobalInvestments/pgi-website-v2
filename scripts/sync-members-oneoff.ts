/**
 * One-off PGI directory sync script.
 *
 * Sync behavior:
 * - Inserts new members from CSV
 * - Updates existing members by primary or alternate email
 * - Marks users not present in CSV as alumni (excluding admins)
 *
 * Usage:
 *   npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv"
 *   npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --dry-run
 *   npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --dry-run --verbose
 *   npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --apply
 *   npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --apply --respect-inactive-notes
 */

import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

loadEnv({ path: resolve(process.cwd(), '.env.local') });

type UserRole = 'admin' | 'committee' | 'pm' | 'analyst';
type UserProgram = 'value' | 'quant' | null;
type UserStatus = 'active' | 'alumni';

interface CsvRow {
  name: string;
  email: string;
  graduationYear: number | null;
  role: UserRole;
  school: string;
  program: UserProgram | undefined;
  inactiveFromNote: boolean;
}

interface ExistingUserRow {
  id: string;
  name: string;
  email: string;
  alternate_emails: string[] | null;
  role: UserRole;
  program: UserProgram;
  school: string;
  graduation_year: number | null;
  status: UserStatus;
}

interface ParseResult {
  rows: CsvRow[];
  duplicateEmails: string[];
  unknownSchools: Array<{ name: string; email: string; school: string }>;
  missingRequiredCount: number;
}

const SCHOOL_MAP: Record<string, string> = {
  Brown: 'brown',
  Columbia: 'columbia',
  Barnard: 'columbia',
  Cornell: 'cornell',
  NYU: 'nyu',
  Princeton: 'princeton',
  UChicago: 'uchicago',
  UPenn: 'upenn',
  Yale: 'yale',
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeNameForMatch(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function makeIdentityKey(
  name: string,
  school: string,
  graduationYear: number | null
): string {
  return `${normalizeNameForMatch(name)}|${school}|${graduationYear ?? 'null'}`;
}

function mapRole(csvRole: string): UserRole {
  const value = csvRole.trim().toLowerCase();

  if (value.includes('icomm') || value.includes('qcomm')) return 'committee';
  if (value.includes('pm')) return 'pm';
  if (value.includes('analyst') || value.includes('education'))
    return 'analyst';

  return 'analyst';
}

function mapProgram(csvSide: string): UserProgram | undefined {
  const value = csvSide.trim().toLowerCase();
  if (value === '') return undefined;
  if (value === 'value') return 'value';
  if (value === 'quant') return 'quant';
  return null;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields.map(field => field.trim());
}

function parseCsvFile(filePath: string): ParseResult {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes('Name') &&
      line.includes('Email') &&
      line.includes('Role')
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(
      'Could not find CSV header row containing Name/Email/Role columns.'
    );
  }

  const rows: CsvRow[] = [];
  const duplicateEmails: string[] = [];
  const unknownSchools: Array<{ name: string; email: string; school: string }> =
    [];
  const seenEmails = new Set<string>();
  let missingRequiredCount = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.replace(/,/g, '').trim() === '') continue;

    const cols = parseCsvLine(line);

    const name = (cols[1] || '').replace(/^\t+/, '').trim();
    const email = normalizeEmail(cols[2] || '');
    const gradYearRaw = (cols[3] || '').trim();
    const csvRole = (cols[4] || '').trim();
    const csvSchool = (cols[5] || '').trim();
    const csvSide = (cols[6] || '').trim();
    const notes = cols.slice(8).join(',').toLowerCase();

    if (!name || !email || !csvRole || !csvSchool) {
      missingRequiredCount++;
      continue;
    }

    if (seenEmails.has(email)) {
      duplicateEmails.push(email);
      continue;
    }
    seenEmails.add(email);

    const schoolSlug = SCHOOL_MAP[csvSchool];
    if (!schoolSlug) {
      unknownSchools.push({ name, email, school: csvSchool });
      continue;
    }

    rows.push({
      name,
      email,
      graduationYear: gradYearRaw
        ? (() => {
            const parsed = Number.parseInt(gradYearRaw, 10);
            return Number.isFinite(parsed) ? parsed : null;
          })()
        : null,
      role: mapRole(csvRole),
      school: schoolSlug,
      program: mapProgram(csvSide),
      inactiveFromNote: notes.includes('inactive'),
    });
  }

  return {
    rows,
    duplicateEmails,
    unknownSchools,
    missingRequiredCount,
  };
}

function hasUserChanges(
  existing: ExistingUserRow,
  next: {
    name: string;
    email: string;
    role: UserRole;
    program: UserProgram;
    school: string;
    graduation_year: number | null;
    status: UserStatus;
  }
): boolean {
  return (
    existing.name !== next.name ||
    normalizeEmail(existing.email) !== normalizeEmail(next.email) ||
    existing.role !== next.role ||
    existing.program !== next.program ||
    existing.school !== next.school ||
    existing.graduation_year !== next.graduation_year ||
    existing.status !== next.status
  );
}

function printUsage() {
  console.log(
    `
Usage:
  npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv"
  npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --dry-run
  npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --dry-run --verbose
  npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --apply
  npx tsx scripts/sync-members-oneoff.ts "/absolute/path/to/members.csv" --apply --respect-inactive-notes

Flags:
  --apply                    Apply database writes. Without this flag, script runs as dry-run.
  --dry-run                  Explicit dry-run mode (same behavior as default).
  --respect-inactive-notes   If a CSV row note includes "inactive", set that member to alumni.
  --verbose                  Print tables for each sync bucket and skipped rows.
  --help                     Show this help.
`.trim()
  );
}

function printBucketTable<T extends Record<string, unknown>>(
  title: string,
  rows: T[]
) {
  console.log(`\n${title} (${rows.length})`);
  if (rows.length === 0) {
    console.log('- none');
    return;
  }
  console.table(rows);
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(arg => arg.startsWith('--')));
  const positional = args.filter(arg => !arg.startsWith('--'));

  if (flags.has('--help') || positional.length === 0) {
    printUsage();
    process.exit(positional.length === 0 ? 1 : 0);
  }

  const csvPath = resolve(positional[0]);
  const explicitDryRun = flags.has('--dry-run');
  const shouldApply = flags.has('--apply');
  const respectInactiveNotes = flags.has('--respect-inactive-notes');
  const verbose = flags.has('--verbose');

  if (shouldApply && explicitDryRun) {
    throw new Error('Use only one mode: --apply or --dry-run.');
  }

  if (!existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment/.env.local.'
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Mode: ${shouldApply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`CSV: ${csvPath}`);
  console.log(
    `Inactive notes handling: ${
      respectInactiveNotes ? 'enabled (inactive => alumni)' : 'disabled'
    }`
  );

  const parsed = parseCsvFile(csvPath);
  const csvEmails = new Set(parsed.rows.map(row => row.email));

  console.log(`\nParsed ${parsed.rows.length} CSV members`);
  if (parsed.duplicateEmails.length > 0) {
    console.log(`- Skipped duplicate emails: ${parsed.duplicateEmails.length}`);
  }
  if (parsed.unknownSchools.length > 0) {
    console.log(`- Skipped unknown schools: ${parsed.unknownSchools.length}`);
  }
  if (parsed.missingRequiredCount > 0) {
    console.log(
      `- Skipped rows missing required fields: ${parsed.missingRequiredCount}`
    );
  }

  const { data: existingUsers, error: fetchError } = await supabase
    .from('users')
    .select(
      'id, name, email, alternate_emails, role, program, school, graduation_year, status'
    );

  if (fetchError) throw fetchError;

  const users = (existingUsers || []) as ExistingUserRow[];
  const primaryEmailMap = new Map<string, ExistingUserRow>();
  const alternateEmailMap = new Map<string, ExistingUserRow>();
  const identityMap = new Map<string, ExistingUserRow[]>();

  for (const user of users) {
    primaryEmailMap.set(normalizeEmail(user.email), user);
    for (const alt of user.alternate_emails || []) {
      const normalizedAlt = normalizeEmail(alt);
      if (!alternateEmailMap.has(normalizedAlt)) {
        alternateEmailMap.set(normalizedAlt, user);
      }
    }

    const identityKey = makeIdentityKey(
      user.name,
      user.school,
      user.graduation_year
    );
    const existingIdentityMatches = identityMap.get(identityKey) || [];
    existingIdentityMatches.push(user);
    identityMap.set(identityKey, existingIdentityMatches);
  }

  const inserts: Array<{
    name: string;
    email: string;
    alternate_emails: string[];
    role: UserRole;
    program: UserProgram;
    school: string;
    graduation_year: number | null;
    status: UserStatus;
  }> = [];

  const updates: Array<{
    id: string;
    matchedBy: 'primary' | 'alternate' | 'fallback_identity';
    existing: ExistingUserRow;
    incoming: CsvRow;
    payload: {
      name: string;
      email: string;
      role: UserRole;
      program: UserProgram;
      school: string;
      graduation_year: number | null;
      status: UserStatus;
    };
  }> = [];

  const unchanged: Array<{
    id: string;
    matchedBy: 'primary' | 'alternate' | 'fallback_identity';
    existing: ExistingUserRow;
    incoming: CsvRow;
    payload: {
      name: string;
      email: string;
      role: UserRole;
      program: UserProgram;
      school: string;
      graduation_year: number | null;
      status: UserStatus;
    };
  }> = [];
  const matchedExistingUserIds = new Set<string>();

  for (const row of parsed.rows) {
    const existingByPrimary = primaryEmailMap.get(row.email) || null;
    const existingByAlt = alternateEmailMap.get(row.email) || null;
    const identityKey = makeIdentityKey(
      row.name,
      row.school,
      row.graduationYear
    );
    const identityMatches = identityMap.get(identityKey) || [];
    const existingByIdentity =
      !existingByPrimary && !existingByAlt && identityMatches.length === 1
        ? identityMatches[0]
        : null;
    const existing = existingByPrimary || existingByAlt || existingByIdentity;

    let matchedBy: 'primary' | 'alternate' | 'fallback_identity' = 'primary';
    if (existingByPrimary) {
      matchedBy = 'primary';
    } else if (existingByAlt) {
      matchedBy = 'alternate';
    } else if (existingByIdentity) {
      matchedBy = 'fallback_identity';
    }

    const nextRole: UserRole = existing?.role === 'admin' ? 'admin' : row.role;
    const nextStatus: UserStatus =
      respectInactiveNotes && row.inactiveFromNote ? 'alumni' : 'active';
    const nextProgram: UserProgram =
      row.program === undefined ? (existing?.program ?? null) : row.program;
    const nextName =
      existing &&
      normalizeNameForMatch(existing.name) === normalizeNameForMatch(row.name)
        ? existing.name
        : row.name;

    const nextPayload = {
      name: nextName,
      email: row.email,
      role: nextRole,
      program: nextProgram,
      school: row.school,
      graduation_year: row.graduationYear,
      status: nextStatus,
    };

    if (!existing) {
      inserts.push({
        ...nextPayload,
        alternate_emails: [],
      });
      continue;
    }

    matchedExistingUserIds.add(existing.id);

    if (!hasUserChanges(existing, nextPayload)) {
      unchanged.push({
        id: existing.id,
        matchedBy,
        existing,
        incoming: row,
        payload: nextPayload,
      });
      continue;
    }

    updates.push({
      id: existing.id,
      matchedBy,
      existing,
      incoming: row,
      payload: nextPayload,
    });
  }

  const graduations = users.filter(user => {
    if (user.role === 'admin') return false;
    if (matchedExistingUserIds.has(user.id)) return false;

    const primaryMatch = csvEmails.has(normalizeEmail(user.email));
    const alternateMatch = (user.alternate_emails || []).some(alt =>
      csvEmails.has(normalizeEmail(alt))
    );

    return !primaryMatch && !alternateMatch && user.status !== 'alumni';
  });

  console.log(`\nPlanned changes:`);
  console.log(`- Inserts: ${inserts.length}`);
  console.log(`- Updates: ${updates.length}`);
  console.log(`- Graduate to alumni: ${graduations.length}`);
  console.log(`- Unchanged: ${unchanged.length}`);

  if (verbose) {
    printBucketTable(
      'Skipped duplicate CSV emails',
      parsed.duplicateEmails.map(email => ({ email }))
    );
    printBucketTable('Skipped unknown schools', parsed.unknownSchools);

    const insertRows = inserts.map(row => ({
      name: row.name,
      email: row.email,
      graduation_year: row.graduation_year,
      role: row.role,
      school: row.school,
      program: row.program,
      status: row.status,
      alternate_emails: row.alternate_emails.join(','),
    }));

    const updateRows = updates.map(item => ({
      id: item.id,
      matched_by: item.matchedBy,
      existing_name: item.existing.name,
      incoming_name: item.incoming.name,
      existing_email: item.existing.email,
      incoming_email: item.payload.email,
      existing_role: item.existing.role,
      incoming_role: item.incoming.role,
      next_role: item.payload.role,
      existing_program: item.existing.program,
      incoming_program: item.incoming.program,
      next_program: item.payload.program,
      existing_school: item.existing.school,
      incoming_school: item.incoming.school,
      next_school: item.payload.school,
      existing_graduation_year: item.existing.graduation_year,
      incoming_graduation_year: item.incoming.graduationYear,
      next_graduation_year: item.payload.graduation_year,
      existing_status: item.existing.status,
      incoming_inactive_note: item.incoming.inactiveFromNote,
      next_status: item.payload.status,
      existing_alternate_emails: (item.existing.alternate_emails || []).join(
        ','
      ),
    }));

    const graduationRows = graduations.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      alternate_emails: (user.alternate_emails || []).join(','),
      role: user.role,
      program: user.program,
      school: user.school,
      graduation_year: user.graduation_year,
      existing_status: user.status,
      next_status: 'alumni' as const,
    }));

    const unchangedRows = unchanged.map(item => ({
      id: item.id,
      matched_by: item.matchedBy,
      existing_name: item.existing.name,
      incoming_name: item.incoming.name,
      existing_email: item.existing.email,
      incoming_email: item.payload.email,
      existing_role: item.existing.role,
      incoming_role: item.incoming.role,
      next_role: item.payload.role,
      existing_program: item.existing.program,
      incoming_program: item.incoming.program,
      next_program: item.payload.program,
      existing_school: item.existing.school,
      incoming_school: item.incoming.school,
      next_school: item.payload.school,
      existing_graduation_year: item.existing.graduation_year,
      incoming_graduation_year: item.incoming.graduationYear,
      next_graduation_year: item.payload.graduation_year,
      existing_status: item.existing.status,
      incoming_inactive_note: item.incoming.inactiveFromNote,
      next_status: item.payload.status,
      existing_alternate_emails: (item.existing.alternate_emails || []).join(
        ','
      ),
    }));

    printBucketTable('Inserts', insertRows);
    printBucketTable('Updates', updateRows);
    printBucketTable('Graduate to alumni', graduationRows);
    printBucketTable('Unchanged', unchangedRows);
  }

  if (!shouldApply) {
    console.log('\nDry-run complete. Re-run with --apply to write changes.');
    return;
  }

  let insertSuccess = 0;
  let updateSuccess = 0;
  let graduateSuccess = 0;
  let failures = 0;

  for (const row of inserts) {
    const { error } = await supabase.from('users').insert(row);
    if (error) {
      failures++;
      console.error(`Insert failed for ${row.email}: ${error.message}`);
    } else {
      insertSuccess++;
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('users')
      .update(update.payload)
      .eq('id', update.id);

    if (error) {
      failures++;
      console.error(`Update failed for user ${update.id}: ${error.message}`);
    } else {
      updateSuccess++;
    }
  }

  for (const user of graduations) {
    const { error } = await supabase
      .from('users')
      .update({ status: 'alumni' })
      .eq('id', user.id);

    if (error) {
      failures++;
      console.error(
        `Alumni graduation failed for ${user.email}: ${error.message}`
      );
    } else {
      graduateSuccess++;
    }
  }

  console.log(`\nApplied changes:`);
  console.log(`- Inserts successful: ${insertSuccess}/${inserts.length}`);
  console.log(`- Updates successful: ${updateSuccess}/${updates.length}`);
  console.log(
    `- Alumni graduations successful: ${graduateSuccess}/${graduations.length}`
  );
  console.log(`- Failures: ${failures}`);

  if (failures > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal error: ${message}`);
  process.exit(1);
});
