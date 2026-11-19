import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createRateLimiter } from '@/lib/observability/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Per-IP fixed window (in memory; per isolate on Workers)
const checkRateLimit = createRateLimiter({
  limit: 100,
  windowMs: 60 * 1000,
});

// Validation
const VALID_METRICS = ['CLS', 'LCP', 'FCP', 'TTFB', 'INP', 'FID'];
const VALID_RATINGS = ['good', 'needs-improvement', 'poor'];

interface VitalsPayload {
  metricType: string;
  value: number;
  rating?: string;
  path: string;
  route?: string;
  deviceType?: string;
  connectionSpeed?: string;
  browser?: string;
  os?: string;
  deploymentId?: string;
}

function validatePayload(data: unknown): data is VitalsPayload | VitalsPayload[] {
  const items = Array.isArray(data) ? data : [data];

  return items.every(item => {
    if (typeof item !== 'object' || item === null) return false;
    const p = item as Record<string, unknown>;

    return (
      typeof p.metricType === 'string' &&
      VALID_METRICS.includes(p.metricType) &&
      typeof p.value === 'number' &&
      p.value >= 0 &&
      typeof p.path === 'string' &&
      p.path.length > 0 &&
      p.path.length <= 500 &&
      (p.rating === undefined || VALID_RATINGS.includes(p.rating as string))
    );
  });
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

    const items = Array.isArray(body) ? body : [body];

    const records = items.map(item => ({
      metric_type: item.metricType,
      value: item.value,
      rating: item.rating || null,
      path: item.path.slice(0, 500),
      route: item.route?.slice(0, 500) || null,
      device_type: item.deviceType?.slice(0, 50) || null,
      connection_speed: item.connectionSpeed?.slice(0, 20) || null,
      browser: item.browser?.slice(0, 100) || null,
      os: item.os?.slice(0, 100) || null,
      deployment_id: item.deploymentId?.slice(0, 100) || null,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    }));

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      // Gracefully degrade if Supabase not configured
      return NextResponse.json({ success: true, count: 0, note: 'Observability disabled' });
    }

    const { error } = await supabase.from('obs_vitals').insert(records);

    if (error) {
      console.error('Failed to insert vitals:', error.message);
      // Don't fail the request - observability should be non-blocking
      return NextResponse.json({ success: true, count: 0, note: 'Storage unavailable' });
    }

    return NextResponse.json({ success: true, count: records.length });
  } catch (err) {
    console.error('Vitals endpoint error:', err);
    return NextResponse.json({ success: true, count: 0 });
  }
}
