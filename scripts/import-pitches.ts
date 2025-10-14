/**
 * Import Pitches Script
 *
 * Scans the /public/portal-resources/pitches/ folders and imports them into Supabase
 *
 * Usage: npx tsx scripts/import-pitches.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getAllPitches, ParsedPitch } from '../src/lib/utils/pitchImporter';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPitches() {
  console.log('🚀 Starting pitch import...\n');

  // Scan folders
  console.log('📁 Scanning pitch folders...');
  const pitches = getAllPitches();
  console.log(`Found ${pitches.length} pitches\n`);

  if (pitches.length === 0) {
    console.log('No pitches to import.');
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const pitch of pitches) {
    try {
      console.log(
        `Processing: ${pitch.ticker} (${pitch.team.toUpperCase()}) - ${pitch.pitchDate}`
      );

      // Check if pitch already exists
      const { data: existing, error: queryError } = await supabase
        .from('pitches')
        .select('id')
        .eq('ticker', pitch.ticker)
        .eq('pitch_date', pitch.pitchDate)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        throw queryError;
      }

      const pitchData = {
        ticker: pitch.ticker,
        team: pitch.team,
        pitch_date: pitch.pitchDate,
        exchange: pitch.exchange,
        pdf_report_path: pitch.pdfPath,
        excel_model_path: pitch.excelPath,
      };

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('pitches')
          .update(pitchData)
          .eq('id', existing.id);

        if (updateError) throw updateError;

        console.log(`  ✓ Updated`);
        updated++;
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('pitches')
          .insert(pitchData);

        if (insertError) throw insertError;

        console.log(`  ✓ Created`);
        created++;
      }
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('\n✅ Import complete!');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

// Run the import
importPitches()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
