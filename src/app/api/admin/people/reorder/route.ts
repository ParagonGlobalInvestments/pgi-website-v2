import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidatePeople } from '@/lib/cms/revalidate';
import { isMembershipSchemaError, parseExternalPersonId } from '../_lib';

export const dynamic = 'force-dynamic';
const MEMBERSHIP_MIGRATION_ERROR =
  'People membership tables are unavailable. Apply migration 010_alumni_public_memberships.sql first.';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array of { id, sort_order }' },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return NextResponse.json(
          { error: 'Each item must have id (string) and sort_order (number)' },
          { status: 400 }
        );
      }

      const parsed = parseExternalPersonId(item.id);
      if (!parsed) {
        return NextResponse.json(
          {
            error: 'Each item id must be formatted as user:<id> or alumni:<id>',
          },
          { status: 400 }
        );
      }
    }

    const supabase = requireSupabaseAdminClient();

    const updates = items.map((item: { id: string; sort_order: number }) => {
      const parsed = parseExternalPersonId(item.id);
      if (!parsed) {
        throw new Error(`Invalid id format: ${item.id}`);
      }

      if (parsed.type === 'user') {
        return supabase
          .from('user_public_group_memberships')
          .update({ sort_order: item.sort_order })
          .eq('id', parsed.membershipId);
      }

      return supabase
        .from('alumni_public_group_memberships')
        .update({ sort_order: item.sort_order })
        .eq('id', parsed.membershipId);
    });

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) {
      if (isMembershipSchemaError(failed.error)) {
        return NextResponse.json(
          { error: MEMBERSHIP_MIGRATION_ERROR },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: failed.error.message },
        { status: 500 }
      );
    }

    revalidatePeople();
    return NextResponse.json({
      success: true,
      data: { updated: items.length },
    });
  } catch (err) {
    if (isMembershipSchemaError(err)) {
      return NextResponse.json(
        { error: MEMBERSHIP_MIGRATION_ERROR },
        { status: 503 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Failed to reorder people';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
