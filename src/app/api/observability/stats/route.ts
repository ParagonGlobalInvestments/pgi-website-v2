import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Admin-only endpoint
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '7', 10), 1), 90);
    const path = searchParams.get('path') || null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    const supabase = requireSupabaseAdminClient();

    // Get vitals summary using the function
    const { data: vitalsSummary, error: vitalsError } = await supabase.rpc(
      'get_vitals_summary',
      {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_path: path,
      }
    );

    if (vitalsError) {
      console.error('Vitals summary error:', vitalsError);
    }

    // Get hourly trends
    const { data: hourlyTrends, error: trendsError } = await supabase.rpc(
      'get_vitals_trends',
      {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_metric_type: null,
      }
    );

    if (trendsError) {
      console.error('Trends error:', trendsError);
    }

    // Get page analytics
    const { data: pageAnalytics, error: pageError } = await supabase.rpc(
      'get_page_analytics',
      {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_limit: 20,
      }
    );

    if (pageError) {
      console.error('Page analytics error:', pageError);
    }

    // Get total pageviews count
    const { count: totalPageviews } = await supabase
      .from('obs_pageviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .eq('event_type', 'pageview');

    // Get unique sessions count
    const { data: sessionsData } = await supabase
      .from('obs_pageviews')
      .select('session_id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .eq('event_type', 'pageview')
      .not('session_id', 'is', null);

    const uniqueSessions = new Set(sessionsData?.map(s => s.session_id)).size;

    // Get device breakdown
    const { data: deviceData } = await supabase
      .from('obs_pageviews')
      .select('device_type')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .eq('event_type', 'pageview');

    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      unknown: 0,
    };

    deviceData?.forEach(d => {
      const type = d.device_type?.toLowerCase() || 'unknown';
      if (type in deviceBreakdown) {
        deviceBreakdown[type as keyof typeof deviceBreakdown]++;
      } else {
        deviceBreakdown.unknown++;
      }
    });

    // Get recent errors
    const { data: recentErrors } = await supabase
      .from('obs_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get error count by type
    const errorsByType: Record<string, number> = {};
    recentErrors?.forEach(err => {
      errorsByType[err.error_type] = (errorsByType[err.error_type] || 0) + 1;
    });

    // Get daily pageview trends
    const { data: dailyPageviews } = await supabase
      .from('obs_pageviews')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .eq('event_type', 'pageview');

    const dailyTrends: Record<string, number> = {};
    dailyPageviews?.forEach(pv => {
      const day = pv.created_at.split('T')[0];
      dailyTrends[day] = (dailyTrends[day] || 0) + 1;
    });

    const dailyPageviewArray = Object.entries(dailyTrends)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));

    return NextResponse.json({
      success: true,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
      vitals: {
        summary: vitalsSummary || [],
        trends: hourlyTrends || [],
      },
      traffic: {
        totalPageviews: totalPageviews || 0,
        uniqueSessions,
        deviceBreakdown,
        dailyTrends: dailyPageviewArray,
        topPages: pageAnalytics || [],
      },
      errors: {
        recent: recentErrors || [],
        byType: errorsByType,
        total: recentErrors?.length || 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch analytics data';
    console.error('Analytics API error:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
