import { NextResponse } from 'next/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Cron job endpoint to clean up old observability data.
 * Called by Vercel Cron (configured in vercel.json).
 *
 * Security: Vercel adds CRON_SECRET header automatically for cron requests.
 * Manual calls require the same secret in Authorization header.
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require secret. In dev, allow without secret for testing.
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('[cron/cleanup] CRON_SECRET not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = requireSupabaseAdminClient();

    // Call the cleanup function we defined in the migration
    const { error } = await supabase.rpc('cleanup_observability_data');

    if (error) {
      console.error('[cron/cleanup] Database error:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('[cron/cleanup] Observability data cleanup completed');
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[cron/cleanup] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
