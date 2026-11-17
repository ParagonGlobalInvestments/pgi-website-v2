/** @jest-environment node */

import { NextRequest } from 'next/server';
import { GET } from './route';

jest.mock('@/lib/runtime', () => ({ portalEnabled: true }));
jest.mock('@/lib/supabase/server', () => ({}));
jest.mock('@/lib/auth/checkMembership', () => ({}));

const callback = (query: string) =>
  GET(new NextRequest(`https://paragoninvestments.org/auth/callback?${query}`));

describe('auth callback without a code', () => {
  it('forwards an OAuth error to the requested page', async () => {
    const res = await callback(
      'error_code=identity_already_exists&next=/settings'
    );
    expect(res.headers.get('location')).toBe(
      'https://paragoninvestments.org/settings?auth_error=identity_already_exists'
    );
  });

  it('never redirects off-site', async () => {
    const res = await callback(
      'error=access_denied&next=' + encodeURIComponent('/\\evil.com')
    );
    expect(new URL(res.headers.get('location')!).origin).toBe(
      'https://paragoninvestments.org'
    );
  });
});
