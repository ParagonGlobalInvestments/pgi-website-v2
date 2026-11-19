import { NextRequest } from 'next/server';
import { addMember } from '@/lib/org-chart-edit';
import { readBody, runEdit } from '../_lib';

export const dynamic = 'force-dynamic';

/** Admins: add a member who isn't on the org chart yet, as an analyst. */
export async function POST(req: NextRequest) {
  const body = await readBody(req);
  return runEdit((db, editor) =>
    addMember(db, editor, {
      userId: body.userId as string,
      podId: (body.podId ?? null) as string | null,
    })
  );
}
