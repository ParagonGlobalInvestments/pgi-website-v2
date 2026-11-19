/**
 * Server-side org chart edits. Every function takes the admin client (pods
 * and pod_members are service-role only) and the signed-in editor, checks
 * permissions with org-chart-rules, writes, and records a pod_changes entry.
 *
 * supabase-js has no transactions, so writes are ordered to keep the
 * one-holder-per-lead-seat index satisfied at every step (vacate, then fill).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  POD_FOCUS_MAX_LENGTH,
  POD_SEATS,
  canMove,
  isLeadSeat,
  ledPodIds,
  nextPodNumber,
  podHasSeat,
  seatLabel,
} from '@/lib/org-chart-rules';
import type { PodChange, PodSeat, UserProgram } from '@/types';

export interface Editor {
  /** `users.id`; null for allowlist admins without a user record. */
  userId: string | null;
  name: string;
  isAdmin: boolean;
}

/** An error with the HTTP status the API should answer with. */
export class EditError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

/** A pod_members row as stored, for undo. */
export interface MemberRow {
  id: string;
  pod_id: string | null;
  user_id: string | null;
  name: string | null;
  seat: PodSeat;
  sort_order: number;
}

/**
 * How to reverse an edit: put `restore` rows back as they were and delete
 * the rows in `remove` (rows the edit created).
 */
export interface UndoSnapshot {
  restore: MemberRow[];
  remove: string[];
  /** The edit's log summary, so the undo entry can name it. */
  summary: string;
}

interface StoredRow extends MemberRow {
  person: { name: string } | null;
}

interface PodInfo {
  id: string;
  program: UserProgram;
  number: number;
}

const ROW_COLUMNS = 'id, pod_id, user_id, name, seat, sort_order';
const ROW_WITH_NAME = `${ROW_COLUMNS}, person:users(name)`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function fail(message: string, status: number): never {
  throw new EditError(message, status);
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) {
    // The lead-seat and one-person-per-pod indexes catch concurrent edits.
    if (/duplicate key|unique/i.test(result.error.message)) {
      fail('Someone else just changed this. Refresh and try again.', 409);
    }
    fail(result.error.message, 500);
  }
  return result.data;
}

function toRow(r: StoredRow | MemberRow): MemberRow {
  return {
    id: r.id,
    pod_id: r.pod_id,
    user_id: r.user_id,
    name: r.name,
    seat: r.seat,
    sort_order: r.sort_order,
  };
}

function displayName(r: StoredRow): string {
  return r.person?.name ?? r.name ?? 'Someone';
}

function podLabel(pod: PodInfo | null | undefined): string {
  return pod ? `Pod ${pod.number}` : 'Not in a pod';
}

// ============================================================================
// Reads
// ============================================================================

async function loadPods(db: SupabaseClient): Promise<Map<string, PodInfo>> {
  const data = check(
    await db.from('pods').select('id, program, number')
  ) as PodInfo[];
  return new Map(data.map(p => [p.id, p]));
}

async function getRow(db: SupabaseClient, id: string): Promise<StoredRow> {
  const data = check(
    await db.from('pod_members').select(ROW_WITH_NAME).eq('id', id).limit(1)
  ) as unknown as StoredRow[];
  return data[0] ?? fail('That person is no longer on the roster', 404);
}

/** Every placement of the same person (by user, or by sheet name). */
async function samePerson(
  db: SupabaseClient,
  row: MemberRow
): Promise<StoredRow[]> {
  const query = db.from('pod_members').select(ROW_WITH_NAME);
  const filtered = row.user_id
    ? query.eq('user_id', row.user_id)
    : query.is('user_id', null).eq('name', row.name ?? '');
  return check(await filtered) as unknown as StoredRow[];
}

async function seatHolder(
  db: SupabaseClient,
  podId: string,
  seat: PodSeat
): Promise<StoredRow | null> {
  const data = check(
    await db
      .from('pod_members')
      .select(ROW_WITH_NAME)
      .eq('pod_id', podId)
      .eq('seat', seat)
      .limit(1)
  ) as unknown as StoredRow[];
  return data[0] ?? null;
}

