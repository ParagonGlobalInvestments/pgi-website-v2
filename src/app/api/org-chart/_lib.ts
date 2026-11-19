import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  editErrorResponse,
  requireOrgChartEditor,
} from '@/lib/auth/requireOrgChartEditor';
import { getPodRoster } from '@/lib/org-chart';
import type { Editor, UndoRef } from '@/lib/org-chart-edit';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

/** The request's JSON body, or {} when it has none. */
export async function readBody(
  req: NextRequest
): Promise<Record<string, unknown>> {
  const body: unknown = await req.json().catch(() => null);
  return body && typeof body === 'object'
    ? (body as Record<string, unknown>)
    : {};
}

/**
 * Run an org chart edit as the signed-in member and answer with the updated
 * roster, plus how to undo the edit when it can be undone:
 * `{ success: true, data: { roster, undo } }`.
 */
export async function runEdit(
  edit: (db: SupabaseClient, editor: Editor) => Promise<UndoRef | null | void>
): Promise<NextResponse> {
  const auth = await requireOrgChartEditor();
  if (auth.error) return auth.error;

  try {
    const db = requireSupabaseAdminClient();
    const undo = (await edit(db, auth.editor)) ?? null;
    const roster = await getPodRoster(db);
    return NextResponse.json({ success: true, data: { roster, undo } });
  } catch (err) {
    return editErrorResponse(err);
  }
}

/** Run a read as the signed-in member: `{ success: true, data }`. */
export async function runRead<T>(
  read: (db: SupabaseClient, editor: Editor) => Promise<T>
): Promise<NextResponse> {
  const auth = await requireOrgChartEditor();
  if (auth.error) return auth.error;

  try {
    const data = await read(requireSupabaseAdminClient(), auth.editor);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return editErrorResponse(err);
  }
}
