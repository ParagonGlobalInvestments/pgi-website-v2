/**
 * PGI User Email Migration Script
 *
 * This script:
 * 1. Parses the directory sheet data
 * 2. Fetches all current users from Supabase
 * 3. Matches users by name (fuzzy matching)
 * 4. Updates emails in Supabase where placeholders exist
 * 5. Creates new user records for missing members
 * 6. Reports discrepancies for manual review
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface DirectoryMember {
  name: string;
  email: string;
  graduationYear: number | null;
  role: string;
  school: string;
  track: 'value' | 'quant' | null;
}

interface SupabaseUser {
  id: string;
  personal_name: string;
  personal_email: string;
  personal_grad_year: number;
  org_track?: 'quant' | 'value';
  org_chapter_id?: string;
  org_track_roles: string[];
  org_exec_roles: string[];
}

// Parse the directory file
function parseDirectoryFile(filePath: string): DirectoryMember[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const members: DirectoryMember[] = [];
  let currentTrack: 'value' | 'quant' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and headers
    if (
      !line ||
      line.startsWith('Name\t') ||
      line.includes('Active Members') ||
      line.includes('School Analysts') ||
      line.includes('Executive Board')
    ) {
      continue;
    }

    // Detect section headers to determine track
    if (
      line.includes('Value PM') ||
      line.includes('Value Analyst') ||
      line.includes('Value Education')
    ) {
      currentTrack = 'value';
      if (!line.includes('\t')) continue; // Skip if it's just a header line
    } else if (
      line.includes('Quant Analyst') ||
      line.includes('Quant Education') ||
      line.includes('QCOMM')
    ) {
      currentTrack = 'quant';
      if (!line.includes('\t')) continue;
    } else if (line.includes('ICOMM')) {
      currentTrack = null; // ICOMM can be either track
      if (!line.includes('\t')) continue;
    }

    // Parse data lines (tab-separated)
    const parts = line
      .split('\t')
      .map(p => p.trim())
      .filter(p => p);

    if (parts.length >= 2) {
      const name = parts[0];
      let email = parts[1];

      // Handle multi-line emails (like Dominic's case)
      if (!email.includes('@') && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.includes('@')) {
          email = nextLine.split('\t')[0].trim();
          i++; // Skip next line since we've processed it
        }
      }

      // Skip if no valid email
      if (!email.includes('@') || email.length < 5) {
        continue;
      }

      const gradYear =
        parts[2] && !isNaN(parseInt(parts[2])) ? parseInt(parts[2]) : null;
      const role = parts[3] || '';
      const school = parts[4] || '';

      // Determine track from role if not set from section
      let track = currentTrack;
      if (!track) {
        const roleLower = role.toLowerCase();
        if (roleLower.includes('value')) {
          track = 'value';
        } else if (roleLower.includes('quant')) {
          track = 'quant';
        }
      }

      members.push({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        graduationYear: gradYear,
        role: role.trim(),
        school: school.trim(),
        track,
      });
    }
  }

  // Remove duplicates (same email)
  const uniqueMembers = members.reduce((acc, member) => {
    if (!acc.find(m => m.email === member.email)) {
      acc.push(member);
    }
    return acc;
  }, [] as DirectoryMember[]);

  return uniqueMembers;
}

// Normalize name for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Fuzzy match names
function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  // Exact match
  if (n1 === n2) return true;

  // Check if one name contains the other
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Check if first and last names match (handle middle names/initials)
  const parts1 = n1.split(' ');
  const parts2 = n2.split(' ');

  if (parts1.length >= 2 && parts2.length >= 2) {
    const first1 = parts1[0];
    const last1 = parts1[parts1.length - 1];
    const first2 = parts2[0];
    const last2 = parts2[parts2.length - 1];

    if (first1 === first2 && last1 === last2) return true;
  }

  return false;
}

// Get chapter ID by school name
async function getChapterIdBySchool(school: string): Promise<string | null> {
  const schoolMapping: Record<string, string> = {
    uchicago: 'uchicago',
    chicago: 'uchicago',
    columbia: 'columbia',
    upenn: 'upenn',
    penn: 'upenn',
    wharton: 'upenn',
    princeton: 'princeton',
    yale: 'yale',
    brown: 'brown',
    cornell: 'cornell',
    nyu: 'nyu',
    stern: 'nyu',
    barnard: 'columbia',
  };

  const normalizedSchool = school.toLowerCase().trim();
  const slug = schoolMapping[normalizedSchool];

  if (!slug) return null;

  const { data, error } = await supabase
    .from('chapters')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data.id;
}

async function main() {
  console.log('🚀 Starting PGI User Email Migration...\n');

  // Step 1: Parse directory file
  console.log('📋 Step 1: Parsing directory file...');
  const directoryPath = path.join(
    __dirname,
    'emails_copied_directly_from_directory_sheet.txt'
  );
  const directoryMembers = parseDirectoryFile(directoryPath);
  console.log(`   Found ${directoryMembers.length} members in directory\n`);

  // Step 2: Fetch all current Supabase users
  console.log('📊 Step 2: Fetching current Supabase users...');
  const { data: supabaseUsers, error: fetchError } = await supabase
    .from('users')
    .select(
      'id, personal_name, personal_email, personal_grad_year, org_track, org_chapter_id, org_track_roles, org_exec_roles'
    );

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    process.exit(1);
  }

  console.log(`   Found ${supabaseUsers?.length || 0} users in Supabase\n`);

  // Step 3: Match and update
  console.log('🔄 Step 3: Matching and updating users...\n');

  const matched: Array<{ directory: DirectoryMember; supabase: SupabaseUser }> =
    [];
  const needsUpdate: Array<{
    directory: DirectoryMember;
    supabase: SupabaseUser;
  }> = [];
  const needsCreation: DirectoryMember[] = [];
  const unmatchedSupabase: SupabaseUser[] = [];

  // Match directory members with Supabase users
  for (const dirMember of directoryMembers) {
    const supabaseMatch = supabaseUsers?.find(
      su =>
        namesMatch(dirMember.name, su.personal_name) ||
        su.personal_email.toLowerCase() === dirMember.email.toLowerCase()
    );

    if (supabaseMatch) {
      matched.push({ directory: dirMember, supabase: supabaseMatch });

      // Check if email needs updating (is a placeholder)
      const isPlaceholder =
        supabaseMatch.personal_email.includes('placeholder') ||
        supabaseMatch.personal_email.includes('example.com') ||
        supabaseMatch.personal_email.includes('temp') ||
        !supabaseMatch.personal_email.includes('@');

      if (isPlaceholder || supabaseMatch.personal_email !== dirMember.email) {
        needsUpdate.push({ directory: dirMember, supabase: supabaseMatch });
      }
    } else {
      needsCreation.push(dirMember);
    }
  }

  // Find unmatched Supabase users
  for (const suUser of supabaseUsers || []) {
    const isMatched = matched.some(m => m.supabase.id === suUser.id);
    if (!isMatched) {
      unmatchedSupabase.push(suUser as SupabaseUser);
    }
  }

  console.log(`✅ Matched: ${matched.length} users`);
  console.log(`🔄 Need Email Update: ${needsUpdate.length} users`);
  console.log(`➕ Need Creation: ${needsCreation.length} users`);
  console.log(`⚠️  Unmatched in Supabase: ${unmatchedSupabase.length} users\n`);

  // Step 4: Perform updates
  if (needsUpdate.length > 0) {
    console.log('📝 Step 4: Updating emails...');
    for (const { directory, supabase: user } of needsUpdate) {
      const { error } = await supabase
        .from('users')
        .update({ personal_email: directory.email })
        .eq('id', user.id);

      if (error) {
        console.log(
          `   ❌ Failed to update ${user.personal_name}: ${error.message}`
        );
      } else {
        console.log(
          `   ✅ Updated ${user.personal_name}: ${user.personal_email} → ${directory.email}`
        );
      }
    }
    console.log('');
  }

  // Step 5: Create new users
  if (needsCreation.length > 0) {
    console.log('➕ Step 5: Creating new user records...');
    for (const member of needsCreation) {
      const chapterId = await getChapterIdBySchool(member.school);

      // Map roles to valid enum values
      const roleMapping: Record<string, string[]> = {
        ICOMM: ['InvestmentCommittee'],
        'ICOMM Chair': ['InvestmentCommittee'],
        QCOMM: ['QuantitativeResearchCommittee'],
        'QCOMM Chair': ['QuantitativeResearchCommittee'],
        'Value PM': ['PortfolioManager'],
        'Value Analyst': ['ValueAnalyst'],
        'Quant Analyst': ['QuantitativeAnalyst'],
        'Value Education': [], // Education roles don't have specific enum values
        'Quant Education': [],
      };

      const mappedRoles = roleMapping[member.role] || [];

      const newUser = {
        personal_name: member.name,
        personal_email: member.email,
        personal_grad_year: member.graduationYear || 2027,
        org_chapter_id: chapterId,
        org_track: member.track,
        org_track_roles: mappedRoles,
        org_exec_roles: [] as string[],
        org_permission_level: 'member' as const,
        org_status: 'active' as const,
        personal_is_alumni: false,
        profile_skills: [],
        profile_interests: [],
        profile_achievements: [],
        activity_internships_posted: 0,
        system_first_login: true,
        system_notifications_email: true,
        system_notifications_platform: true,
      };

      const { error } = await supabase.from('users').insert([newUser]);

      if (error) {
        console.log(`   ❌ Failed to create ${member.name}: ${error.message}`);
      } else {
        console.log(`   ✅ Created ${member.name} (${member.email})`);
      }
    }
    console.log('');
  }

  // Step 6: Report discrepancies
  console.log('\n📊 MIGRATION REPORT\n');
  console.log('═'.repeat(80));

  if (unmatchedSupabase.length > 0) {
    console.log(
      '\n⚠️  Users in Supabase NOT found in directory (review needed):'
    );
    console.log('─'.repeat(80));
    unmatchedSupabase.forEach(user => {
      console.log(`   • ${user.personal_name} (${user.personal_email})`);
    });
  }

  if (needsCreation.length > 0) {
    console.log('\n➕ Members from directory that were CREATED in Supabase:');
    console.log('─'.repeat(80));
    needsCreation.forEach(member => {
      console.log(`   • ${member.name} (${member.email}) - ${member.school}`);
    });
  }

  console.log('\n✅ SUMMARY:');
  console.log('─'.repeat(80));
  console.log(`   Total directory members: ${directoryMembers.length}`);
  console.log(`   Total Supabase users before: ${supabaseUsers?.length || 0}`);
  console.log(`   Successfully matched: ${matched.length}`);
  console.log(`   Emails updated: ${needsUpdate.length}`);
  console.log(`   New users created: ${needsCreation.length}`);
  console.log(`   Unmatched Supabase users: ${unmatchedSupabase.length}`);
  console.log('═'.repeat(80));

  // Save detailed report to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDirectoryMembers: directoryMembers.length,
      totalSupabaseUsersBefore: supabaseUsers?.length || 0,
      matched: matched.length,
      emailsUpdated: needsUpdate.length,
      newUsersCreated: needsCreation.length,
      unmatchedSupabase: unmatchedSupabase.length,
    },
    unmatchedSupabaseUsers: unmatchedSupabase.map(u => ({
      name: u.personal_name,
      email: u.personal_email,
      gradYear: u.personal_grad_year,
    })),
    updatedEmails: needsUpdate.map(u => ({
      name: u.supabase.personal_name,
      oldEmail: u.supabase.personal_email,
      newEmail: u.directory.email,
    })),
    createdUsers: needsCreation.map(m => ({
      name: m.name,
      email: m.email,
      school: m.school,
      role: m.role,
    })),
  };

  const reportPath = path.join(
    __dirname,
    `migration-report-${Date.now()}.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
}

// Run the migration
main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
