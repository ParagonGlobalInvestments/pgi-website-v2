/**
 * Login page state machine (pure).
 *
 * The OAuth callback reports its outcome through URL params; the page parses
 * them once into a LoginState, then moves between states on explicit events.
 * The greeting/morph after a successful sign-in belong to the portal
 * transition machine, not to this one.
 *
 *   welcome  ──OAUTH_STARTED──▶ redirecting(from) ──(browser leaves for Google)
 *   rejected ──OAUTH_STARTED──▶      │ OAUTH_FAILED / PAGE_RESTORED
 *      ▲                              └──▶ back to `from` (welcome | rejected)
 *      │ POST_AUTH_FAILED (→ welcome)
 *   postAuth ──(start login:morph)──▶ transition machine
 */

import type {
  MachineTag,
  TransitionFlow,
} from '@/lib/portal-transitions/types';

export type LoginErrorSource =
  /** Reported by /auth/callback via `?error=` */
  | 'callback'
  /** Raised on this page (OAuth start or post-auth step failed) */
  | 'client';

export interface LoginError {
  source: LoginErrorSource;
  message: string;
}

/** Which sign-in screen is showing (heading, explanation) */
export type LoginScreen = 'welcome' | 'rejected';

export type LoginState =
  /** Sign-in screen, optionally showing the latest error */
  | { kind: 'welcome'; error: LoginError | null }
  /** Signed in with Google but not a PGI member */
  | { kind: 'rejected'; error: LoginError | null }
  /** OAuth started from `from`; the browser is leaving for Google */
  | { kind: 'redirecting'; from: LoginScreen }
  /** Back from OAuth as a member; loading the user before the greeting */
  | { kind: 'postAuth' };

export type LoginEvent =
  /** The URL hash after mount (Supabase puts some OAuth errors there) */
  | { type: 'URL_HASH'; hash: string }
  | { type: 'OAUTH_STARTED' }
  | { type: 'OAUTH_FAILED' }
  | { type: 'POST_AUTH_FAILED' }
  /** Page restored from the back/forward cache */
  | { type: 'PAGE_RESTORED' };

export const LOGIN_MESSAGES = {
  welcome: 'Welcome to the PGI Portal',
  rejected: "Sorry, you're not in PGI",
  authFailed: 'Authentication failed. Please try again.',
  noUser: 'Could not retrieve your account. Please try again.',
  oauthFailed: 'Failed to log in. Please try again or contact support.',
  postAuthFailed: 'Something went wrong during login. Please try again.',
} as const;

const CALLBACK_ERRORS: Record<string, string> = {
  auth_failed: LOGIN_MESSAGES.authFailed,
  no_user: LOGIN_MESSAGES.noUser,
};

interface ParamReader {
  get(name: string): string | null;
}

/** Initial state from the query params set by /auth/callback */
export function parseLoginParams(params: ParamReader | null): LoginState {
  if (params?.get('notMember') === 'true')
    return { kind: 'rejected', error: null };
  if (params?.get('authenticated') === 'true') return { kind: 'postAuth' };
  const callbackError = CALLBACK_ERRORS[params?.get('error') ?? ''];
  return {
    kind: 'welcome',
    error: callbackError
      ? { source: 'callback', message: callbackError }
      : null,
  };
}

/** Whether a URL hash carries an OAuth error that means "not allowed in" */
export function isOAuthRejectionHash(hash: string): boolean {
  if (!hash || !hash.includes('error=')) return false;
  const hashParams = new URLSearchParams(hash.substring(1));
  const errorType = hashParams.get('error');
  const errorCode = hashParams.get('error_code');
  return (
    errorType === 'access_denied' ||
    errorCode === 'signup_disabled' ||
    errorCode === 'user_not_found'
  );
}

export function loginReducer(state: LoginState, event: LoginEvent): LoginState {
  switch (event.type) {
    case 'URL_HASH':
      return state.kind === 'welcome' && isOAuthRejectionHash(event.hash)
        ? { kind: 'rejected', error: null }
        : state;
    case 'OAUTH_STARTED':
      return state.kind === 'welcome' || state.kind === 'rejected'
        ? { kind: 'redirecting', from: state.kind }
        : state;
    case 'OAUTH_FAILED':
      return state.kind === 'redirecting'
        ? {
            kind: state.from,
            error: { source: 'client', message: LOGIN_MESSAGES.oauthFailed },
          }
        : state;
    case 'POST_AUTH_FAILED':
      return state.kind === 'postAuth'
        ? {
            kind: 'welcome',
            error: {
              source: 'client',
              message: LOGIN_MESSAGES.postAuthFailed,
            },
          }
        : state;
    case 'PAGE_RESTORED':
      return state.kind === 'redirecting'
        ? { kind: state.from, error: null }
        : state;
    default:
      return state;
  }
}

/** The screen to show: a sign-in started from `rejected` keeps that screen */
export function loginScreen(state: LoginState): LoginScreen {
  if (state.kind === 'rejected') return 'rejected';
  if (state.kind === 'redirecting') return state.from;
  return 'welcome';
}

/** Heading shown while the transition machine is idle */
export function loginHeading(state: LoginState): string {
  return loginScreen(state) === 'rejected'
    ? LOGIN_MESSAGES.rejected
    : LOGIN_MESSAGES.welcome;
}

/** The error to show, if any (only on a sign-in screen) */
export function loginError(state: LoginState): LoginError | null {
  return state.kind === 'welcome' || state.kind === 'rejected'
    ? state.error
    : null;
}

/**
 * Whether to run the post-auth step (load user, start login:morph). Not when
 * the morph already completed: pressing Back onto `?authenticated=true`
 * remounts this page in postAuth, and it should just navigate on.
 */
export function shouldStartPostAuth(
  state: LoginState,
  tag: MachineTag,
  flow: TransitionFlow | null
): boolean {
  return (
    state.kind === 'postAuth' && !(tag === 'complete' && flow === 'login:morph')
  );
}

/** The Google button is disabled while a sign-in is already under way */
export function isSigningIn(state: LoginState): boolean {
  return state.kind === 'redirecting' || state.kind === 'postAuth';
}
