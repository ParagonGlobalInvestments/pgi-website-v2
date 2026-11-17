import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { requireMember } from '@/lib/auth/requireMember';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireMember();
    if (auth.error) return auth.error;

    const params = req.nextUrl.searchParams;
    const school = params.get('school') || undefined;
    const program = params.get('program') || undefined;
    const role = params.get('role') || undefined;
    const search = params.get('search') || undefined;
    const status = params.get('status') || undefined;

    const db = createDatabase(requireSupabaseAdminClient());
    const users = await db.getUsers({ school, program, role, search, status });

    return NextResponse.json(
      { success: true, users },
      {
        headers: {
          // Use private caching - member directory should not be cached in shared CDN
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
