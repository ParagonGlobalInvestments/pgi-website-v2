import { NextRequest } from 'next/server';
import { deletePod, updatePod } from '@/lib/org-chart-edit';
import { readBody, runEdit } from '../../_lib';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** Admins: change a pod's focus (`{ focus }`). */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await readBody(req);
  return runEdit((db, editor) => updatePod(db, editor, id, body));
}

/** Admins: delete a pod. Its people move to "Not in a pod yet". */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  return runEdit((db, editor) => deletePod(db, editor, id));
}
