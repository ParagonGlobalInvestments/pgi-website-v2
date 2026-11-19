import type { User } from '@supabase/supabase-js';
import {
  initialShellState,
  needsSignOut,
  shellAuthFrom,
  shellReducer,
  type ShellState,
} from './portalShellState';

const login: ShellState = { mode: 'login' };
const dashboard: ShellState = { mode: 'dashboard', entrance: 'none' };

describe('shellReducer', () => {
  it('starts from the server-provided mode', () => {
    expect(initialShellState('login')).toEqual(login);
    expect(initialShellState('dashboard')).toEqual(dashboard);
  });

  it('enters the dashboard with a sidebar entrance when the morph completes', () => {
    const entering = shellReducer(login, { type: 'MORPH_COMPLETED' });
    expect(entering).toEqual({ mode: 'dashboard', entrance: 'morph' });
    expect(shellReducer(entering, { type: 'ENTRANCE_SETTLED' })).toEqual(
      dashboard
    );
  });

  it('ignores a morph completion when already on the dashboard', () => {
    expect(shellReducer(dashboard, { type: 'MORPH_COMPLETED' })).toBe(
      dashboard
    );
  });

  it('returns to login when the session ends', () => {
    expect(shellReducer(dashboard, { type: 'SIGNED_OUT' })).toEqual(login);
    expect(
      shellReducer(
        { mode: 'dashboard', entrance: 'morph' },
        { type: 'SIGNED_OUT' }
      )
    ).toEqual(login);
    expect(shellReducer(login, { type: 'SIGNED_OUT' })).toBe(login);
  });
});

describe('needsSignOut', () => {
  const signedOut = { status: 'signedOut' } as const;
  const signedIn = { status: 'signedIn', user: { id: 'u1' } as User } as const;
  const loading = { status: 'loading' } as const;

  it('is true whenever the dashboard shows without a session', () => {
    expect(needsSignOut(dashboard, signedOut)).toBe(true);
    expect(needsSignOut(dashboard, signedIn)).toBe(false);
    expect(needsSignOut(dashboard, loading)).toBe(false);
    expect(needsSignOut(login, signedOut)).toBe(false);
  });

  it('catches a morph that completes after the session already ended', () => {
    // signedOut first, then MORPH_COMPLETED: the check must fire again
    expect(needsSignOut(login, signedOut)).toBe(false);
    const afterMorph = shellReducer(login, { type: 'MORPH_COMPLETED' });
    expect(needsSignOut(afterMorph, signedOut)).toBe(true);
    expect(shellReducer(afterMorph, { type: 'SIGNED_OUT' })).toEqual(login);
  });
});

describe('shellAuthFrom', () => {
  it('maps a session user to signedIn and nothing to signedOut', () => {
    const user = { id: 'u1' } as User;
    expect(shellAuthFrom(user)).toEqual({ status: 'signedIn', user });
    expect(shellAuthFrom(null)).toEqual({ status: 'signedOut' });
    expect(shellAuthFrom(undefined)).toEqual({ status: 'signedOut' });
  });
});
