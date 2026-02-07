import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/** Extract LinkedIn username from full URL */
function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1].replace(/\/$/, '') : null;
}

/** Small delay between requests to avoid rate limiting */
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Admin-only: batch-fetch LinkedIn headshots for all cms_people
 * who have a linkedin URL but no headshot_url yet.
 *
 * POST /api/cms/people/fetch-headshots
 *
 * Fetches photos via unavatar.io, uploads to Supabase Storage,
 * and updates headshot_url in the database.
 */
export async function POST() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const supabase = requireSupabaseAdminClient();

  // Get all people with LinkedIn but no headshot
  const { data: people, error: queryError } = await supabase
    .from('cms_people')
    .select('id, name, linkedin')
    .not('linkedin', 'is', null)
    .is('headshot_url', null);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  if (!people || people.length === 0) {
    return NextResponse.json({
      message: 'No people need headshot fetching',
      results: [],
    });
  }

  const results: {
    id: string;
    name: string;
    status: 'success' | 'skipped' | 'failed';
    reason?: string;
  }[] = [];

  for (const person of people) {
    const username = extractLinkedInUsername(person.linkedin);
    if (!username) {
      results.push({
        id: person.id,
        name: person.name,
        status: 'skipped',
        reason: 'Could not extract LinkedIn username',
      });
      continue;
    }

    try {
      // Fetch photo from unavatar.io
      const imgResponse = await fetch(
        `https://unavatar.io/linkedin/${username}`,
        { redirect: 'follow' }
      );

      if (!imgResponse.ok) {
        results.push({
          id: person.id,
          name: person.name,
          status: 'failed',
          reason: `unavatar returned ${imgResponse.status}`,
        });
        await delay(500);
        continue;
      }

      const contentType =
        imgResponse.headers.get('content-type') || 'image/jpeg';

      // Check if we got an actual image (unavatar returns a default avatar for unknowns)
      const imgBuffer = await imgResponse.arrayBuffer();
      if (imgBuffer.byteLength < 1000) {
        results.push({
          id: person.id,
          name: person.name,
          status: 'failed',
          reason: 'Image too small (likely default placeholder)',
        });
        await delay(500);
        continue;
      }

      // Upload to Supabase Storage
      const ext = contentType.includes('png') ? 'png' : 'jpg';
      const filePath = `headshots/${person.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-assets')
        .upload(filePath, imgBuffer, {
          contentType,
          upsert: true, // overwrite if re-run
        });

      if (uploadError) {
        results.push({
          id: person.id,
          name: person.name,
          status: 'failed',
          reason: uploadError.message,
        });
        await delay(500);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cms-assets')
        .getPublicUrl(filePath);

      // Update the person record
      const { error: updateError } = await supabase
        .from('cms_people')
        .update({ headshot_url: urlData.publicUrl })
        .eq('id', person.id);

      if (updateError) {
        results.push({
          id: person.id,
          name: person.name,
          status: 'failed',
          reason: updateError.message,
        });
      } else {
        results.push({
          id: person.id,
          name: person.name,
          status: 'success',
        });
      }
    } catch (err) {
      results.push({
        id: person.id,
        name: person.name,
        status: 'failed',
        reason: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Rate limit: 500ms between requests
    await delay(500);
  }

  const summary = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
  };

  return NextResponse.json({ summary, results });
}