async function nextSortOrder(
  db: SupabaseClient,
  podId: string | null
): Promise<number> {
  const query = db.from('pod_members').select('sort_order');
  const filtered = podId ? query.eq('pod_id', podId) : query.is('pod_id', null);
  const data = check(
    await filtered.order('sort_order', { ascending: false }).limit(1)
  ) as { sort_order: number }[];
  return (data[0]?.sort_order ?? -1) + 1;
}

/** Pods the editor leads, read fresh from the database. */
async function editorLedPods(
  db: SupabaseClient,
  editor: Editor
): Promise<Set<string>> {
  if (!editor.userId) return new Set();
  const data = check(
    await db
      .from('pod_members')
      .select('pod_id, user_id, seat')
      .eq('user_id', editor.userId)
      .not('pod_id', 'is', null)
  ) as { pod_id: string; user_id: string; seat: PodSeat }[];
  return ledPodIds(
    data.map(r => ({ podId: r.pod_id, userId: r.user_id, seat: r.seat })),
    editor.userId
  );
}

function requireAdminEditor(editor: Editor) {
  if (!editor.isAdmin) fail('Only admins can do that', 403);
}

// ============================================================================
// Writes
// ============================================================================

async function updateRow(
  db: SupabaseClient,
  id: string,
  values: Partial<Omit<MemberRow, 'id'>>
) {
  check(await db.from('pod_members').update(values).eq('id', id));
}

async function deleteRows(db: SupabaseClient, ids: string[]) {
  if (ids.length) check(await db.from('pod_members').delete().in('id', ids));
}

async function logChange(
  db: SupabaseClient,
  editor: Editor,
  action: string,
  summary: string,
  details: Record<string, unknown> = {}
) {
  // The edit already happened; a failed log write shouldn't fail it.
  const { error } = await db.from('pod_changes').insert({
    actor_user_id: editor.userId,
    actor_name: editor.name,
    action,
    summary,
    details,
  });
  if (error) console.error('Org chart change log failed:', error.message);
}

/**
 * Take a placement out of its pod: delete it when the person has another
 * placement (so they don't also appear as "Not in a pod"), otherwise keep
 * them on the roster with no pod.
 */
async function vacate(
  db: SupabaseClient,
  row: MemberRow,
  others: MemberRow[]
): Promise<'deleted' | 'unassigned'> {
  if (others.some(o => o.id !== row.id)) {
    await deleteRows(db, [row.id]);
    return 'deleted';
  }
  await updateRow(db, row.id, {
    pod_id: null,
    seat: 'analyst',
    sort_order: await nextSortOrder(db, null),
  });
  return 'unassigned';
}

/**
 * Put `rowId` at `index` in its list (a pod's analysts, or the people not in
 * a pod) and renumber the list 0..n-1. Rows whose sort_order changes are
 * added to `undo` as they were, unless already there. Returns whether
 * anything changed.
 */
async function placeInList(
  db: SupabaseClient,
  podId: string | null,
  rowId: string,
  index: number,
  undo: UndoSnapshot
): Promise<boolean> {
  const query = db.from('pod_members').select(ROW_COLUMNS);
  const scoped = podId
    ? query.eq('pod_id', podId).eq('seat', 'analyst')
    : query.is('pod_id', null);
  const rows = check(
    await scoped.order('sort_order').order('id')
  ) as MemberRow[];

  const moving = rows.find(r => r.id === rowId);
  if (!moving) return false;
  const others = rows.filter(r => r.id !== rowId);
  const at = Math.max(0, Math.min(index, others.length));
  const ordered = [...others.slice(0, at), moving, ...others.slice(at)];

  const changed = ordered.flatMap((r, i) =>
    r.sort_order === i ? [] : [{ ...toRow(r), sort_order: i }]
  );
  if (!changed.length) return false;
  for (const r of changed) {
    if (!undo.restore.some(u => u.id === r.id)) {
      undo.restore.push(toRow(rows.find(x => x.id === r.id)!));
    }
  }
  check(await db.from('pod_members').upsert(changed, { onConflict: 'id' }));
  return true;
}

