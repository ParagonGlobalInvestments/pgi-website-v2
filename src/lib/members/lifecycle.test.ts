import {
  ADMIN_ALLOWLIST_USER_ID,
  GRADUATION_TRANSITION,
  canTransitionStatus,
  getMemberAccess,
  getMemberLifecycle,
  isAdminAllowlistUserId,
  parseMemberStatus,
  requiresChapterSchool,
} from './lifecycle';

const row = (
  overrides: Partial<Parameters<typeof getMemberAccess>[0]> = {}
) => ({
  status: 'active',
  supabase_id: null,
  email: null,
  alternate_emails: [],
  ...overrides,
});

describe('allowlist placeholder', () => {
  it('recognizes only the placeholder id', () => {
    expect(isAdminAllowlistUserId(ADMIN_ALLOWLIST_USER_ID)).toBe(true);
    expect(isAdminAllowlistUserId('admin-allowlist')).toBe(true);
    expect(isAdminAllowlistUserId('3f1c…')).toBe(false);
    expect(isAdminAllowlistUserId(null)).toBe(false);
    expect(isAdminAllowlistUserId(undefined)).toBe(false);
  });
});

describe('status transitions', () => {
  it('allows active ⇄ alumni (graduation and the manual override)', () => {
    expect(canTransitionStatus('active', 'alumni')).toBe(true);
    expect(canTransitionStatus('alumni', 'active')).toBe(true);
    expect(canTransitionStatus('active', 'active')).toBe(false);
    expect(canTransitionStatus('alumni', 'alumni')).toBe(false);
  });

  it('graduation is the active → alumni edge', () => {
    expect(GRADUATION_TRANSITION).toEqual({ from: 'active', to: 'alumni' });
    expect(
      canTransitionStatus(GRADUATION_TRANSITION.from, GRADUATION_TRANSITION.to)
    ).toBe(true);
  });

  it('parses raw status like formatUser does', () => {
    expect(parseMemberStatus('alumni')).toBe('alumni');
    expect(parseMemberStatus('active')).toBe('active');
    expect(parseMemberStatus('')).toBe('active');
    expect(parseMemberStatus(null)).toBe('active');
    expect(parseMemberStatus(undefined)).toBe('active');
  });

  it('requires a chapter school only for active members', () => {
    expect(requiresChapterSchool('active')).toBe(true);
    expect(requiresChapterSchool('alumni')).toBe(false);
  });
});

describe('getMemberAccess', () => {
  it('is linked once supabase_id is set', () => {
    expect(getMemberAccess(row({ supabase_id: 'abc', email: null }))).toBe(
      'linked'
    );
  });

  it('is claimable with a primary or alternate email', () => {
    expect(getMemberAccess(row({ email: 'a@b.edu' }))).toBe('claimable');
    expect(getMemberAccess(row({ alternate_emails: ['a@gmail.com'] }))).toBe(
      'claimable'
    );
  });

  it('ignores stored emails sign-in can never match exactly', () => {
    expect(getMemberAccess(row({ email: 'A@B.edu' }))).toBe('noLogin');
    expect(getMemberAccess(row({ email: ' a@b.edu' }))).toBe('noLogin');
    expect(
      getMemberAccess(row({ email: 'A@B.edu', alternate_emails: ['a@b.edu'] }))
    ).toBe('claimable');
  });

  it('has no login without an id or any email', () => {
    expect(getMemberAccess(row())).toBe('noLogin');
    expect(getMemberAccess(row({ email: '  ', alternate_emails: null }))).toBe(
      'noLogin'
    );
  });
});

describe('getMemberLifecycle', () => {
  it('classifies rows by status and access', () => {
    expect(getMemberLifecycle(row({ email: 'a@b.edu' }))).toEqual({
      kind: 'active',
      access: 'claimable',
    });
    expect(
      getMemberLifecycle(row({ status: 'alumni', supabase_id: 'abc' }))
    ).toEqual({ kind: 'alumni', access: 'linked' });
    expect(getMemberLifecycle(row({ status: 'alumni' }))).toEqual({
      kind: 'alumni',
      access: 'noLogin',
    });
  });

  it('prefers the row over the allowlist', () => {
    expect(
      getMemberLifecycle(row({ supabase_id: 'abc' }), {
        isAdminAllowlist: true,
      })
    ).toEqual({ kind: 'active', access: 'linked' });
  });

  it('falls back to allowlist admin or non-member without a row', () => {
    expect(getMemberLifecycle(null, { isAdminAllowlist: true })).toEqual({
      kind: 'allowlistAdmin',
    });
    expect(getMemberLifecycle(null)).toEqual({ kind: 'nonMember' });
  });
});
