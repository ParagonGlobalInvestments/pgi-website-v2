import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createRateLimiter } from '@/lib/observability/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Per-IP fixed window (in memory; per isolate on Workers)
const checkRateLimit = createRateLimiter({
  limit: 50,
  windowMs: 60 * 1000,
});

interface PageviewPayload {
  eventType?: 'pageview' | 'event';
  eventName?: string;
  path: string;
  route?: string;
  referrer?: string;
  sessionId?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  deploymentId?: string;
}

function validatePayload(data: unknown): data is PageviewPayload {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;

  return (
    typeof p.path === 'string' &&
    p.path.length > 0 &&
    p.path.length <= 500 &&
    (p.eventType === undefined || ['pageview', 'event'].includes(p.eventType as string))
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();

    if (!validatePayload(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const record = {
      event_type: body.eventType || 'pageview',
      event_name: body.eventName?.slice(0, 100) || null,
      path: body.path.slice(0, 500),
      route: body.route?.slice(0, 500) || null,
      referrer: body.referrer?.slice(0, 500) || null,
      session_id: body.sessionId?.slice(0, 100) || null,
      device_type: body.deviceType?.slice(0, 50) || null,
      browser: body.browser?.slice(0, 100) || null,
      os: body.os?.slice(0, 100) || null,
      deployment_id: body.deploymentId?.slice(0, 100) || null,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    };

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, note: 'Observability disabled' });
    }

    const { error } = await supabase.from('obs_pageviews').insert(record);

    if (error) {
      console.error('Failed to insert pageview:', error.message);
      return NextResponse.json({ success: true, note: 'Storage unavailable' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Pageviews endpoint error:', err);
    return NextResponse.json({ success: true });
  }
}
