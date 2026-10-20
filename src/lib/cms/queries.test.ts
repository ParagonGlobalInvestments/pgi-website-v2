/** @jest-environment node */

import { getCmsStatistics } from './queries';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

describe('CMS cache policy', () => {
  const fetchMock = jest.mocked(fetch);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
    });
    fetchMock.mockResolvedValue(
      new Response('[]', { headers: { 'Content-Type': 'application/json' } })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('applies the shared fallback to public CMS reads while preserving authorization', async () => {
    await getCmsStatistics();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/rest/v1/cms_statistics'),
      expect.objectContaining({ next: { revalidate: 300 } })
    );
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('authorization')).toBe('Bearer test-service-role');
  });

  it('bypasses persistent caching during local development', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'development',
    });
    await getCmsStatistics();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ next: { revalidate: 0 } })
    );
  });

  it('does not apply public CMS caching to other admin operations', async () => {
    await requireSupabaseAdminClient()
      .from('users')
      .update({ name: 'Updated' })
      .eq('id', 'test-user');

    const options = fetchMock.mock.calls[0][1];
    expect(options?.method).toBe('PATCH');
    expect(options?.next).toBeUndefined();
  });
});
