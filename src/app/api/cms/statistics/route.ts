import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { revalidateStatistics } from '@/lib/cms/revalidate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase
      .from('cms_statistics')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to fetch statistics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          error: 'items must be an array of { key, label, value, sort_order }',
        },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.key || !item.label || typeof item.value !== 'string') {
        return NextResponse.json(
          {
            error:
              'Each item must have key, label (strings) and value (string)',
          },
          { status: 400 }
        );
      }
    }

    const supabase = requireSupabaseAdminClient();

    // Build rows with sort_order
    const rows = items.map(
      (
        item: {
          key: string;
          label: string;
          value: string;
          sort_order?: number;
        },
        idx: number
      ) => ({
        key: String(item.key).trim(),
        label: String(item.label).trim(),
        value: String(item.value).trim(),
        sort_order: item.sort_order ?? idx,
      })
    );
    const incomingKeys = rows.map(r => r.key);

    // Upsert all items (atomic, preserves row IDs for unchanged keys)
    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from('cms_statistics')
        .upsert(rows, { onConflict: 'key' });

      if (upsertError) {
        return NextResponse.json(
          { error: upsertError.message },
          { status: 500 }
        );
      }
    }

    // Delete keys that were removed (not in incoming items)
    // Fetch existing keys and delete those not in incoming set
    if (incomingKeys.length > 0) {
      const { data: existing, error: fetchExistingError } = await supabase
        .from('cms_statistics')
        .select('key');

      if (fetchExistingError) {
        return NextResponse.json(
          { error: fetchExistingError.message },
          { status: 500 }
        );
      }

      const keysToDelete = (existing || [])
        .map(row => row.key)
        .filter(key => !incomingKeys.includes(key));

      if (keysToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cms_statistics')
          .delete()
          .in('key', keysToDelete);

        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message },
            { status: 500 }
          );
        }
      }
    } else {
      // No incoming items = delete all
      const { error: deleteError } = await supabase
        .from('cms_statistics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }
    }

    // Return the fresh data
    const { data, error: fetchError } = await supabase
      .from('cms_statistics')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    revalidateStatistics();
    return NextResponse.json(data ?? []);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to update statistics';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