// ============================================================================
// Members
// ============================================================================

export interface MoveInput {
  memberId: string;
  podId: string | null;
  seat: PodSeat;
  /**
   * Admins only, committee seat only: add a new placement for the person
   * instead of moving this one (ICOMM/QCOMM members sit on several pods).
   */
  copy?: boolean;
  /**
   * Position among the target pod's analysts (or the people not in a pod),
   * counted without the moved person. Defaults to the end. Moving within the
   * same list reorders it.
   */
  index?: number;
}

/**
 * Move a placement to a pod (or out of every pod) and seat. Filling a lead
 * seat displaces its holder: a PM becomes an analyst in the same pod; an
 * ICOMM/QCOMM member leaves the pod.
 */
export async function moveMember(
  db: SupabaseClient,
  editor: Editor,
  input: MoveInput
): Promise<UndoSnapshot | null> {
  if (!isUuid(input.memberId)) fail('Invalid member', 400);
  if (input.podId !== null && !isUuid(input.podId)) fail('Invalid pod', 400);
  if (!POD_SEATS.includes(input.seat)) fail('Invalid seat', 400);
  if (
    input.index !== undefined &&
    !(Number.isInteger(input.index) && input.index >= 0)
  ) {
    fail('Invalid position', 400);
  }

  const podId = input.podId;
  const seat: PodSeat = podId === null ? 'analyst' : input.seat;
  const [row, pods] = await Promise.all([
    getRow(db, input.memberId),
    loadPods(db),
  ]);
  const toPod = podId ? (pods.get(podId) ?? fail('Pod not found', 404)) : null;
  const fromPod = row.pod_id ? pods.get(row.pod_id) : null;

  if (toPod && !podHasSeat(toPod.program, seat)) {
    fail('Systematic pods have no Pod Leader seat', 400);
  }

  if (!editor.isAdmin) {
    const led = await editorLedPods(db, editor);
    const allowed = canMove(
      editor,
      led,
      { podId: row.pod_id, seat: row.seat },
      { podId, seat }
    );
    if (!allowed || input.copy) {
      fail(
        'Pod leaders can only move analysts between their pod and "Not in a pod yet"',
        403
      );
    }
  }

  const copy =
    !!input.copy &&
    seat === 'committee' &&
    row.pod_id !== null &&
    row.pod_id !== podId;
  if (input.copy && seat !== 'committee') {
    fail('Only ICOMM/QCOMM seats can be shared across pods', 400);
  }

  const name = displayName(row);

  // Reordering within one list.
  const sameList =
    !copy &&
    row.pod_id === podId &&
    (podId === null || (row.seat === 'analyst' && seat === 'analyst'));
  if (sameList) {
    if (input.index === undefined) return null;
    const undo: UndoSnapshot = { restore: [], remove: [], summary: '' };
    if (!(await placeInList(db, podId, row.id, input.index, undo))) {
      return null;
    }
    const where = toPod ? podLabel(toPod) : '"Not in a pod yet"';
    undo.summary = `Moved ${name} to #${input.index + 1} in ${where}`;
    await logChange(db, editor, 'move', undo.summary, {
      memberId: row.id,
      podId,
      index: input.index,
      reorder: true,
    });
    return undo;
  }

  // Already in that lead seat.
  if (!copy && row.pod_id === podId && row.seat === seat) return null;

  const placements = await samePerson(db, row);
  if (podId && placements.some(p => p.id !== row.id && p.pod_id === podId)) {
    fail(`${name} is already in ${podLabel(toPod)}`, 409);
  }

  const undo: UndoSnapshot = { restore: [], remove: [], summary: '' };

  // Vacate the lead seat first so the unique seat index never trips.
  let displaced: StoredRow | null = null;
  if (podId && isLeadSeat(seat)) {
    const holder = await seatHolder(db, podId, seat);
    if (holder && holder.id !== row.id) {
      displaced = holder;
      undo.restore.push(toRow(holder));
      if (seat === 'pm') {
        await updateRow(db, holder.id, { seat: 'analyst' });
      } else {
        await vacate(db, holder, await samePerson(db, holder));
      }
    }
  }

  if (copy) {
    const created = check(
      await db
        .from('pod_members')
        .insert({
          pod_id: podId,
          user_id: row.user_id,
          name: row.user_id ? null : row.name,
          seat,
          sort_order: await nextSortOrder(db, podId),
        })
        .select('id')
        .single()
    ) as { id: string };
    undo.remove.push(created.id);
  } else {
    undo.restore.push(toRow(row));
    let inList = !isLeadSeat(seat);
    if (podId === null) {
      inList = (await vacate(db, row, placements)) === 'unassigned';
    } else {
      await updateRow(db, row.id, {
        pod_id: podId,
        seat,
        sort_order:
          row.pod_id === podId
            ? row.sort_order
            : await nextSortOrder(db, podId),
      });
    }
    if (inList && input.index !== undefined) {
      await placeInList(db, podId, row.id, input.index, undo);
    }
  }

  const program = toPod?.program ?? 'value';
  let summary: string;
  if (toPod && isLeadSeat(seat)) {
    summary = `${copy ? 'Added' : 'Made'} ${name} ${seatLabel(seat, program)} of ${podLabel(toPod)}`;
    if (displaced) summary += `, replacing ${displayName(displaced)}`;
  } else if (row.pod_id === podId) {
    summary = `Moved ${name} to Analyst in ${podLabel(toPod)}`;
  } else {
    summary = `Moved ${name} from ${podLabel(fromPod)} to ${podLabel(toPod)}`;
  }
  undo.summary = summary;

  await logChange(db, editor, 'move', summary, {
    memberId: row.id,
    from: { podId: row.pod_id, seat: row.seat },
    to: { podId, seat },
    copy,
    displacedId: displaced?.id ?? null,
  });
  return undo;
}

