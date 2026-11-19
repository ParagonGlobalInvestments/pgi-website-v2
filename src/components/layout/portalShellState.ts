/**
 * Portal shell state (pure).
 *
 * The shell persists across /portal/login → /portal navigations (one shared
 * layout), so its server-provided initial mode goes stale and it has to
 * remember that a login morph finished:
 *
 *   login ──MORPH_COMPLETED──▶ dashboard(entrance: 'morph')
 *                                  │ ENTRANCE_SETTLED
 *                                  ▼
 *   login ◀──SIGNED_OUT─── dashboard(entrance: 'none')
 */

import type { User as AuthUser } from '@supabase/supabase-js';

export type ShellState =
  | { mode: 'login' }
  /** entrance 'morph': the sidebar is still playing its post-login entrance */
  | { mode: 'dashboard'; entrance: 'morph' | 'none' };

export type ShellEvent =
  | { type: 'MORPH_COMPLETED' }
  | { type: 'ENTRANCE_SETTLED' }
  | { type: 'SIGNED_OUT' };

export function initialShellState(mode: 'login' | 'dashboard'): ShellState {
  return mode === 'login' ? { mode } : { mode, entrance: 'none' };
}

export function shellReducer(state: ShellState, event: ShellEvent): ShellState {
  switch (event.type) {
    case 'MORPH_COMPLETED':
      return state.mode === 'login'
        ? { mode: 'dashboard', entrance: 'morph' }
        : state;
    case 'ENTRANCE_SETTLED':
      return state.mode === 'dashboard' && state.entrance === 'morph'
        ? { mode: 'dashboard', entrance: 'none' }
        : state;
    case 'SIGNED_OUT':
      return state.mode === 'dashboard' ? { mode: 'login' } : state;
    default:
      return state;
  }
}

/** Client-side Supabase session as the shell sees it */
export type ShellAuth =
  | { status: 'loading' }
  | { status: 'signedIn'; user: AuthUser }
  | { status: 'signedOut' };

export function shellAuthFrom(user: AuthUser | null | undefined): ShellAuth {
  return user ? { status: 'signedIn', user } : { status: 'signedOut' };
}

/**
 * Level-triggered sign-out: true whenever the dashboard is showing without a
 * session, including when a morph completes after the session already ended.
 */
export function needsSignOut(state: ShellState, auth: ShellAuth): boolean {
  return state.mode === 'dashboard' && auth.status === 'signedOut';
}
