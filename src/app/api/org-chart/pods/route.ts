import { NextRequest } from 'next/server';
import { createPod } from '@/lib/org-chart-edit';
import { readBody, runEdit } from '../_lib';

export const dynamic = 'force-dynamic';

/** Admins: create a pod (`{ program, focus? }`); its number is assigned. */
export async function POST(req: NextRequest) {
  const body = await readBody(req);
  return runEdit((db, editor) => createPod(db, editor, body));
}
