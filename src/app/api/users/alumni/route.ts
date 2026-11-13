import { NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { requirePortalEnabledOr404 } from '@/lib/runtime';
import {
  pickCurrentCompanies,
  type CompanyExperience,
  type CompanyListing,
} from '@/lib/alumni';
import type { AlumniUser } from '@/types';

export const dynamic = 'force-dynamic';

interface ListingRow {
  user_id: string;
  updated_at: string | null;
  source: { company: string | null } | { company: string | null }[] | null;
}

/** Members-only GET: alumni with their current company (alumni directory) */
export async function GET() {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = await requireSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await createDatabase(supabase).getUsers({
      status: 'alumni',
    });
    const ids = users.map(user => user.id);

    let companies = new Map<string, string>();
    if (ids.length > 0) {
      const admin = requireSupabaseAdminClient();
      const [experienceRes, listingRes] = await Promise.all([
        admin
          .from('experience')
          .select('user_id, company, end_year, sort_order')
          .in('user_id', ids),
        admin
          .from('user_public_group_memberships')
          .select('user_id, updated_at, source:cms_people (company)')
          .in('user_id', ids),
      ]);

      if (experienceRes.error) throw experienceRes.error;
      // Listings only fill gaps; a failure here should not hide the directory.
      const listings: CompanyListing[] = listingRes.error
        ? []
        : ((listingRes.data as ListingRow[] | null) ?? []).map(row => {
            const source = Array.isArray(row.source)
              ? row.source[0]
              : row.source;
            return {
              user_id: row.user_id,
              updated_at: row.updated_at,
              company: source?.company ?? null,
            };
          });

      companies = pickCurrentCompanies(
        (experienceRes.data as CompanyExperience[] | null) ?? [],
        listings
      );
    }

    const alumni: AlumniUser[] = users.map(user => ({
      ...user,
      company: companies.get(user.id) ?? null,
    }));

    return NextResponse.json(
      { success: true, users: alumni },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch alumni';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
