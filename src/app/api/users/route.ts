import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export async function GET(req: NextRequest) {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    const school = params.get('school') || undefined;
    const program = params.get('program') || undefined;
    const role = params.get('role') || undefined;
    const search = params.get('search') || undefined;
    const status = params.get('status') || undefined;

    const db = createDatabase();
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
