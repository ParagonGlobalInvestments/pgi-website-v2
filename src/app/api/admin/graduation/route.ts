import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidatePeople } from '@/lib/cms/revalidate';
import {
  getGraduatedClassYear,
  type GraduationCandidate,
  type GraduationOverview,
} from '@/lib/graduation';

export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Keep `id=in.(…)` filters well under URL length limits. */
const UPDATE_CHUNK_SIZE = 100;
const MAX_USER_IDS = 2000;

interface CandidateRow {
  id: string;
  name: string;
  email: string | null;
  school: string | null;
  graduation_year: number;
  role: string;
  program: string | null;
}

async function listCandidates(
  supabase: SupabaseClient,
  classYear: number
): Promise<GraduationCandidate[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, school, graduation_year, role, program')
    .eq('status', 'active')
    .not('graduation_year', 'is', null)
    .lte('graduation_year', classYear)
    .order('graduation_year', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return ((data as CandidateRow[] | null) ?? []).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    school: row.school,
    graduationYear: row.graduation_year,
    role: row.role,
    program: row.program,
  }));
}

/** List active members whose class has graduated. */
export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const supabase = requireSupabaseAdminClient();
    const classYear = getGraduatedClassYear();
    const candidates = await listCandidates(supabase, classYear);
    const data: GraduationOverview = { classYear, candidates };
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to load graduation list';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * Graduate the selected members (status → alumni).
 * Body: { userIds: string[] }. IDs that are not current candidates are skipped,
 * so a stale page can't graduate someone whose class hasn't graduated.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const rawIds = (body as { userIds?: unknown } | null)?.userIds;
  if (
    !Array.isArray(rawIds) ||
    rawIds.length === 0 ||
    rawIds.length > MAX_USER_IDS ||
    !rawIds.every(id => typeof id === 'string' && UUID_RE.test(id))
  ) {
    return NextResponse.json(
      {
        success: false,
        error: 'userIds must be a non-empty array of user IDs',
      },
      { status: 400 }
    );
  }

  const userIds = Array.from(new Set(rawIds as string[]));

  try {
    const supabase = requireSupabaseAdminClient();
    const classYear = getGraduatedClassYear();
    const graduatedIds: string[] = [];

    for (let i = 0; i < userIds.length; i += UPDATE_CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + UPDATE_CHUNK_SIZE);
      const { data, error } = await supabase
        .from('users')
        .update({ status: 'alumni' })
        .in('id', chunk)
        .eq('status', 'active')
        .lte('graduation_year', classYear)
        .select('id');

      if (error) throw error;
      for (const row of data ?? []) graduatedIds.push(row.id as string);
    }

    if (graduatedIds.length > 0) revalidatePeople();

    return NextResponse.json({
      success: true,
      data: {
        classYear,
        graduated: graduatedIds.length,
        skipped: userIds.length - graduatedIds.length,
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to graduate members';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
