import {
  linkedAccountsReducer as reduce,
  type LinkedAccountsState,
} from './linkedAccounts';

type S = LinkedAccountsState<string>;

const ready = (error: string | null = null): S => ({
  status: 'ready',
  identities: ['a', 'b'],
  error,
});

describe('linkedAccountsReducer', () => {
  it('keeps an auth_error reported before identities load', () => {
    let s: S = { status: 'loading', error: null };
    s = reduce(s, { type: 'SHOW_ERROR', message: 'cancelled' });
    s = reduce(s, { type: 'LOADED', identities: ['a'] });
    expect(s).toEqual({
      status: 'ready',
      identities: ['a'],
      error: 'cancelled',
    });
  });

  it('clears the error when linking starts and restores ready on failure', () => {
    const linking = reduce(ready('old'), { type: 'LINK_START' });
    expect(linking).toEqual({ status: 'linking', identities: ['a', 'b'] });
    expect(reduce(linking, { type: 'LINK_FAILED', message: 'boom' })).toEqual(
      ready('boom')
    );
  });

  it('unlinks one identity at a time', () => {
    const unlinking = reduce(ready(), {
      type: 'UNLINK_START',
      identityId: 'b',
    });
    expect(unlinking).toEqual({
      status: 'unlinking',
      identities: ['a', 'b'],
      identityId: 'b',
    });
    expect(reduce(unlinking, { type: 'LINK_START' })).toBe(unlinking);
    expect(reduce(unlinking, { type: 'UNLINK_START', identityId: 'a' })).toBe(
      unlinking
    );
    expect(
      reduce(unlinking, { type: 'UNLINK_DONE', identities: ['a'], error: null })
    ).toEqual({ status: 'ready', identities: ['a'], error: null });
  });

  it('cannot link or unlink before identities load', () => {
    const loading: S = { status: 'loading', error: null };
    expect(reduce(loading, { type: 'LINK_START' })).toBe(loading);
    expect(reduce(loading, { type: 'UNLINK_START', identityId: 'a' })).toBe(
      loading
    );
  });
});