/** Add an existing member (not yet on the roster) as an analyst. */
export async function addMember(
  db: SupabaseClient,
  editor: Editor,
  input: { userId: string; podId: string | null }
): Promise<UndoSnapshot> {
  requireAdminEditor(editor);
  if (!isUuid(input.userId)) fail('Invalid user', 400);
  if (input.podId !== null && !isUuid(input.podId)) fail('Invalid pod', 400);

  const [users, existing, pods] = await Promise.all([
    db.from('users').select('id, name, status').eq('id', input.userId).limit(1),
    db.from('pod_members').select('id').eq('user_id', input.userId).limit(1),
    loadPods(db),
  ]);
  const user = (
    check(users) as { id: string; name: string; status: string }[]
  )[0];
  if (!user || user.status !== 'active') fail('Member not found', 404);
  if ((check(existing) as unknown[]).length) {
    fail(`${user.name} is already on the org chart`, 409);
  }
  const pod = input.podId
    ? (pods.get(input.podId) ?? fail('Pod not found', 404))
    : null;

  const created = check(
    await db
      .from('pod_members')
      .insert({
        pod_id: input.podId,
        user_id: user.id,
        seat: 'analyst',
        sort_order: await nextSortOrder(db, input.podId),
      })
      .select('id')
      .single()
  ) as { id: string };

  const summary = pod
    ? `Added ${user.name} to ${podLabel(pod)}`
    : `Added ${user.name} to the roster`;
  await logChange(db, editor, 'add_member', summary, {
    memberId: created.id,
    userId: user.id,
    podId: input.podId,
  });
  return { restore: [], remove: [created.id], summary };
}

