import {
  LOGIN_MESSAGES,
  isOAuthRejectionHash,
  isSigningIn,
  loginError,
  loginHeading,
  loginReducer,
  loginScreen,
  parseLoginParams,
  shouldStartPostAuth,
  type LoginState,
} from './loginState';

const params = (query: string) => new URLSearchParams(query);
const welcome: LoginState = { kind: 'welcome', error: null };
const rejected: LoginState = { kind: 'rejected', error: null };
const oauthFailed = {
  source: 'client',
  message: LOGIN_MESSAGES.oauthFailed,
} as const;

describe('parseLoginParams', () => {
  it('defaults to the welcome screen', () => {
    expect(parseLoginParams(params(''))).toEqual(welcome);
    expect(parseLoginParams(null)).toEqual(welcome);
  });

  it('maps the callback flags to states', () => {
    expect(parseLoginParams(params('notMember=true'))).toEqual(rejected);
    expect(
      parseLoginParams(params('authenticated=true&redirectTo=/portal/x'))
    ).toEqual({ kind: 'postAuth' });
  });

  it('turns known callback errors into a callback error', () => {
    expect(parseLoginParams(params('error=auth_failed'))).toEqual({
      kind: 'welcome',
      error: { source: 'callback', message: LOGIN_MESSAGES.authFailed },
    });
    expect(parseLoginParams(params('error=no_user'))).toEqual({
      kind: 'welcome',
      error: { source: 'callback', message: LOGIN_MESSAGES.noUser },
    });
    expect(parseLoginParams(params('error=something_else'))).toEqual(welcome);
  });
});

describe('isOAuthRejectionHash', () => {
  it.each([
    ['#error=access_denied', true],
    ['#error=server_error&error_code=signup_disabled', true],
    ['#error=server_error&error_code=user_not_found', true],
    ['#error=server_error&error_code=other', false],
    ['#access_token=abc', false],
    ['', false],
  ])('%s → %s', (hash, expected) => {
    expect(isOAuthRejectionHash(hash)).toBe(expected);
  });
});

describe('loginReducer', () => {
  it('rejects on an OAuth rejection hash, only from welcome', () => {
    const hash = { type: 'URL_HASH', hash: '#error=access_denied' } as const;
    expect(loginReducer(welcome, hash)).toEqual(rejected);
    expect(loginReducer({ kind: 'postAuth' }, hash)).toEqual({
      kind: 'postAuth',
    });
    expect(loginReducer(welcome, { type: 'URL_HASH', hash: '' })).toBe(welcome);
  });

  it('starts OAuth from welcome or rejected, remembering where from', () => {
    const withError: LoginState = {
      kind: 'welcome',
      error: { source: 'callback', message: LOGIN_MESSAGES.authFailed },
    };
    expect(loginReducer(withError, { type: 'OAUTH_STARTED' })).toEqual({
      kind: 'redirecting',
      from: 'welcome',
    });
    expect(loginReducer(rejected, { type: 'OAUTH_STARTED' })).toEqual({
      kind: 'redirecting',
      from: 'rejected',
    });
    expect(
      loginReducer({ kind: 'postAuth' }, { type: 'OAUTH_STARTED' })
    ).toEqual({ kind: 'postAuth' });
  });

  it('returns to the originating screen with a client error when OAuth fails to start', () => {
    expect(
      loginReducer(
        { kind: 'redirecting', from: 'welcome' },
        { type: 'OAUTH_FAILED' }
      )
    ).toEqual({ kind: 'welcome', error: oauthFailed });
    expect(
      loginReducer(
        { kind: 'redirecting', from: 'rejected' },
        { type: 'OAUTH_FAILED' }
      )
    ).toEqual({ kind: 'rejected', error: oauthFailed });
  });

  it('returns to welcome with a client error when the post-auth step fails', () => {
    expect(
      loginReducer({ kind: 'postAuth' }, { type: 'POST_AUTH_FAILED' })
    ).toEqual({
      kind: 'welcome',
      error: { source: 'client', message: LOGIN_MESSAGES.postAuthFailed },
    });
    expect(loginReducer(welcome, { type: 'POST_AUTH_FAILED' })).toBe(welcome);
  });

  it('re-enables sign-in on the originating screen when restored from bfcache', () => {
    expect(
      loginReducer(
        { kind: 'redirecting', from: 'welcome' },
        { type: 'PAGE_RESTORED' }
      )
    ).toEqual(welcome);
    expect(
      loginReducer(
        { kind: 'redirecting', from: 'rejected' },
        { type: 'PAGE_RESTORED' }
      )
    ).toEqual(rejected);
    expect(loginReducer(rejected, { type: 'PAGE_RESTORED' })).toBe(rejected);
  });
});

describe('derived view', () => {
  it('keeps the rejected screen while redirecting from it', () => {
    expect(loginScreen(rejected)).toBe('rejected');
    expect(loginScreen({ kind: 'redirecting', from: 'rejected' })).toBe(
      'rejected'
    );
    expect(loginScreen({ kind: 'redirecting', from: 'welcome' })).toBe(
      'welcome'
    );
    expect(loginScreen({ kind: 'postAuth' })).toBe('welcome');
  });

  it('shows the rejection heading on the rejected screen only', () => {
    expect(loginHeading(rejected)).toBe(LOGIN_MESSAGES.rejected);
    expect(loginHeading({ kind: 'redirecting', from: 'rejected' })).toBe(
      LOGIN_MESSAGES.rejected
    );
    expect(loginHeading(welcome)).toBe(LOGIN_MESSAGES.welcome);
    expect(loginHeading({ kind: 'postAuth' })).toBe(LOGIN_MESSAGES.welcome);
  });

  it('shows errors only on a sign-in screen', () => {
    expect(loginError({ kind: 'rejected', error: oauthFailed })).toEqual(
      oauthFailed
    );
    expect(loginError({ kind: 'welcome', error: oauthFailed })).toEqual(
      oauthFailed
    );
    expect(loginError({ kind: 'redirecting', from: 'welcome' })).toBeNull();
    expect(loginError({ kind: 'postAuth' })).toBeNull();
  });

  it('disables sign-in while redirecting or finishing a sign-in', () => {
    expect(isSigningIn({ kind: 'redirecting', from: 'welcome' })).toBe(true);
    expect(isSigningIn({ kind: 'postAuth' })).toBe(true);
    expect(isSigningIn(welcome)).toBe(false);
    expect(isSigningIn(rejected)).toBe(false);
  });
});

describe('shouldStartPostAuth', () => {
  it('runs the post-auth step when returning from OAuth', () => {
    expect(shouldStartPostAuth({ kind: 'postAuth' }, 'idle', null)).toBe(true);
  });

  it('skips it when the login morph already completed (Back onto the page)', () => {
    expect(
      shouldStartPostAuth({ kind: 'postAuth' }, 'complete', 'login:morph')
    ).toBe(false);
    expect(
      shouldStartPostAuth({ kind: 'postAuth' }, 'complete', 'exit:back')
    ).toBe(true);
  });

  it('never runs outside postAuth', () => {
    expect(shouldStartPostAuth(welcome, 'idle', null)).toBe(false);
  });
});
