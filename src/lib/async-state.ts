/**
 * The lifecycle of data loaded from the network. Replaces the
 * `loading` + `error` + `data` trio of independent flags, which allowed
 * contradictory combinations (e.g. loading with an error showing).
 *
 * Once data has loaded it is never discarded: a refetch marks it
 * `refreshing`, and a failed refetch keeps the previous data. `error` is
 * only reached when there was never any data to show.
 */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T; refreshing: boolean };

export const LOADING: AsyncState<never> = { status: 'loading' };

export function ready<T>(data: T): AsyncState<T> {
  return { status: 'ready', data, refreshing: false };
}

export function failed<T = never>(message: string): AsyncState<T> {
  return { status: 'error', message };
}

/** A fetch started: keep loaded data (refreshing) or go back to loading. */
export function startFetch<T>(state: AsyncState<T>): AsyncState<T> {
  if (state.status === 'ready') {
    return state.refreshing ? state : { ...state, refreshing: true };
  }
  return state.status === 'loading' ? state : LOADING;
}

/** A fetch failed: keep loaded data if there is any, otherwise error. */
export function fetchFailed<T>(
  state: AsyncState<T>,
  message: string
): AsyncState<T> {
  return state.status === 'ready'
    ? { ...state, refreshing: false }
    : failed(message);
}

/** True while any fetch is in flight, including a refresh of loaded data. */
export function isFetching<T>(state: AsyncState<T>): boolean {
  return (
    state.status === 'loading' || (state.status === 'ready' && state.refreshing)
  );
}

/** Apply an update to loaded data; any other state is returned unchanged. */
export function mapReady<T>(
  state: AsyncState<T>,
  update: (data: T) => T
): AsyncState<T> {
  return state.status === 'ready'
    ? { ...state, data: update(state.data) }
    : state;
}

/** The loaded data, or `fallback` while loading or after an error. */
export function dataOr<T>(state: AsyncState<T>, fallback: T): T {
  return state.status === 'ready' ? state.data : fallback;
}
