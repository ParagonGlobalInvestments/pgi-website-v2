/** @jest-environment node */

import { requireMember } from './requireMember';
import { checkMembership } from '@/lib/auth/checkMembership';

jest.mock('@/lib/runtime', () => ({ requirePortalEnabledOr404: () => null }));
jest.mock('@/lib/auth/checkMembership', () => ({ checkMembership: jest.fn() }));
jest.mock('@/lib/supabase/server', () => ({
  requireSupabaseServerClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: 'auth-1', email: 'someone@example.com' } },
        error: null,
      }),
    },
  }),
}));

const membership = checkMembership as jest.Mock;

describe('requireMember', () => {
  it('rejects a signed-in non-member', async () => {
    membership.mockResolvedValue({ isMember: false });
    expect((await requireMember()).error?.status).toBe(403);
  });

  it('allows a member', async () => {
    membership.mockResolvedValue({ isMember: true });
    expect((await requireMember()).error).toBeUndefined();
  });
});
