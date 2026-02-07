/**
 * Playwright script to batch-fetch LinkedIn headshots AND banners for cms_people.
 *
 * Usage:
 *   npx playwright install chromium   # first time only
 *   node scripts/fetch-linkedin-assets.mjs
 *
 * Uploads to Supabase Storage with human-readable slug-based filenames:
 *   cms-assets/headshots/jay-sivadas.jpg
 *   cms-assets/banners/jay-sivadas.jpg
 *
 * Duplicate names across groups get a suffix: jay-sivadas-founders.jpg
 */

import 'dotenv/config';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { config } from 'dotenv';

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

const TARGET_GROUPS = ['officers', 'founders', 'alumni-board'];
const BUCKET = 'cms-assets';

/** Month abbreviation → number (1-12) */
const MONTH_MAP = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** Parse "Jun 2024", "2024", or "Present" → { year, month } */
function parseLinkedInDate(str) {
  if (!str) return { year: null, month: null };
  const s = str.trim().toLowerCase();
  if (s === 'present') return { year: null, month: null };

  // "Jun 2024" or "June 2024"
  const monthYear = s.match(/^([a-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const abbr = monthYear[1].slice(0, 3);
    return { year: parseInt(monthYear[2]), month: MONTH_MAP[abbr] || null };
  }

  // Just "2024"
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) {
    return { year: parseInt(yearOnly[1]), month: null };
  }

  return { year: null, month: null };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "Daniel Labrador-Plata" → "daniel-labrador-plata" */
function slugify(name) {
  return name
    .normalize('NFD')                   // decompose accents
    .replace(/[\u0300-\u036f]/g, '')    // strip accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')       // non-alnum → hyphen
    .replace(/^-+|-+$/g, '');           // trim leading/trailing hyphens
}

/** Build a slug map handling duplicate names by appending group_slug */
function buildSlugMap(people) {
  // Count how many times each base slug appears
  const slugCounts = {};
  for (const p of people) {
    const base = slugify(p.name);
    slugCounts[base] = (slugCounts[base] || 0) + 1;
  }

  // Assign final slugs
  const map = new Map();
  for (const p of people) {
    const base = slugify(p.name);
    const slug = slugCounts[base] > 1 ? `${base}-${p.group_slug}` : base;
    map.set(p.id, slug);
  }
  return map;
}

/** Delete all files in a storage folder */
async function clearFolder(folder) {
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 1000 });

  if (error) {
    console.warn(`  Warning: could not list ${folder}:`, error.message);
    return;
  }

  if (!files || files.length === 0) return;

  const paths = files.map((f) => `${folder}/${f.name}`);
  const { error: delErr } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (delErr) {
    console.warn(`  Warning: could not clear ${folder}:`, delErr.message);
  } else {
    console.log(`  Cleared ${paths.length} files from ${folder}/`);
  }
}

