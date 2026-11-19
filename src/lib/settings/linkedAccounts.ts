/**
 * Linked Google accounts state machine (settings page).
 *
 *   loading ──LOADED──▶ ready ──LINK_START──▶ linking ──(redirect to Google)
 *                         ▲  │                   └──LINK_FAILED──▶ ready + error
 *                         │  └──UNLINK_START──▶ unlinking ──UNLINK_DONE──▶ ready
 *
 * A failed link that went through Google comes back as `?auth_error`, which
 * the page reports with SHOW_ERROR.
 */

export type LinkedAccountsState<I> =
  | { status: 'loading'; error: string | null }
  | { status: 'ready'; identities: I[]; error: string | null }
  | { status: 'linking'; identities: I[] }
  | { status: 'unlinking'; identities: I[]; identityId: string };

export type LinkedAccountsEvent<I> =
  | { type: 'LOADED'; identities: I[] }
  | { type: 'SHOW_ERROR'; message: string }
  | { type: 'LINK_START' }
  | { type: 'LINK_FAILED'; message: string }
  | { type: 'UNLINK_START'; identityId: string }
  | { type: 'UNLINK_DONE'; identities: I[]; error: string | null };

export function linkedAccountsReducer<I>(
  state: LinkedAccountsState<I>,
  event: LinkedAccountsEvent<I>
): LinkedAccountsState<I> {
  switch (event.type) {
    case 'LOADED':
      if (state.status !== 'loading') return state;
      return {
        status: 'ready',
        identities: event.identities,
        error: state.error,
      };

    case 'SHOW_ERROR':
      if (state.status !== 'loading' && state.status !== 'ready') return state;
      return { ...state, error: event.message };

    case 'LINK_START':
      if (state.status !== 'ready') return state;
      return { status: 'linking', identities: state.identities };

    case 'LINK_FAILED':
      if (state.status !== 'linking') return state;
      return {
        status: 'ready',
        identities: state.identities,
        error: event.message,
      };

    case 'UNLINK_START':
      if (state.status !== 'ready') return state;
      return {
        status: 'unlinking',
        identities: state.identities,
        identityId: event.identityId,
      };

    case 'UNLINK_DONE':
      if (state.status !== 'unlinking') return state;
      return {
        status: 'ready',
        identities: event.identities,
        error: event.error,
      };

    default:
      return state;
  }
}