function parseRow(value: unknown): MemberRow {
  const r = value as Partial<MemberRow> | null;
  if (
    !r ||
    !isUuid(r.id) ||
    !(r.pod_id === null || isUuid(r.pod_id)) ||
    !(r.user_id === null || isUuid(r.user_id)) ||
    !(r.name === null || typeof r.name === 'string') ||
    (r.user_id === null && !r.name) ||
    !POD_SEATS.includes(r.seat as PodSeat) ||
    typeof r.sort_order !== 'number'
  ) {
    fail('Invalid undo data', 400);
  }
  return toRow(r as MemberRow);
}

/** Reverse an edit from the snapshot moveMember / addMember returned. */
export async function undoChange(
  db: SupabaseClient,
  editor: Editor,
  input: { restore?: unknown; remove?: unknown; summary?: unknown }
): Promise<void> {
  if (!Array.isArray(input.restore) || !Array.isArray(input.remove)) {
    fail('Invalid undo data', 400);
  }
  const remove = input.remove.map(id =>
    isUuid(id) ? id : fail('Invalid undo data', 400)
  );
  const parsed = input.restore.map(parseRow);

  // Rows that still exist keep who they belong to; undo only restores where
  // they sit. (The snapshot comes from the client.)
  const ids = parsed.map(r => r.id);
  const current = new Map(
    (
      (ids.length
        ? check(await db.from('pod_members').select(ROW_COLUMNS).in('id', ids))
        : []) as MemberRow[]
    ).map(r => [r.id, r])
  );
  const restore = parsed.map(r => {
    const now = current.get(r.id);
    return now ? { ...r, user_id: now.user_id, name: now.name } : r;
  });

  if (!editor.isAdmin) {
    // Leaders only ever move analysts in and out of their own pods, so their
    // undos only do that too. They never create rows, so never remove any.
    const led = await editorLedPods(db, editor);
    const mine = (podId: string | null) => podId === null || led.has(podId);
    if (remove.length) fail('Only admins can undo that', 403);
    for (const target of restore) {
      const now = current.get(target.id);
      const ok =
        mine(target.pod_id) &&
        (target.pod_id === null || target.seat === 'analyst') &&
        (now
          ? mine(now.pod_id) && (now.pod_id === null || now.seat === 'analyst')
          : // Re-creating a deleted placement: the person must still be on
            // the roster (that's when a move out of a pod deletes a row).
            (await samePerson(db, target)).length > 0);
      if (!ok) fail('Only admins can undo that', 403);
    }
  }

  await deleteRows(db, remove);
  // Put rows back without lead seats first, then fill the seats, so the
  // one-holder-per-seat index never sees two holders.
  if (restore.length) {
    check(
      await db.from('pod_members').upsert(
        restore.map(r => ({
          ...r,
          seat: isLeadSeat(r.seat) ? 'analyst' : r.seat,
        })),
        { onConflict: 'id' }
      )
    );
  }
  for (const r of restore.filter(r => isLeadSeat(r.seat) && r.pod_id)) {
    await updateRow(db, r.id, { seat: r.seat });
  }

  const what =
    typeof input.summary === 'string' && input.summary
      ? `: ${input.summary.slice(0, 300)}`
      : '';
  await logChange(db, editor, 'undo', `Undid a change${what}`, {
    restored: restore.map(r => r.id),
    removed: remove,
  });
}

// ============================================================================
// Pods
// ============================================================================

function parseFocus(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') fail('Invalid focus', 400);
  const focus = value.trim();
  if (focus.length > POD_FOCUS_MAX_LENGTH) {
    fail(`Focus must be ${POD_FOCUS_MAX_LENGTH} characters or fewer`, 400);
  }
  return focus || null;
}

