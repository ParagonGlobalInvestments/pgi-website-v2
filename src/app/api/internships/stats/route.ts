import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Supabase database layer
    const db = createDatabase();
    
    // Get all non-closed internships and calculate stats
    const internships = await db.getInternships({ isClosed: false });
    
    const total = internships.length;
    const quantCount = internships.filter(i => i.track === 'quant').length;
    const valueCount = internships.filter(i => i.track === 'value').length;
    const bothCount = internships.filter(i => i.track === 'both').length;

    // Return stats
    return NextResponse.json({
      total,
      byTrack: {
        quant: quantCount,
        value: valueCount,
        both: bothCount,
      },
    });
  } catch (error) {
    console.error('Error fetching internship stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internship stats' },
      { status: 500 }
    );
  }
}
