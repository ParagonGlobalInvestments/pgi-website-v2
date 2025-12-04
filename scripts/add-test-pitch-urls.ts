/**
 * Quick script to add test Google Drive URLs to existing pitches
 * so we can test the mobile viewer
 *
 * Usage: npx tsx scripts/add-test-pitch-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ missing supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestUrls() {
  console.log('🚀 adding test google drive urls to pitches...\n');

  // sample public google drive urls for testing
  const testPdfUrl = 'https://drive.google.com/file/d/1_OKU7MsXZFZhNhqKg9Y7U9MQqCLEfQu5/view';
  const testExcelUrl = 'https://drive.google.com/file/d/1kCKbYVqLZXPJQYFXlvKMZDYN9zCWLIqz/view';

  // get first pitch (CYTK or DLR)
  const { data: pitches, error: fetchError } = await supabase
    .from('pitches')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('❌ error fetching pitches:', fetchError);
    process.exit(1);
  }

  if (!pitches || pitches.length === 0) {
    console.log('ℹ️  no pitches found in database');
    process.exit(0);
  }

  const pitch = pitches[0];
  console.log(`📄 updating pitch: ${pitch.ticker}`);

  // update with test urls
  const { error: updateError } = await supabase
    .from('pitches')
    .update({
      pdf_report_path: testPdfUrl,
      excel_model_path: testExcelUrl,
    })
    .eq('id', pitch.id);

  if (updateError) {
    console.error('❌ error updating pitch:', updateError);
    process.exit(1);
  }

  console.log('\n✅ success!');
  console.log(`\npitch ${pitch.ticker} now has test urls:`);
  console.log(`- pdf: ${testPdfUrl}`);
  console.log(`- excel: ${testExcelUrl}`);
  console.log('\n🎯 next steps:');
  console.log('1. go to: http://localhost:3000/portal/dashboard/pitches');
  console.log(`2. click "view" on the ${pitch.ticker} pitch`);
  console.log('3. open chrome devtools (F12) → toggle device mode (Cmd+Shift+M)');
  console.log('4. select mobile device → refresh');
  console.log('5. you should see buttons instead of iframes!');
  console.log('6. click "view pdf" to test the mobile viewer');
}

addTestUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('fatal error:', error);
    process.exit(1);
  });
