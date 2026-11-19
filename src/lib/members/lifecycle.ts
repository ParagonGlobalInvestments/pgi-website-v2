/**
 * Member lifecycle — the states a person can be in, spread across the
 * `users.status`, `users.supabase_id`, `users.email` and
 * `users.alternate_emails` columns plus the `ADMIN_EMAILS` allowlist.
 *
 * Two independent axes describe a `users` row:
 *
 * - status: `active` ⇄ `alumni`. Rows enter `active`, or `alumni` when an
 *   admin creates a person directly as alumni (`/api/admin/people`). Edges:
 *     active → alumni  graduation (`/api/admin/graduation`), guarded in SQL
 *                      by `status = 'active'` and the graduated class year.
 *     either way       manual override (`PATCH /api/users/[id]/status`):
 *                      an admin sets `active` or `alumni` with no direction
 *                      guard, e.g. to undo a mistaken graduation.
 * - access: whether the row can sign in.
 *     noLogin   — no supabase_id and no email that sign-in can match (e.g.
 *                 alumni imported by migration 016). Leaves only when someone
 *                 adds an email in the database.
 *     claimable — no supabase_id yet, but an email / alternate email that
 *                 `checkMembership()` can match on first Google sign-in.
 *                 The lookup exact-matches the trimmed, lowercased sign-in
 *                 email, so a stored address only counts if it is already
 *                 trimmed and lowercase.
 *     linked    — supabase_id is set by `checkMembership()` on sign-in.
 *   Edges: noLogin → claimable (email added in the database);
 *   claimable → linked (first sign-in); linked → linked (re-link: when the
 *   supabase_id lookup misses but the email matches, e.g. signing in with a
 *   different Google account that has the same address, `checkMembership()`
 *   overwrites supabase_id with the new auth user's id).
 *
 * Someone with no row is either an allowlist admin (`ADMIN_EMAILS`, given a
 * synthetic user with id `ADMIN_ALLOWLIST_USER_ID`) or not a member.
 */

import type { UserStatus } from '@/types';

// ---------------------------------------------------------------------------
// Allowlist admin placeholder
// ---------------------------------------------------------------------------

/**
 * Id of the synthetic user returned for `ADMIN_EMAILS` admins who have no
 * `users` row. It is not a database id, so never query by it.
 */
export const ADMIN_ALLOWLIST_USER_ID = 'admin-allowlist';

export function isAdminAllowlistUserId(id: string | null | undefined): boolean {
  return id === ADMIN_ALLOWLIST_USER_ID;
}

// ---------------------------------------------------------------------------
// Status axis: active ⇄ alumni
// ---------------------------------------------------------------------------

/**
 * Allowed status edges. `alumni → active` exists only through the manual
 * override route; graduation is the only automatic edge.
 */
export const MEMBER_STATUS_TRANSITIONS = {
  active: ['alumni'],
  alumni: ['active'],
} as const satisfies Record<UserStatus, readonly UserStatus[]>;

export function canTransitionStatus(from: UserStatus, to: UserStatus): boolean {
  return (MEMBER_STATUS_TRANSITIONS[from] as readonly UserStatus[]).includes(
    to
  );
}

/**
 * The graduation edge. Routes should use `from` in their SQL filter so the
 * database does the atomic check (`.eq('status', GRADUATION_TRANSITION.from)`).
 */
export const GRADUATION_TRANSITION = {
  from: 'active',
  to: 'alumni',
} as const satisfies { from: UserStatus; to: UserStatus };

/**
 * Normalize a raw `users.status` value. The column is CHECK-constrained to
 * `active | alumni`; anything else (or a missing value) is treated as active,
 * matching `formatUser()`.
 */
export function parseMemberStatus(raw: string | null | undefined): UserStatus {
  return raw === 'alumni' ? 'alumni' : 'active';
}

/**
 * Active members must have a chapter school. Alumni may have none, or one
 * outside the chapters (stored as a slug on the user, raw on the source row).
 */
export function requiresChapterSchool(status: UserStatus): boolean {
  return status === 'active';
}

// ---------------------------------------------------------------------------
// Access axis: noLogin → claimable → linked
// ---------------------------------------------------------------------------

export type MemberAccess = 'noLogin' | 'claimable' | 'linked';

/** The columns that decide a row's lifecycle. */
export interface MemberLifecycleRow {
  status: string | null;
  supabase_id: string | null;
  email: string | null;
  alternate_emails?: string[] | null;
}

/**
 * Whether sign-in could ever match this stored address. `checkMembership()`
 * trims and lowercases the sign-in email and the lookup is an exact match.
 */
function isMatchableEmail(email: string | null | undefined): boolean {
  return !!email && email === email.trim().toLowerCase();
}

export function getMemberAccess(row: MemberLifecycleRow): MemberAccess {
  if (row.supabase_id) return 'linked';
  const hasEmail =
    isMatchableEmail(row.email) ||
    (row.alternate_emails ?? []).some(isMatchableEmail);
  return hasEmail ? 'claimable' : 'noLogin';
}

// ---------------------------------------------------------------------------
// Combined lifecycle
// ---------------------------------------------------------------------------

export type MemberLifecycle =
  | { kind: 'nonMember' }
  | { kind: 'allowlistAdmin' }
  | { kind: 'active'; access: MemberAccess }
  | { kind: 'alumni'; access: MemberAccess };

/**
 * Classify a person. A `users` row wins over the allowlist, matching the
 * lookup order in `checkMembership()`.
 */
export function getMemberLifecycle(
  row: MemberLifecycleRow | null,
  options: { isAdminAllowlist?: boolean } = {}
): MemberLifecycle {
  if (row) {
    return {
      kind: parseMemberStatus(row.status),
      access: getMemberAccess(row),
    };
  }
  return options.isAdminAllowlist
    ? { kind: 'allowlistAdmin' }
    : { kind: 'nonMember' };
}
