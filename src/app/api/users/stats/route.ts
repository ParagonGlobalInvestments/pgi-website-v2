import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user stats from Supabase
    const db = createDatabase();
    const stats = await db.getUserStats();

    // Return the stats (using the view we created)
    return NextResponse.json({
      totalMembers: stats.totalMembers,
      totalChapters: stats.totalChapters,
      activeMembers: stats.currentStudents,
      byRole: {
        admin: stats.admins,
        lead: stats.leads,
        member: stats.totalMembers - stats.admins - stats.leads,
      },
      byAlumniStatus: {
        alumni: stats.alumni,
        current: stats.currentStudents,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
