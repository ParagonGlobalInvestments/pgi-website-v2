/**
 * Sync pods from the "National Directory – Pods" sheet into Supabase.
 *
 * Usage:
 *   1. Export the Pods tab as CSV to data/pods.csv (data/ is gitignored —
 *      never commit rosters; the repo is public).
 *   2. npx tsx scripts/import-pods.ts [path/to/pods.csv]           # dry run
 *   3. npx tsx scripts/import-pods.ts [path/to/pods.csv] --apply   # write
 *
 * When the sheet spells a name differently from `users` (nicknames, middle
 * names), map it in data/pod-aliases.json (optional, also gitignored):
 *   { "Sheet Name": "Name In Users" }
 *
 * The sheet is the source of truth: on --apply, pods and memberships are
 * replaced to match it, and pods missing from the sheet are deleted.
 * People are matched to `users` by name. Names with no (or several) matching
 * users are stored by name only and reported; once the user exists, re-run
 * to link them. Names outside any pod are stored with no pod ("unassigned").
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (.env.local or the environment).
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { nameKey, parsePodSheet, type Seat } from './pod-sheet';

interface MemberRow {
  user_id: string | null;
  name: string | null;
  seat: Seat;
  sort_order: number;
}

dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const csvPath = resolve(
  args.find(a => !a.startsWith('--')) ?? resolve(__dirname, '../data/pods.csv')
);
const aliasPath = resolve(__dirname, '../data/pod-aliases.json');

/** Sheet name → `users` name, keyed by nameKey. */
function loadAliases(): Map<string, string> {
  if (!existsSync(aliasPath)) return new Map();
  const raw = JSON.parse(readFileSync(aliasPath, 'utf-8')) as Record<
    string,
    string
  >;
  return new Map(Object.entries(raw).map(([from, to]) => [nameKey(from), to]));
}

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
  const { pods, unassigned, warnings } = parsePodSheet(
    readFileSync(csvPath, 'utf-8')
  );
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

  const aliases = loadAliases();
  if (aliases.size)
    console.log(`Using ${aliases.size} aliases from ${aliasPath}`);

  const unmatched: string[] = [];
  const ambiguous: string[] = [];

  /** Link to a user when exactly one matches; otherwise keep the name. */
  function toRows(
    people: { name: string; seat: Seat }[],
    where: string
  ): MemberRow[] {
    const seen = new Set<string>();
    return people.flatMap((m, i) => {
      const lookup = aliases.get(nameKey(m.name)) ?? m.name;
      const ids = byName.get(nameKey(lookup)) ?? [];
      if (ids.length === 0) unmatched.push(`${m.name} (${where})`);
      if (ids.length > 1) ambiguous.push(`${m.name} (${where})`);
      const userId = ids.length === 1 ? ids[0] : null;
      const key = userId ?? `name:${nameKey(m.name)}`;
      if (seen.has(key)) return []; // two sheet names → same user
      seen.add(key);
      return [
        {
          user_id: userId,
          name: userId ? null : m.name,
          seat: m.seat,
          sort_order: i,
        },
      ];
    });
  }

  const rows = pods.map(pod => ({
    pod,
    members: toRows(pod.members, `pod ${pod.number}`),
  }));
  const unassignedRows = toRows(
    unassigned.map(name => ({ name, seat: 'analyst' as const })),
    'no pod'
  );

  // ---- Report --------------------------------------------------------------
  const { data: existingPods, error: podsError } = await supabase
    .from('pods')
    .select('id, number');
  if (podsError) throw podsError;
  const sheetNumbers = new Set(pods.map(p => p.number));
  const stalePods = (existingPods ?? []).filter(
    p => !sheetNumbers.has(p.number)
  );

  const linked = (members: MemberRow[]) =>
    `${members.length} people, ${members.filter(m => m.user_id).length} linked to users`;
  for (const { pod, members } of rows) {
    console.log(
      `Pod ${pod.number} (${pod.program}${pod.focus ? `, ${pod.focus}` : ''}): ` +
        linked(members)
    );
  }
  console.log(`Not in a pod: ${linked(unassignedRows)}`);
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
  section('No user with this name — shown by name only', unmatched);
  section('Several users share this name — shown by name only', ambiguous);

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

  // Replace every membership, including people with no pod.
  const { error: clearError } = await supabase
    .from('pod_members')
    .delete()
    .not('id', 'is', null);
  if (clearError) throw clearError;

  const memberRows = [
    ...rows.flatMap(({ pod, members }) =>
      members.map(m => ({ ...m, pod_id: podIds.get(pod.number)! }))
    ),
    ...unassignedRows.map(m => ({ ...m, pod_id: null })),
  ];
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