/** Upload a buffer to storage and return the public URL */
async function uploadAsset(folder, slug, buffer, contentType) {
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const filePath = `${folder}/${slug}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Get all people in target groups with LinkedIn URLs
  const { data: people, error } = await supabase
    .from('cms_people')
    .select('id, name, linkedin, headshot_url, banner_url, group_slug')
    .not('linkedin', 'is', null)
    .in('group_slug', TARGET_GROUPS)
    .order('group_slug')
    .order('sort_order');

  if (error) {
    console.error('DB error:', error.message);
    process.exit(1);
  }

  if (!people || people.length === 0) {
    console.log('No people with LinkedIn URLs found.');
    process.exit(0);
  }

  const slugMap = buildSlugMap(people);

  console.log(`Found ${people.length} people to process:\n`);
  for (const p of people) {
    console.log(`  [${p.group_slug}] ${p.name} → ${slugMap.get(p.id)}`);
  }
  console.log('');

  // 2. Clean old files from storage
  console.log('Cleaning old storage files...');
  await clearFolder('headshots');
  await clearFolder('banners');
  console.log('');

  // 3. Clear existing URLs in DB so we start fresh
  const { error: clearErr } = await supabase
    .from('cms_people')
    .update({ headshot_url: null, banner_url: null })
    .not('linkedin', 'is', null)
    .in('group_slug', TARGET_GROUPS);

  if (clearErr) {
    console.error('Failed to clear DB URLs:', clearErr.message);
    process.exit(1);
  }

  // 4. Launch browser with persistent context
  const sessionDir = resolve(process.cwd(), '.playwright-session');
  const context = await chromium.launchPersistentContext(sessionDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = context.pages()[0] || (await context.newPage());

  // 5. Check LinkedIn login
  console.log('Checking LinkedIn login...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
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

  // 6. Cache to avoid re-fetching the same LinkedIn page for duplicates
  // Key: linkedin URL, Value: { headshotBuffer, headshotType, bannerBuffer, bannerType, experience }
  const cache = new Map();

  // 7. Process each person
  const results = [];

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const slug = slugMap.get(person.id);
    const progress = `[${i + 1}/${people.length}]`;

    try {
      process.stdout.write(`${progress} ${person.name} (${slug})... `);

      let assets;

      if (cache.has(person.linkedin)) {
        assets = cache.get(person.linkedin);
        process.stdout.write('(cached) ');
      } else {
        // Visit the LinkedIn profile
        await page.goto(person.linkedin, {
          waitUntil: 'domcontentloaded',
          timeout: 15_000,
        });
        await page.waitForTimeout(2500);

        // Extract headshot + banner URLs by classifying LinkedIn CDN paths.
        // CDN URLs encode asset type:
        //   headshot → "profile-displayphoto-shrink_..."
        //   banner   → "background-profile-shrink_..."
        const { imgSrc, bannerSrc } = await page.evaluate(() => {
          const allImgs = Array.from(document.querySelectorAll('img'));
          const cdnUrls = [];

          for (const img of allImgs) {
            const src = img.src || img.getAttribute('data-delayed-url') || '';
            if (src.includes('media.licdn.com') && !src.includes('ghost') && !src.includes('data:image') && !src.includes('li-default-avatar')) {
              cdnUrls.push(src);
            }
          }

          // Also check CSS background-image on common banner containers
          const bgSelectors = [
            '.profile-background-image',
            '[data-section="profile-background"]',
          ];
          for (const sel of bgSelectors) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const bg = getComputedStyle(el).backgroundImage;
            const match = bg?.match(/url\(["']?(.*?)["']?\)/);
            if (match?.[1] && match[1].includes('media.licdn.com')) {
              cdnUrls.push(match[1]);
            }
          }

          // Classify by URL path pattern
          let headshot = null;
          let banner = null;

          for (const url of cdnUrls) {
            if (!headshot && url.includes('profile-displayphoto')) {
              headshot = url;
            }
            if (!banner && url.includes('background-profile')) {
              banner = url;
            }
            if (headshot && banner) break;
          }

          // Fallback for headshots: if no displayphoto URL, look for a roughly
          // square image in the top-card area that isn't a banner
          if (!headshot) {
            const topCard = document.querySelector('.pv-top-card') || document.querySelector('main');
            if (topCard) {
              const imgs = topCard.querySelectorAll('img');
              for (const img of imgs) {
                const src = img.src || '';
                if (!src.includes('media.licdn.com')) continue;
                if (src.includes('background-profile')) continue;
                if (src.includes('ghost') || src.includes('company-logo')) continue;
                const w = img.naturalWidth || img.width;
                const h = img.naturalHeight || img.height;
                if (w >= 80 && h > 0 && w / h < 1.8) {
                  headshot = src;
                  break;
                }
              }
            }
          }

          return { imgSrc: headshot, bannerSrc: banner };
        });

        // Debug logging — show exactly what URLs were picked
        if (imgSrc) {
          const short = imgSrc.replace(/^https?:\/\//, '').slice(0, 90);
          console.log(`\n  headshot: ${short}...`);
        }
        if (bannerSrc) {
          const short = bannerSrc.replace(/^https?:\/\//, '').slice(0, 90);
          console.log(`  banner:   ${short}...`);
        }
        if (!imgSrc && !bannerSrc) {
          console.log('\n  (no CDN image URLs matched)');
        }

        // Download headshot
        let headshotBuffer = null;
        let headshotType = 'image/jpeg';
        if (imgSrc) {
          try {
            const resp = await fetch(imgSrc);
            if (resp.ok) {
              const buf = Buffer.from(await resp.arrayBuffer());
              if (buf.length >= 1000) {
                headshotBuffer = buf;
                headshotType = resp.headers.get('content-type') || 'image/jpeg';
              }
            }
          } catch { /* skip */ }
        }

        // Download banner
        let bannerBuffer = null;
        let bannerType = 'image/jpeg';
        if (bannerSrc) {
          try {
            const resp = await fetch(bannerSrc);
            if (resp.ok) {
              const buf = Buffer.from(await resp.arrayBuffer());
              if (buf.length >= 1000) {
                bannerBuffer = buf;
                bannerType = resp.headers.get('content-type') || 'image/jpeg';
              }
            }
          } catch { /* skip */ }
        }

        // Extract experience from profile page
        let experience = [];
        try {
          experience = await page.evaluate(() => {
            const entries = [];

            // Find the experience section by #experience anchor
            const anchor = document.getElementById('experience');
            if (!anchor) return entries;

            // The section is the next sibling or parent section
            const section = anchor.closest('section') || anchor.parentElement?.closest('section');
            if (!section) return entries;

            const items = section.querySelectorAll('li.artdeco-list__item');

            for (const item of items) {
              // Check if this is a grouped entry (multiple roles at same company)
              const innerList = item.querySelector('ul');

              if (innerList) {
                // Grouped: company is in the top-level of this item
                const companyEl = item.querySelector('.t-bold span, div.t-bold span');
                const company = companyEl?.textContent?.trim() || '';

                const subItems = innerList.querySelectorAll(':scope > li');
                for (const sub of subItems) {
                  const spans = sub.querySelectorAll('span[aria-hidden="true"]');
                  const texts = Array.from(spans).map(s => s.textContent?.trim()).filter(Boolean);
                  // Typically: [role, date range, location]
                  const role = texts[0] || '';
                  const dateStr = texts.find(t => /\d{4}/.test(t) && /[–\-]/.test(t)) || '';
                  const empType = texts.find(t => /internship|full.time|part.time|contract/i.test(t)) || null;
                  const location = texts.find(t => t !== role && t !== dateStr && t !== empType && !t.includes('·') && /[A-Z]/.test(t) && !/\d{4}/.test(t)) || null;

                  entries.push({ role, company, dateStr, employmentType: empType, location });
                }
              } else {
                // Single entry
                const spans = item.querySelectorAll('span[aria-hidden="true"]');
                const texts = Array.from(spans).map(s => s.textContent?.trim()).filter(Boolean);
                // Typically: [role, company + type, date range, location]
                const role = texts[0] || '';
                const companyLine = texts[1] || '';
                const company = companyLine.split('·')[0]?.trim() || companyLine;
                const empType = texts.find(t => /internship|full.time|part.time|contract/i.test(t)) || null;
                const dateStr = texts.find(t => /\d{4}/.test(t) && /[–\-]/.test(t)) || '';
                const location = texts.find(t => t !== role && t !== companyLine && t !== dateStr && !t.includes('·') && /[A-Z]/.test(t) && !/\d{4}/.test(t)) || null;

                if (role && company) {
                  entries.push({ role, company, dateStr, employmentType: empType, location });
                }
              }
            }

            return entries;
          });

          // Parse dates from dateStr on each entry
          experience = experience.map(e => {
            // dateStr looks like "Jun 2024 – Aug 2024" or "2024 – Present"
            const parts = (e.dateStr || '').split(/\s*[–\-]\s*/);
            const start = parseLinkedInDate(parts[0]);
            const end = parseLinkedInDate(parts[1]);

            // Detect employment type from text
            let employmentType = null;
            if (e.employmentType) {
              const t = e.employmentType.toLowerCase();
              if (t.includes('internship')) employmentType = 'internship';
              else if (t.includes('full')) employmentType = 'full-time';
              else if (t.includes('part')) employmentType = 'part-time';
              else if (t.includes('contract')) employmentType = 'contract';
            }

            return {
              role: e.role,
              company: e.company,
              startYear: start.year,
              startMonth: start.month,
              endYear: end.year,
              endMonth: end.month,
              employmentType,
              location: e.location || null,
            };
          }).filter(e => e.company && e.role);
        } catch (expErr) {
          console.log(`\n  experience extraction failed: ${expErr.message}`);
        }

        assets = { headshotBuffer, headshotType, bannerBuffer, bannerType, experience };
        cache.set(person.linkedin, assets);
      }

      // Upload headshot
      let headshotUrl = null;
      if (assets.headshotBuffer) {
        headshotUrl = await uploadAsset('headshots', slug, assets.headshotBuffer, assets.headshotType);
      }

      // Upload banner
      let bannerUrl = null;
      if (assets.bannerBuffer) {
        bannerUrl = await uploadAsset('banners', slug, assets.bannerBuffer, assets.bannerType);
      }

      // Update DB
      const updates = {};
      if (headshotUrl) updates.headshot_url = headshotUrl;
      if (bannerUrl) updates.banner_url = bannerUrl;

      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase
          .from('cms_people')
          .update(updates)
          .eq('id', person.id);

        if (updateErr) {
          console.log(`db update failed: ${updateErr.message}`);
          results.push({ name: person.name, slug, status: 'db_failed' });
          continue;
        }
      }

      // Save experience to DB
      let expCount = 0;
      if (assets.experience && assets.experience.length > 0) {
        try {
          // Delete old linkedin-sourced experience for this person
          await supabase
            .from('experience')
            .delete()
            .eq('person_id', person.id)
            .eq('source', 'linkedin');

          // Insert new rows
          const rows = assets.experience.map((e, idx) => ({
            person_id: person.id,
            company: e.company,
            role: e.role,
            start_year: e.startYear || new Date().getFullYear(),
            start_month: e.startMonth,
            end_year: e.endYear,
            end_month: e.endMonth,
            employment_type: e.employmentType,
            location: e.location,
            source: 'linkedin',
            sort_order: idx,
          }));

          const { error: expInsertErr } = await supabase
            .from('experience')
            .insert(rows);

          if (expInsertErr) {
            console.log(`  experience insert failed: ${expInsertErr.message}`);
          } else {
            expCount = rows.length;
          }
        } catch (expDbErr) {
          console.log(`  experience DB error: ${expDbErr.message}`);
        }
      }

      const parts = [];
      if (headshotUrl) parts.push('headshot');
      if (bannerUrl) parts.push('banner');
      if (expCount > 0) {
        const companies = assets.experience.map(e => e.company).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(', ');
        parts.push(`${expCount} experience (${companies})`);
      }
      const label = parts.length > 0 ? parts.join(' + ') : 'no assets found';

      console.log(`  → ${label}`);
      results.push({
        name: person.name,
        slug,
        status: headshotUrl ? 'success' : 'no_photo',
        headshot: !!headshotUrl,
        banner: !!bannerUrl,
        experienceCount: expCount,
      });
    } catch (err) {
      console.log(`error: ${err.message}`);
      results.push({ name: person.name, slug, status: 'error', error: err.message });
    }

    // Rate limit — 1.5s between requests (skip if cached)
    if (!cache.has(people[i + 1]?.linkedin)) {
      await page.waitForTimeout(1500);
    }
  }

  // 8. Summary
  const success = results.filter((r) => r.status === 'success').length;
  const noPhoto = results.filter((r) => r.status === 'no_photo').length;
  const withBanner = results.filter((r) => r.banner).length;
  const totalExp = results.reduce((sum, r) => sum + (r.experienceCount || 0), 0);
  const failed = results.filter((r) => !['success', 'no_photo'].includes(r.status)).length;

  console.log('\n--- Summary ---');
  console.log(`  Total:      ${results.length}`);
  console.log(`  Headshots:  ${success}`);
  console.log(`  Banners:    ${withBanner}`);
  console.log(`  Experience: ${totalExp} entries`);
  console.log(`  No photo:   ${noPhoto}`);
  console.log(`  Failed:     ${failed}`);

  if (failed > 0) {
    console.log('\nFailed entries:');
    for (const r of results.filter((r) => !['success', 'no_photo'].includes(r.status))) {
      console.log(`  ${r.name}: ${r.status}`);
    }
  }

  console.log('\nFile naming:');
  for (const r of results) {
    console.log(`  ${r.name} → ${r.slug}.jpg (headshot: ${r.headshot ? 'yes' : 'no'}, banner: ${r.banner ? 'yes' : 'no'})`);
  }

  await context.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
