/**
 * Server-side org chart edits. Every function takes the admin client (pods
 * and pod_members are service-role only) and the signed-in editor.
 *
 * Roster edits (move, add, undo, delete pod) run as Postgres functions from
 * migration 021: each is one transaction under an org-chart-wide lock, with
 * permissions checked inside it against current data, and undo held
 * server-side in pod_changes. This module validates input, calls them, and
 * maps their errors (PostgREST PTxxx codes) to HTTP statuses.
 *
 * Pod create and focus edits are single statements and stay here.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  POD_FOCUS_MAX_LENGTH,
  POD_SEATS,
  nextPodNumber,
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

/**
 * A change that can be undone: the client sends `changeId` back to
 * /api/org-chart/undo. What to restore is stored server-side.
 */
export interface UndoRef {
  changeId: string;
  summary: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function fail(message: string, status: number): never {
  throw new EditError(message, status);
}

/** A uuid in canonical (lowercase) form, or a 400. */
function uuid(value: unknown, what: string): string {
  return isUuid(value) ? value.toLowerCase() : fail(`Invalid ${what}`, 400);
}

function optionalUuid(value: unknown, what: string): string | null {
  return value === null || value === undefined ? null : uuid(value, what);
}

interface DbError {
  code?: string;
  message: string;
}

function toEditError(error: DbError): never {
  const status = /^PT(\d{3})$/.exec(error.code ?? '')?.[1];
  if (status) fail(error.message, Number(status));
  // Lead-seat, one-placement-per-pod and one-unassigned-row indexes.
  if (error.code === '23505') {
    fail('Someone else just changed this. Refresh and try again.', 409);
  }
  if (error.code === '22P02') fail('Invalid request', 400);
  fail(error.message, 500);
}

function check<T>(result: { data: T; error: DbError | null }): T {
  if (result.error) toEditError(result.error);
  return result.data;
}

/** Call an org_chart_* function as the editor. */
async function call<T>(
  db: SupabaseClient,
  editor: Editor,
  fn: string,
  args: Record<string, unknown>
): Promise<T> {
  return check(
    await db.rpc(fn, {
      p_actor: editor.userId,
      p_actor_name: editor.name,
      p_is_admin: editor.isAdmin,
      ...args,
    })
  ) as T;
}

function requireAdminEditor(editor: Editor) {
  if (!editor.isAdmin) fail('Only admins can do that', 403);
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

// ============================================================================
// Roster edits (database functions)
// ============================================================================

export interface MoveInput {
  memberId: unknown;
  podId: unknown;
  seat: unknown;
  /**
   * Admins only, committee seat only: add a new placement for the person
   * instead of moving this one (ICOMM/QCOMM members sit on several pods).
   */
  copy?: unknown;
  /**
   * Position among the target pod's analysts (or the people not in a pod),
   * counted without the moved person. Defaults to the end. Moving within the
   * same list reorders it.
   */
  index?: unknown;
}

/**
 * Move a placement to a pod (or out of every pod) and seat. Filling a lead
 * seat displaces its holder: a PM becomes an analyst in the same pod; an
 * ICOMM/QCOMM member leaves the pod. Returns null when nothing changed.
 */
export async function moveMember(
  db: SupabaseClient,
  editor: Editor,
  input: MoveInput
): Promise<UndoRef | null> {
  if (!POD_SEATS.includes(input.seat as PodSeat)) fail('Invalid seat', 400);
  const index = input.index ?? null;
  if (index !== null && !(Number.isInteger(index) && (index as number) >= 0)) {
    fail('Invalid position', 400);
  }
  return call<UndoRef | null>(db, editor, 'org_chart_move', {
    p_member: uuid(input.memberId, 'member'),
    p_pod: optionalUuid(input.podId, 'pod'),
    p_seat: input.seat,
    p_copy: input.copy === true,
    p_index: index,
  });
}

/** Admins: add an active member who isn't on the roster, as an analyst. */
export async function addMember(
  db: SupabaseClient,
  editor: Editor,
  input: { userId: unknown; podId: unknown }
): Promise<UndoRef> {
  requireAdminEditor(editor);
  return call<UndoRef>(db, editor, 'org_chart_add_member', {
    p_user: uuid(input.userId, 'user'),
    p_pod: optionalUuid(input.podId, 'pod'),
  });
}

/**
 * Undo an edit by its change id. The database checks it was this editor's
 * (or that they're an admin), that it isn't already undone, and that the
 * people it touched haven't changed since.
 */
export async function undoChange(
  db: SupabaseClient,
  editor: Editor,
  input: { changeId?: unknown }
): Promise<void> {
  await call(db, editor, 'org_chart_undo', {
    p_change: uuid(input.changeId, 'change'),
  });
}

/** Admins: delete a pod; its people move to "Not in a pod yet". */
export async function deletePod(
  db: SupabaseClient,
  editor: Editor,
  podId: string
): Promise<void> {
  requireAdminEditor(editor);
  await call(db, editor, 'org_chart_delete_pod', {
    p_pod: uuid(podId, 'pod'),
  });
}

// ============================================================================
// Pods
// ============================================================================

function parseFocus(value: unknown): string | null {
  if (value === null) return null;
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
  const program: UserProgram = input.program;
  const focus = input.focus === undefined ? null : parseFocus(input.focus);
  const pods = check(await db.from('pods').select('program, number')) as {
    program: UserProgram;
    number: number;
  }[];
  // A concurrent create can take the same number; the unique index turns
  // that into a 409.
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
  const id = uuid(podId, 'pod');
  // Require the field, so an empty or malformed body can't clear the focus.
  if (!('focus' in input)) fail('focus is required', 400);
  const focus = parseFocus(input.focus);

  const before = (
    check(
      await db.from('pods').select('number, focus').eq('id', id).limit(1)
    ) as { number: number; focus: string | null }[]
  )[0];
  if (!before) fail('Pod not found', 404);
  if (before.focus === focus) return;

  check(await db.from('pods').update({ focus }).eq('id', id));
  await logChange(
    db,
    editor,
    'update_pod',
    focus
      ? `Set Pod ${before.number} focus to "${focus}"`
      : `Cleared Pod ${before.number} focus`,
    { podId: id, from: before.focus, to: focus }
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
