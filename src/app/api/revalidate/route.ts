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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
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
