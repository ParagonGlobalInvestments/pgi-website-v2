import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

interface ErrorPayload {
  errorType: string;
  message: string;
  stack?: string;
  path: string;
  route?: string;
  browser?: string;
  os?: string;
  userAgent?: string;
  deploymentId?: string;
}

function validatePayload(data: unknown): data is ErrorPayload {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;

  return (
    typeof p.errorType === 'string' &&
    p.errorType.length > 0 &&
    p.errorType.length <= 50 &&
    typeof p.message === 'string' &&
    p.message.length > 0 &&
    p.message.length <= 2000 &&
    typeof p.path === 'string' &&
    p.path.length > 0 &&
    p.path.length <= 500
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
      error_type: body.errorType.slice(0, 50),
      message: body.message.slice(0, 2000),
      stack: body.stack?.slice(0, 5000) || null,
      path: body.path.slice(0, 500),
      route: body.route?.slice(0, 500) || null,
      browser: body.browser?.slice(0, 100) || null,
      os: body.os?.slice(0, 100) || null,
      user_agent: body.userAgent?.slice(0, 500) || null,
      deployment_id: body.deploymentId?.slice(0, 100) || null,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    };

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, note: 'Observability disabled' });
    }

    const { error } = await supabase.from('obs_errors').insert(record);

    if (error) {
      console.error('Failed to insert error:', error.message);
      return NextResponse.json({ success: true, note: 'Storage unavailable' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errors endpoint error:', err);
    return NextResponse.json({ success: true });
  }
}