export async function createPod(
  db: SupabaseClient,
  editor: Editor,
  input: { program?: unknown; focus?: unknown }
): Promise<void> {
  requireAdminEditor(editor);
  if (input.program !== 'value' && input.program !== 'quant') {
    fail('Invalid program', 400);
  }
  const program = input.program;
  const focus = parseFocus(input.focus);
  const pods = Array.from((await loadPods(db)).values());
  const number = nextPodNumber(pods, program);

  const created = check(
    await db
      .from('pods')
      .insert({ program, number, focus, sort_order: number })
      .select('id')
      .single()
  ) as { id: string };

  const side = program === 'value' ? 'Value' : 'Systematic';
  await logChange(
    db,
    editor,
    'create_pod',
    `Created ${side} Pod ${number}${focus ? ` (${focus})` : ''}`,
    { podId: created.id, program, number, focus }
  );
}

export async function updatePod(
  db: SupabaseClient,
  editor: Editor,
  podId: string,
  input: { focus?: unknown }
): Promise<void> {
  requireAdminEditor(editor);
  if (!isUuid(podId)) fail('Invalid pod', 400);
  const pod = (await loadPods(db)).get(podId) ?? fail('Pod not found', 404);
  const focus = parseFocus(input.focus);

  const before = check(
    await db.from('pods').select('focus').eq('id', podId).single()
  ) as { focus: string | null };
  if (before.focus === focus) return;

  check(await db.from('pods').update({ focus }).eq('id', podId));
  await logChange(
    db,
    editor,
    'update_pod',
    focus
      ? `Set ${podLabel(pod)} focus to "${focus}"`
      : `Cleared ${podLabel(pod)} focus`,
    { podId, from: before.focus, to: focus }
  );
}

/** Delete a pod; its people move to "Not in a pod yet". */
export async function deletePod(
  db: SupabaseClient,
  editor: Editor,
  podId: string
): Promise<void> {
  requireAdminEditor(editor);
  if (!isUuid(podId)) fail('Invalid pod', 400);
  const pod = (await loadPods(db)).get(podId) ?? fail('Pod not found', 404);

  const rows = check(
    await db.from('pod_members').select(ROW_WITH_NAME).eq('pod_id', podId)
  ) as unknown as StoredRow[];

  // pod_members cascades on pod delete, so move people out first.
  for (const row of rows) {
    const elsewhere = (await samePerson(db, row)).filter(
      p => p.pod_id !== podId
    );
    await vacate(db, row, elsewhere);
  }
  check(await db.from('pods').delete().eq('id', podId));

  const n = rows.length;
  await logChange(
    db,
    editor,
    'delete_pod',
    `Deleted ${podLabel(pod)}` +
      (n ? ` (${n} ${n === 1 ? 'person' : 'people'} moved out)` : ''),
    { podId, number: pod.number, program: pod.program }
  );
}

// ============================================================================
// Admin reads
// ============================================================================

/** Active members not on the roster yet whose name matches `q`. */
export async function searchCandidates(
  db: SupabaseClient,
  editor: Editor,
  q: string
): Promise<{ id: string; name: string; school: string | null }[]> {
  requireAdminEditor(editor);
  const term = q.trim().replace(/[%_\\]/g, m => `\\${m}`);
  if (term.length < 2) return [];

  const [users, roster] = await Promise.all([
    db
      .from('users')
      .select('id, name, school')
      .eq('status', 'active')
      .ilike('name', `%${term}%`)
      .order('name')
      .limit(40),
    db.from('pod_members').select('user_id').not('user_id', 'is', null),
  ]);
  const onRoster = new Set(
    (check(roster) as { user_id: string }[]).map(r => r.user_id)
  );
  return (check(users) as { id: string; name: string; school: string | null }[])
    .filter(u => !onRoster.has(u.id))
    .slice(0, 20);
}

export async function listChanges(
  db: SupabaseClient,
  editor: Editor
): Promise<PodChange[]> {
  requireAdminEditor(editor);
  const data = check(
    await db
      .from('pod_changes')
      .select('id, actor_name, action, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
  ) as {
    id: string;
    actor_name: string;
    action: string;
    summary: string;
    created_at: string;
  }[];
  return data.map(c => ({
    id: c.id,
    actorName: c.actor_name,
    action: c.action,
    summary: c.summary,
    createdAt: c.created_at,
  }));
}
