import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'resources_page' } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get client info for analytics
    const userAgent = req.headers.get('user-agent') || null;
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || null;
    const referrer = req.headers.get('referer') || null;

    // Use Supabase function to add signup
    const supabase = createClient();
    const { data, error } = await supabase.rpc('add_newsletter_signup', {
      p_email: email,
      p_signup_source: source,
      p_user_agent: userAgent,
      p_ip_address: ipAddress,
      p_referrer: referrer,
    });

    if (error) {
      console.error('Newsletter signup error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to PGI newsletter!',
      id: result.signup_id,
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// GET endpoint for admin stats
export async function GET(_req: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('org_permission_level')
      .eq('system_supabase_id', user.id)
      .single();

    if (userError || userData?.org_permission_level !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get newsletter stats
    const { data: stats, error: statsError } = await supabase.rpc(
      'get_newsletter_stats'
    );

    if (statsError) {
      throw statsError;
    }

    return NextResponse.json({
      success: true,
      stats: stats[0],
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter stats' },
      { status: 500 }
    );
  }
}
