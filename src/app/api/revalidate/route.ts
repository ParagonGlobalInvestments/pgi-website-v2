import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { revalidateDatabaseChange } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

// Database webhooks use their own credential, independent of portal availability.
export async function POST(request: Request) {
  const secret = process.env.CMS_REVALIDATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'Revalidation is not configured' },
      { status: 503 }
    );
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const table = request.headers.get('x-pgi-table');
  let payload: unknown;
  if (table !== null) {
    // Metadata headers avoid relying on the body surviving the webhook transport.
    payload = {
      schema: request.headers.get('x-pgi-schema'),
      table,
      type: request.headers.get('x-pgi-event'),
    };
  } else {
    // Keep accepting JSON notifications from existing database webhooks.
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }
  }

  try {
    if (!revalidateDatabaseChange(payload)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported database event' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
