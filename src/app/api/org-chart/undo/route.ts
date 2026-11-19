import { NextRequest } from 'next/server';
import { undoChange } from '@/lib/org-chart-edit';
import { readBody, runEdit } from '../_lib';

export const dynamic = 'force-dynamic';

/** Reverse an edit using the `undo` snapshot that edit returned. */
export async function POST(req: NextRequest) {
  const body = await readBody(req);
  return runEdit((db, editor) => undoChange(db, editor, body));
}
