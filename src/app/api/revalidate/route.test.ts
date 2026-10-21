/** @jest-environment node */

import { revalidatePath } from 'next/cache';
import { POST } from './route';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const PEOPLE_PATHS = [
  '/national-committee/officers',
  '/national-committee/founders',
  '/members/value-team',
  '/members/quant-team',
  '/apply',
];

describe('database cache invalidation', () => {
  const originalSecret = process.env.CMS_REVALIDATION_SECRET;
  const event = { schema: 'public', table: 'cms_people', type: 'DELETE' };

  function request(
    body: unknown = event,
    authorization = 'Bearer test-secret'
  ) {
    return new Request('https://example.com/api/revalidate', {
      method: 'POST',
      headers: { authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.CMS_REVALIDATION_SECRET = 'test-secret';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.CMS_REVALIDATION_SECRET;
    } else {
      process.env.CMS_REVALIDATION_SECRET = originalSecret;
    }
  });

  it('fails closed when the secret is missing', async () => {
    delete process.env.CMS_REVALIDATION_SECRET;
    expect((await POST(request())).status).toBe(503);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each(['', 'Bearer wrong-token', 'Bearer test-secrex', 'test-secret'])(
    'rejects invalid authorization (%s)',
    async authorization => {
      expect((await POST(request(event, authorization))).status).toBe(401);
      expect(revalidatePath).not.toHaveBeenCalled();
    }
  );

  it.each(['INSERT', 'UPDATE', 'DELETE'])(
    'invalidates every people page for %s, including old groups and deleted profiles',
    async type => {
      const response = await POST(
        request({
          ...event,
          type,
          old_record: { group_slug: 'officers' },
          record: type === 'DELETE' ? null : { group_slug: 'founders' },
        })
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(jest.mocked(revalidatePath).mock.calls).toEqual(
        PEOPLE_PATHS.map(path => [path])
      );
    }
  );

  it.each([
    ['cms_people', PEOPLE_PATHS],
    ['users', PEOPLE_PATHS],
    ['alumni_people', PEOPLE_PATHS],
    ['user_public_group_memberships', PEOPLE_PATHS],
    ['alumni_public_group_memberships', PEOPLE_PATHS],
    ['cms_recruitment', ['/apply']],
    ['cms_statistics', ['/']],
    ['cms_timeline', ['/who-we-are']],
    ['cms_sponsors', ['/', '/sponsors']],
    ['resources', ['/api/resources']],
  ])('maps %s changes to the affected routes', async (table, paths) => {
    expect((await POST(request({ ...event, table }))).status).toBe(200);
    expect(jest.mocked(revalidatePath).mock.calls).toEqual(
      (paths as string[]).map(path => [path])
    );
  });

  it.each([
    null,
    [],
    'cms_people',
    {},
    { ...event, schema: 'auth' },
    { ...event, table: 'obs_pageviews' },
    { ...event, table: 'constructor' },
    { ...event, table: '__proto__' },
    { ...event, table: '/arbitrary-path' },
    { ...event, type: 'TRUNCATE' },
  ])('rejects unsupported payload %j', async payload => {
    expect((await POST(request(payload))).status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const req = request();
    jest.spyOn(req, 'json').mockRejectedValue(new SyntaxError('Invalid JSON'));
    expect((await POST(req)).status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('invalidates from metadata headers when the POST body is empty', async () => {
    const req = new Request('https://example.com/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-secret',
        'X-PGI-Schema': 'public',
        'X-PGI-Table': 'user_public_group_memberships',
        'X-PGI-Event': 'UPDATE',
      },
    });
    const json = jest.spyOn(req, 'json');

    expect((await POST(req)).status).toBe(200);
    expect(json).not.toHaveBeenCalled();
    expect(jest.mocked(revalidatePath).mock.calls).toEqual(
      PEOPLE_PATHS.map(path => [path])
    );
  });

  it('requires authorization for metadata headers too', async () => {
    const req = request();
    req.headers.delete('authorization');
    req.headers.set('x-pgi-schema', 'public');
    req.headers.set('x-pgi-table', 'cms_people');
    req.headers.set('x-pgi-event', 'DELETE');

    expect((await POST(req)).status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ['public', 'obs_pageviews', 'UPDATE'],
    ['auth', 'users', 'UPDATE'],
    ['public', 'cms_people', 'TRUNCATE'],
    ['public', 'constructor', 'UPDATE'],
    ['', 'cms_people', 'UPDATE'],
    ['public', 'cms_people', ''],
  ])(
    'rejects unsupported metadata headers (%s, %s, %s)',
    async (schema, table, type) => {
      const req = request();
      req.headers.set('x-pgi-schema', schema);
      req.headers.set('x-pgi-table', table);
      req.headers.set('x-pgi-event', type);

      expect((await POST(req)).status).toBe(400);
      expect(revalidatePath).not.toHaveBeenCalled();
    }
  );

  it('returns a failure when cache invalidation fails so delivery can be monitored', async () => {
    jest.mocked(revalidatePath).mockImplementation(() => {
      throw new Error('Cache unavailable');
    });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      error: 'Failed to revalidate',
    });
  });
});
