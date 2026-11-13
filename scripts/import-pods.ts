/**
 * Sync pods from the "National Directory – Pods" sheet into Supabase.
 *
 * Usage:
 *   1. Export the Pods tab as CSV to data/pods.csv (data/ is gitignored —
 *      never commit rosters; the repo is public).
 *   2. npx tsx scripts/import-pods.ts [path/to/pods.csv]           # dry run
 *   3. npx tsx scripts/import-pods.ts [path/to/pods.csv] --apply   # write
 *
 * The sheet is the source of truth: on --apply, pods and memberships are
 * replaced to match it, and pods missing from the sheet are deleted.
 * People are matched to `users` by name; unmatched names are skipped and
 * reported so they can be fixed (add/rename the user, then re-run).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (.env.local or the environment).
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { nameKey, parsePodSheet } from './pod-sheet';

dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const csvPath = resolve(
  args.find(a => !a.startsWith('--')) ?? resolve(__dirname, '../data/pods.csv')
);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local)'
    );
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ---- Parse ---------------------------------------------------------------
  console.log(`Reading ${csvPath}`);
  const { pods, warnings } = parsePodSheet(readFileSync(csvPath, 'utf-8'));
  if (pods.length === 0) throw new Error('No pods found in the sheet');

  // ---- Match names to users -----------------------------------------------
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name');
  if (usersError) throw usersError;

  const byName = new Map<string, string[]>();
  for (const u of users ?? []) {
    if (!u.name) continue;
    const k = nameKey(u.name);
    byName.set(k, [...(byName.get(k) ?? []), u.id]);
  }

  const unmatched: string[] = [];
  const ambiguous: string[] = [];
  const rows = pods.map(pod => ({
    pod,
    members: pod.members.flatMap((m, i) => {
      const ids = byName.get(nameKey(m.name)) ?? [];
      if (ids.length === 0) unmatched.push(`${m.name} (pod ${pod.number})`);
      if (ids.length > 1) ambiguous.push(`${m.name} (pod ${pod.number})`);
      if (ids.length !== 1) return [];
      return [
        { user_id: ids[0], seat: m.seat, is_new: m.isNew, sort_order: i },
      ];
    }),
  }));

  // ---- Report --------------------------------------------------------------
  const { data: existingPods, error: podsError } = await supabase
    .from('pods')
    .select('id, number');
  if (podsError) throw podsError;
  const sheetNumbers = new Set(pods.map(p => p.number));
  const stalePods = (existingPods ?? []).filter(
    p => !sheetNumbers.has(p.number)
  );

  for (const { pod, members } of rows) {
    console.log(
      `Pod ${pod.number} (${pod.program}${pod.focus ? `, ${pod.focus}` : ''}): ` +
        `${members.length}/${pod.members.length} matched`
    );
  }
  if (stalePods.length) {
    console.log(
      `Pods not in sheet (will be deleted): ${stalePods.map(p => p.number).join(', ')}`
    );
  }
  const section = (title: string, items: string[]) => {
    if (!items.length) return;
    console.log(`\n${title} (${items.length}):`);
    for (const item of items) console.log(`  - ${item}`);
  };
  section('Sheet notes', warnings);
  section('No user with this name — skipped', unmatched);
  section('Several users share this name — skipped', ambiguous);

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write.');
    return;
  }

  // ---- Write ---------------------------------------------------------------
  // Not transactional: if a step fails, fix the cause and re-run (idempotent).
  const { data: upserted, error: upsertError } = await supabase
    .from('pods')
    .upsert(
      pods.map(p => ({
        number: p.number,
        program: p.program,
        focus: p.focus,
        sort_order: p.number,
      })),
      { onConflict: 'number' }
    )
    .select('id, number');
  if (upsertError) throw upsertError;
  const podIds = new Map((upserted ?? []).map(p => [p.number, p.id]));

  if (stalePods.length) {
    const { error } = await supabase
      .from('pods')
      .delete()
      .in(
        'id',
        stalePods.map(p => p.id)
      );
    if (error) throw error;
  }

  const ids = Array.from(podIds.values());
  const { error: clearError } = await supabase
    .from('pod_members')
    .delete()
    .in('pod_id', ids);
  if (clearError) throw clearError;

  const memberRows = rows.flatMap(({ pod, members }) =>
    members.map(m => ({ ...m, pod_id: podIds.get(pod.number)! }))
  );
  const { error: insertError } = await supabase
    .from('pod_members')
    .insert(memberRows);
  if (insertError) throw insertError;

  console.log(
    `\nWrote ${podIds.size} pods and ${memberRows.length} members` +
      (stalePods.length ? `; deleted ${stalePods.length} old pods` : '')
  );
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
