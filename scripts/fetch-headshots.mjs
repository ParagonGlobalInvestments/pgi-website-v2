/**
 * Playwright script to batch-fetch LinkedIn headshots for cms_people.
 *
 * Usage:
 *   npx playwright install chromium   # first time only
 *   node scripts/fetch-headshots.mjs
 *
 * The script opens a real Chrome window. If you're not logged into LinkedIn,
 * it pauses and waits for you to log in manually (2 min timeout).
 * After that, it visits each profile, extracts the headshot, and uploads
 * it to Supabase Storage.
 */

import 'dotenv/config';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env.local (Next.js convention)
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Only fetch for these groups (officers + founders on public site)
const TARGET_GROUPS = ['officers', 'founders', 'alumni-board'];

async function main() {
  // 1. Get people needing headshots
  const { data: people, error } = await supabase
    .from('cms_people')
    .select('id, name, linkedin, headshot_url, group_slug')
    .not('linkedin', 'is', null)
    .is('headshot_url', null)
    .in('group_slug', TARGET_GROUPS)
    .order('group_slug')
    .order('sort_order');

  if (error) {
    console.error('DB error:', error.message);
    process.exit(1);
  }

  if (!people || people.length === 0) {
    console.log('All officers/founders already have headshots!');
    process.exit(0);
  }

  console.log(`Found ${people.length} people needing headshots:\n`);
  for (const p of people) {
    console.log(`  [${p.group_slug}] ${p.name}`);
  }
  console.log('');

  // 2. Launch browser with persistent context (preserves LinkedIn login)
  const sessionDir = resolve(process.cwd(), '.playwright-session');
  const context = await chromium.launchPersistentContext(sessionDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = context.pages()[0] || (await context.newPage());

  // 3. Check LinkedIn login
  console.log('Checking LinkedIn login...');
  await page.goto('https://www.linkedin.com/feed/', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(3000);

  if (page.url().includes('/login') || page.url().includes('/checkpoint')) {
    console.log('\n  Please log in to LinkedIn in the browser window.');
    console.log('  Waiting up to 2 minutes...\n');
    try {
      await page.waitForURL('**/feed/**', { timeout: 120_000 });
    } catch {
      console.error('Timed out waiting for LinkedIn login. Exiting.');
      await context.close();
      process.exit(1);
    }
    console.log('Logged in!\n');
  } else {
    console.log('Already logged in.\n');
  }

  // 4. Process each person
  const results = [];

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const progress = `[${i + 1}/${people.length}]`;

    try {
      process.stdout.write(`${progress} ${person.name}... `);

      await page.goto(person.linkedin, {
        waitUntil: 'domcontentloaded',
        timeout: 15_000,
      });
      await page.waitForTimeout(2500);

      // Extract the profile photo URL from the page
      const imgSrc = await page.evaluate(() => {
        // LinkedIn profile photos are hosted on media.licdn.com
        // Look for img elements with that domain in the profile header area
        const headerSelectors = [
          '.pv-top-card',
          '[data-section="profile-card"]',
          '.scaffold-layout__main',
          'main',
        ];

        for (const sel of headerSelectors) {
          const container = document.querySelector(sel);
          if (!container) continue;

          const imgs = container.querySelectorAll('img');
          for (const img of imgs) {
            const src = img.src || img.getAttribute('data-delayed-url') || '';
            if (
              src.includes('media.licdn.com') &&
              !src.includes('ghost') &&
              !src.includes('company-logo') &&
              !src.includes('data:image') &&
              // Profile photos are typically 200+ px
              (img.width >= 80 || img.naturalWidth >= 80 || src.includes('200_200'))
            ) {
              return src;
            }
          }
        }

        // Fallback: any img matching LinkedIn media CDN with profile-like dimensions
        const allImgs = document.querySelectorAll('img[src*="media.licdn.com"]');
        for (const img of allImgs) {
          if (
            (img.width >= 80 || img.naturalWidth >= 80) &&
            !img.src.includes('ghost') &&
            !img.src.includes('company-logo') &&
            !img.src.includes('li-default-avatar')
          ) {
            return img.src;
          }
        }

        return null;
      });

      if (!imgSrc) {
        console.log('no photo found');
        results.push({ name: person.name, status: 'no_photo' });
        continue;
      }

      // Download the image from LinkedIn CDN (these URLs are public)
      const imgResponse = await fetch(imgSrc);
      if (!imgResponse.ok) {
        console.log(`download failed (${imgResponse.status})`);
        results.push({ name: person.name, status: 'download_failed' });
        continue;
      }

      const buffer = Buffer.from(await imgResponse.arrayBuffer());
      if (buffer.length < 1000) {
        console.log('image too small (placeholder)');
        results.push({ name: person.name, status: 'placeholder' });
        continue;
      }

      const contentType =
        imgResponse.headers.get('content-type') || 'image/jpeg';
      const ext = contentType.includes('png') ? 'png' : 'jpg';
      const filePath = `headshots/${person.id}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('cms-assets')
        .upload(filePath, buffer, { contentType, upsert: true });

      if (uploadErr) {
        console.log(`upload failed: ${uploadErr.message}`);
        results.push({ name: person.name, status: 'upload_failed' });
        continue;
      }

      // Get public URL and update DB
      const { data: urlData } = supabase.storage
        .from('cms-assets')
        .getPublicUrl(filePath);

      const { error: updateErr } = await supabase
        .from('cms_people')
        .update({ headshot_url: urlData.publicUrl })
        .eq('id', person.id);

      if (updateErr) {
        console.log(`db update failed: ${updateErr.message}`);
        results.push({ name: person.name, status: 'db_failed' });
        continue;
      }

      console.log('done');
      results.push({ name: person.name, status: 'success' });
    } catch (err) {
      console.log(`error: ${err.message}`);
      results.push({ name: person.name, status: 'error', error: err.message });
    }

    // Rate limit — 1.5s between requests
    await page.waitForTimeout(1500);
  }

  // 5. Summary
  const success = results.filter((r) => r.status === 'success').length;
  const noPhoto = results.filter((r) => r.status === 'no_photo').length;
  const failed = results.filter(
    (r) => !['success', 'no_photo'].includes(r.status)
  ).length;

  console.log('\n--- Summary ---');
  console.log(`  Total:    ${results.length}`);
  console.log(`  Success:  ${success}`);
  console.log(`  No photo: ${noPhoto}`);
  console.log(`  Failed:   ${failed}`);

  if (failed > 0) {
    console.log('\nFailed entries:');
    for (const r of results.filter(
      (r) => !['success', 'no_photo'].includes(r.status)
    )) {
      console.log(`  ${r.name}: ${r.status}`);
    }
  }

  await context.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
